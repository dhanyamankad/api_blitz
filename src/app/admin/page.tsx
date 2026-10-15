import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const pending = await prisma.team.count({ where: { status: "pending_approval" } });
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p>{pending} team(s) awaiting approval. Approval queue, API assignment and submissions views come next.</p>
    </main>
  );
}
