"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/validation";

/**
 * Verify caller is an authorized admin.
 */
async function verifyAdmin() {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "admin") {
    throw new Error("Access denied: Admin privileges required.");
  }
  return session;
}

export type AdminActionState = {
  success?: boolean;
  error?: string;
  message?: string;
};

/**
 * Approve a pending team.
 */
export async function approveTeamAction(teamId: string): Promise<AdminActionState> {
  await verifyAdmin();

  try {
    await prisma.team.update({
      where: { id: teamId },
      data: { status: "approved" },
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, message: "Team approved successfully." };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to approve team." };
  }
}

/**
 * Reject a team. Per specification, rejecting releases the team's records so members can register again.
 */
export async function rejectTeamAction(teamId: string): Promise<AdminActionState> {
  await verifyAdmin();

  try {
    // Cascade delete frees the emails and team name immediately
    await prisma.team.delete({
      where: { id: teamId },
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, message: "Team rejected and records released." };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to reject team." };
  }
}

/**
 * Auto-assign 5 balanced APIs to all approved teams that do not have 5 assigned APIs.
 */
export async function autoAssignApisAction(): Promise<AdminActionState> {
  await verifyAdmin();

  try {
    // 1. Fetch all approved teams and their current assignments
    const approvedTeams = await prisma.team.findMany({
      where: { status: "approved" },
      include: { assignments: true },
    });

    const teamsNeedingApis = approvedTeams.filter((t) => t.assignments.length < 5);
    if (teamsNeedingApis.length === 0) {
      return { success: true, message: "All approved teams already have their APIs assigned." };
    }

    // 2. Fetch all available APIs
    const allApis = await prisma.api.findMany({
      include: { assignments: true },
    });

    if (allApis.length < 5) {
      return {
        error: `Not enough APIs in pool (found ${allApis.length}, minimum 5 required). Add more APIs first.`,
      };
    }

    // Sort APIs by lowest assignment count to balance variety
    let apiPoolWithCounts = allApis.map((api) => ({
      id: api.id,
      count: api.assignments.length,
    }));

    await prisma.$transaction(async (tx) => {
      for (const team of teamsNeedingApis) {
        // Clear any partial assignments
        await tx.apiAssignment.deleteMany({
          where: { teamId: team.id },
        });

        // Sort by current assignment count ascending + shuffle among equal counts
        apiPoolWithCounts.sort((a, b) => {
          if (a.count === b.count) return Math.random() - 0.5;
          return a.count - b.count;
        });

        // Pick top 5
        const chosen = apiPoolWithCounts.slice(0, 5);

        // Assign to team
        await tx.apiAssignment.createMany({
          data: chosen.map((c) => ({
            teamId: team.id,
            apiId: c.id,
          })),
        });

        // Increment local counts
        for (const c of chosen) {
          c.count += 1;
        }
      }
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: `Successfully allotted 5 balanced APIs to ${teamsNeedingApis.length} team(s).`,
    };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to auto-assign APIs." };
  }
}

/**
 * Manually assign 5 APIs to a specific team.
 */
export async function manualAssignApisAction(
  teamId: string,
  apiIds: string[]
): Promise<AdminActionState> {
  await verifyAdmin();

  if (apiIds.length !== 5) {
    return { error: "You must select exactly 5 APIs for the squad." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.apiAssignment.deleteMany({ where: { teamId } });
      await tx.apiAssignment.createMany({
        data: apiIds.map((apiId) => ({ teamId, apiId })),
      });
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true, message: "Team APIs updated successfully." };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to save API assignments." };
  }
}

/**
 * Add a new API to the pool.
 */
export async function addApiAction(formData: FormData): Promise<AdminActionState> {
  await verifyAdmin();

  const name = ((formData.get("name") as string) || "").trim();
  const docsLink = ((formData.get("docsLink") as string) || "").trim();

  if (!name || name.length < 2) {
    return { error: "API name is required." };
  }
  if (!docsLink || !docsLink.startsWith("http")) {
    return { error: "Valid documentation URL is required (must start with http/https)." };
  }

  try {
    await prisma.api.create({
      data: { name, docsLink },
    });

    revalidatePath("/admin");
    return { success: true, message: `Added ${name} to API pool.` };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to add API." };
  }
}

/**
 * Update global event settings (announcement, start time, deadline, links).
 */
export async function updateSettingsAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await verifyAdmin();

  const announcement = ((formData.get("announcement") as string) || "").trim();
  const eventStartAt = ((formData.get("event_start_at") as string) || "").trim();
  const submissionDeadline = ((formData.get("submission_deadline") as string) || "").trim();
  const whatsappUrl = ((formData.get("whatsapp_url") as string) || "").trim();
  const rulebookUrl = ((formData.get("rulebook_url") as string) || "").trim();
  const nowOverride = ((formData.get("now_override") as string) || "").trim();
  const submissionsUnlocked =
    formData.get("submissions_unlocked") === "true" ||
    formData.get("submissions_unlocked") === "on";

  const updates: Record<string, string> = {
    announcement,
    whatsapp_url: whatsappUrl,
    rulebook_url: rulebookUrl,
    submissions_unlocked: submissionsUnlocked ? "true" : "false",
  };

  if (eventStartAt) {
    const d = new Date(eventStartAt);
    if (!isNaN(d.getTime())) updates.event_start_at = d.toISOString();
  }

  if (submissionDeadline) {
    const d = new Date(submissionDeadline);
    if (!isNaN(d.getTime())) updates.submission_deadline = d.toISOString();
  }

  if (nowOverride) {
    const d = new Date(nowOverride);
    if (!isNaN(d.getTime())) updates.now_override = d.toISOString();
  } else {
    updates.now_override = "";
  }

  try {
    for (const [key, value] of Object.entries(updates)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true, message: "Event configuration updated successfully." };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to save settings." };
  }
}
