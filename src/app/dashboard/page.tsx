import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { normalizeEmail } from "@/lib/validation";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const email = normalizeEmail(session.user.email);
  const [membership, s] = await Promise.all([
    prisma.teamMember.findUnique({
      where: { email },
      include: { team: { include: { members: true } } },
    }),
    getSettings(),
  ]);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          {s.whatsappUrl && (
            <a href={s.whatsappUrl} className="rounded bg-green-600 px-4 py-2 text-sm font-medium">
              Join WhatsApp Community
            </a>
          )}
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button className="text-sm text-slate-400 underline">Sign out</button>
          </form>
        </div>
      </header>

      {!membership && <p>No team yet. The registration form will appear here (Day 2).</p>}
      {membership?.team.status === "pending_approval" && (
        <p>Team <b>{membership.team.name}</b> is under review by the organizers.</p>
      )}
      {membership?.team.status === "rejected" && <p>Your team registration was not approved.</p>}
      {membership?.team.status === "approved" && (
        <p>Team <b>{membership.team.name}</b> is approved. APIs and submission will appear here (Day 4).</p>
      )}
    </main>
  );
}
