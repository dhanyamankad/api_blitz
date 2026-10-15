import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { isAdminEmail } from "@/lib/validation";

export default {
  providers: [
    // hd restricts the Google account chooser; the real enforcement is the server-side check in auth.ts
    Google({ authorization: { params: { hd: "dau.ac.in", prompt: "select_account" } } }),
  ],
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      if (path.startsWith("/admin")) return auth?.user?.role === "admin";
      if (path.startsWith("/dashboard")) return !!auth?.user;
      return true;
    },
    jwt({ token }) {
      token.role = token.email && isAdminEmail(token.email) ? "admin" : "participant";
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role ?? "participant";
      return session;
    },
  },
} satisfies NextAuthConfig;
