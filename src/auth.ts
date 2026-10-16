import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminEmail, normalizeEmail } from "@/lib/validation";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  role: "admin" | "participant";
};

export type Session = {
  user: SessionUser;
};

/**
 * Returns the currently authenticated user's session from Supabase SSR cookies,
 * enriched with their role and profile data from the database.
 * Memoized per-request using React cache to eliminate redundant network roundtrips.
 */
export const auth = cache(async (): Promise<Session | null> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return null;
    }

    const email = normalizeEmail(user.email);
    const role = isAdminEmail(email) ? "admin" : "participant";

    // Attempt to read customized human name from Prisma User
    let name: string | null = null;
    let userId = user.id;

    try {
      const dbUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, role: true },
      });
      if (dbUser) {
        name = dbUser.name;
        userId = dbUser.id;
      }
    } catch {
      // Prisma read fallback
    }

    if (!name) {
      name =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        email;
    }

    return {
      user: {
        id: userId,
        email,
        name,
        role,
      },
    };
  } catch {
    return null;
  }
});

/**
 * Initiates Supabase Google OAuth sign-in.
 */
export async function signIn(
  _provider: string = "google",
  options?: { redirectTo?: string }
) {
  const supabase = await createClient();
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ||
    headerStore.get("host") ||
    "localhost:3000";
  const proto =
    headerStore.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;
  const next = options?.redirectTo || "/dashboard";
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        hd: "dau.ac.in",
        prompt: "select_account",
      },
    },
  });

  if (error) {
    throw error;
  }

  if (data?.url) {
    redirect(data.url);
  }
}

/**
 * Signs out the current user and clears Supabase session cookies.
 */
export async function signOut(options?: { redirectTo?: string }) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(options?.redirectTo || "/login");
}

export const handlers = {
  GET: async () => new Response("Supabase Auth Active"),
  POST: async () => new Response("Supabase Auth Active"),
};
