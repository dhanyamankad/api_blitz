import NextAuth from "next-auth";
import { Role } from "@prisma/client";
import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { isAdminEmail, isDauEmail, normalizeEmail } from "@/lib/validation";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      // Mandatory server-side domain check: the `hd` param alone can be bypassed.
      if (account?.provider !== "google" || !profile?.email || !profile.email_verified) return false;
      const email = normalizeEmail(profile.email);
      if (!isDauEmail(email)) return false;

      const fallbackName = profile.name ?? email;
      const role = isAdminEmail(email) ? Role.admin : Role.participant;
      const user = await prisma.user.upsert({
        where: { email },
        update: { role },
        create: { email, name: fallbackName, role },
      });

      // If a leader already added this person to a team, link their account.
      // We do NOT overwrite the leader's typed name because Google accounts at DAU
      // often have roll numbers/IDs as display names instead of actual human names.
      await prisma.teamMember.updateMany({
        where: { email, userId: null },
        data: { userId: user.id },
      });
      return true;
    },
  },
});
