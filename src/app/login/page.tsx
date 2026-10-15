import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { ShieldCheck, ArrowLeft, AlertCircle, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    if (session.user.role === "admin") {
      redirect("/admin");
    }
    redirect("/dashboard");
  }

  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Back button */}
      <div className="max-w-md w-full mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="MSTC Logo"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-mono text-lg font-bold tracking-tight text-white">
              API BLITZ
            </span>
            <span className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
              2026
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Dhirubhai Ambani University · MSTC
          </p>
        </div>

        {/* Card Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Participant Authentication
            </h1>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Sign in with your DAU Google account to access your squad portal, team registration, and API allotment.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-xs font-mono text-red-300 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Domain Restriction</p>
                <p className="mt-1 text-[11px] text-red-300/90 leading-relaxed">
                  Authentication failed. Only verified <span className="underline">@dau.ac.in</span> accounts are permitted. Personal or third-party Google accounts cannot participate.
                </p>
              </div>
            </div>
          )}

          {/* Google SSO Button */}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-white hover:bg-slate-100 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-md transition-all active:scale-[0.99]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-center gap-2 text-[11px] font-mono text-slate-500">
            <Lock className="h-3 w-3 text-slate-500" />
            <span>Campus SSO · @dau.ac.in Accounts Only</span>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-[11px] text-slate-600 font-mono">
          First-time sign in will automatically link you to your team if your leader registered you.
        </p>
      </div>

      <div className="text-center text-[11px] font-mono text-slate-700">
        API Blitz 2026 · Microsoft Student Technical Club, DAU
      </div>
    </div>
  );
}
