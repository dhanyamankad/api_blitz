import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminEmail, isDauEmail, normalizeEmail } from "@/lib/validation";
import { Role } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user?.email) {
      const email = normalizeEmail(data.user.email);

      // Verify domain strictly
      if (!isDauEmail(email)) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=InvalidDomain`);
      }

      const role = isAdminEmail(email) ? Role.admin : Role.participant;
      const fallbackName =
        data.user.user_metadata?.full_name ??
        data.user.user_metadata?.name ??
        email;

      // Upsert into Prisma User
      const user = await prisma.user.upsert({
        where: { email },
        update: { role },
        create: { email, name: fallbackName, role },
      });

      // Link any team member rows created previously by team leader
      await prisma.teamMember.updateMany({
        where: { email, userId: null },
        data: { userId: user.id },
      });

      // Direct admins straight to /admin
      if (role === Role.admin) {
        return NextResponse.redirect(`${origin}/admin`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=AuthFailed`);
}
