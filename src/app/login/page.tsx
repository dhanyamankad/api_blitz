import { signIn } from "@/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-6 py-24">
      <h1 className="text-3xl font-bold">Login</h1>
      <p className="text-slate-300">Sign in with your @dau.ac.in Google account.</p>
      {error && (
        <p className="rounded border border-red-500 p-3 text-red-300">
          Sign-in failed. Only @dau.ac.in accounts are allowed.
        </p>
      )}
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <button className="w-full rounded bg-sky-500 px-5 py-2 font-medium text-slate-950">
          Continue with Google
        </button>
      </form>
    </main>
  );
}
