import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();

  // Guard: Admin role required
  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch all administrative datasets in parallel
  const [teams, apis, settings] = await Promise.all([
    prisma.team.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        members: {
          orderBy: { isLeader: "desc" },
        },
        assignments: {
          include: {
            api: true,
          },
        },
        submission: true,
      },
    }),
    prisma.api.findMany({
      orderBy: { name: "asc" },
      include: {
        assignments: {
          select: { teamId: true },
        },
      },
    }),
    getSettings(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100">
      <AdminHeader adminEmail={session.user.email} />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-7xl mx-auto w-full">
        {/* Page Title & Context */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono tracking-widest text-slate-500 uppercase">
                MSTC · DHIRUBHAI AMBANI UNIVERSITY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              ADMIN CONTROL SUITE
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Squad verifications, balanced API allotment, submission reviews, and real-time event configuration.
            </p>
          </div>
        </div>

        {/* Client Tabs and Management UI */}
        <AdminDashboardClient
          teams={teams as any}
          apis={apis}
          settings={settings}
        />
      </main>
    </div>
  );
}
