import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSettings, eventPhase, areSubmissionsOpen } from "@/lib/settings";
import { normalizeEmail } from "@/lib/validation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RegistrationForm } from "@/components/dashboard/RegistrationForm";
import { PendingScreen } from "@/components/dashboard/PendingScreen";
import { ApprovedDashboard } from "@/components/dashboard/ApprovedDashboard";
import { RejectedScreen } from "@/components/dashboard/RejectedScreen";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  // Admin users are directly redirected to /admin and no dashboard is shown
  if (session.user.role === "admin") {
    redirect("/admin");
  }

  const email = normalizeEmail(session.user.email);

  const [membership, s] = await Promise.all([
    prisma.teamMember.findUnique({
      where: { email },
      include: {
        team: {
          include: {
            members: true,
            assignments: {
              include: { api: true },
            },
            submission: true,
          },
        },
      },
    }),
    getSettings(),
  ]);

  const phase = eventPhase(s);
  const isSubmissionsOpen = areSubmissionsOpen(s);

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100">
      <DashboardHeader
        user={{
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        }}
        whatsappUrl={s.whatsappUrl}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* State 1: Unregistered Participant -> Show Registration Form */}
        {!membership && (
          <RegistrationForm
            leader={{
              name: session.user.name || email,
              email,
            }}
          />
        )}

        {/* State 2: Team Pending Approval -> Status Screen with Leader Edit Controls */}
        {membership?.team.status === "pending_approval" && (
          <PendingScreen
            team={membership.team}
            currentUserEmail={email}
          />
        )}

        {/* State 3: Team Approved -> Full Event Dashboard & Submissions */}
        {membership?.team.status === "approved" && (
          <ApprovedDashboard
            team={membership.team}
            eventStartAt={s.eventStartAt}
            submissionDeadline={s.submissionDeadline}
            rulebookUrl={s.rulebookUrl}
            phase={phase}
            isSubmissionsOpen={isSubmissionsOpen}
          />
        )}

        {/* State 4: Team Rejected -> Notice & Reset */}
        {membership?.team.status === "rejected" && (
          <RejectedScreen teamName={membership.team.name} />
        )}
      </main>
    </div>
  );
}
