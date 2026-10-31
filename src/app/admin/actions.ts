"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/validation";
import { sendShortlistNotificationEmail } from "@/lib/email";

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
 * Auto-assign pre-defined Sets (5 APIs each) across all approved teams that need APIs.
 * Automatically distributes available and least-used sets in a single atomic batch transaction.
 */
export async function autoAssignApisAction(): Promise<AdminActionState> {
  await verifyAdmin();

  try {
    const approvedTeams = await prisma.team.findMany({
      where: { status: "approved" },
      include: { assignments: true },
    });

    const teamsNeedingApis = approvedTeams.filter((t) => t.assignments.length < 5);
    if (teamsNeedingApis.length === 0) {
      return { success: true, message: "All approved teams already have their APIs assigned." };
    }

    const allApis = await prisma.api.findMany({
      include: { assignments: true },
    });

    if (allApis.length < 5) {
      return {
        error: `Not enough APIs in pool (found ${allApis.length}, minimum 5 required). Add more APIs first.`,
      };
    }

    const teamIdsNeedingApis = new Set(teamsNeedingApis.map((t) => t.id));

    // Group APIs by setNumber
    const setsMap = new Map<number, typeof allApis>();
    for (const api of allApis) {
      const sNum = api.setNumber ?? 1;
      if (!setsMap.has(sNum)) setsMap.set(sNum, []);
      setsMap.get(sNum)!.push(api);
    }

    // Filter sets that have at least 5 APIs
    const validSets = Array.from(setsMap.entries())
      .filter(([_, apis]) => apis.length >= 5)
      .map(([setNum, apis]) => {
        // Count existing assignments from already-allotted teams (excluding the teams we are about to re-assign)
        const assignmentCount = apis.reduce(
          (acc, a) =>
            acc +
            a.assignments.filter((asg) => !teamIdsNeedingApis.has(asg.teamId)).length,
          0
        );
        return { setNum, apis: apis.slice(0, 5), count: assignmentCount };
      });

    if (validSets.length === 0) {
      return {
        error:
          "No valid API sets with 5 APIs found. Please add APIs or sync from docs/apis.json.",
      };
    }

    // Pre-calculate all assignments in memory so we do not loop database queries
    const newAssignments: { teamId: string; apiId: string }[] = [];
    const teamIdsToUpdate = teamsNeedingApis.map((t) => t.id);

    for (const team of teamsNeedingApis) {
      // Sort by lowest assignment count with random tiebreaker
      validSets.sort((a, b) => {
        if (a.count === b.count) return Math.random() - 0.5;
        return a.count - b.count;
      });

      const chosen = validSets[0];
      for (const api of chosen.apis) {
        newAssignments.push({
          teamId: team.id,
          apiId: api.id,
        });
      }

      // Increment count so subsequent teams get distinct/balanced sets
      chosen.count += chosen.apis.length;
    }

    // Execute deletion and creation in a single fast atomic batch transaction
    await prisma.$transaction(
      async (tx) => {
        await tx.apiAssignment.deleteMany({
          where: { teamId: { in: teamIdsToUpdate } },
        });

        if (newAssignments.length > 0) {
          await tx.apiAssignment.createMany({
            data: newAssignments,
          });
        }
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: `Successfully allotted pre-defined API sets to ${teamsNeedingApis.length} team(s).`,
    };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to auto-assign API sets." };
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
    await prisma.$transaction(
      async (tx) => {
        await tx.apiAssignment.deleteMany({ where: { teamId } });
        await tx.apiAssignment.createMany({
          data: apiIds.map((apiId) => ({ teamId, apiId })),
        });
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );

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
 * Delete an API from the catalog.
 */
export async function deleteApiAction(apiId: string): Promise<AdminActionState> {
  await verifyAdmin();

  try {
    await prisma.api.delete({
      where: { id: apiId },
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true, message: "API removed from catalog." };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to delete API." };
  }
}

/**
 * Allot an entire pre-defined Set (5 APIs) directly to a single team.
 */
export async function allotSetToTeamAction(
  teamId: string,
  setNumber: number
): Promise<AdminActionState> {
  await verifyAdmin();

  try {
    const setApis = await prisma.api.findMany({
      where: { setNumber },
    });

    if (setApis.length === 0) {
      return { error: `No APIs found in Set ${setNumber}.` };
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.apiAssignment.deleteMany({ where: { teamId } });
        await tx.apiAssignment.createMany({
          data: setApis.slice(0, 5).map((a) => ({ teamId, apiId: a.id })),
        });
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: `Set ${setNumber} (${Math.min(setApis.length, 5)} APIs) allotted to squad successfully!`,
    };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to allot Set to squad." };
  }
}

/**
 * Auto-assign an available / least-used Set of 5 APIs to a single specific team.
 */
export async function autoAssignTeamApisAction(teamId: string): Promise<AdminActionState> {
  await verifyAdmin();

  try {
    const allApis = await prisma.api.findMany({
      include: { assignments: true },
    });

    if (allApis.length < 5) {
      return {
        error: `Not enough APIs in pool (found ${allApis.length}, minimum 5 required). Add more APIs first.`,
      };
    }

    // Group APIs by setNumber
    const setsMap = new Map<number, typeof allApis>();
    for (const api of allApis) {
      const sNum = api.setNumber ?? 1;
      if (!setsMap.has(sNum)) setsMap.set(sNum, []);
      setsMap.get(sNum)!.push(api);
    }

    // Determine usage of each set, excluding this team's existing assignments
    const setStats = Array.from(setsMap.entries())
      .filter(([_, apis]) => apis.length >= 5)
      .map(([setNum, apis]) => {
        const assignmentCount = apis.reduce(
          (acc, a) =>
            acc + a.assignments.filter((asg) => asg.teamId !== teamId).length,
          0
        );
        return { setNum, apis: apis.slice(0, 5), count: assignmentCount };
      });

    if (setStats.length === 0) {
      return { error: "No valid API sets with at least 5 APIs available." };
    }

    // Sort by lowest assignment count + random tiebreak
    setStats.sort((a, b) => {
      if (a.count === b.count) return Math.random() - 0.5;
      return a.count - b.count;
    });

    const chosen = setStats[0];

    await prisma.$transaction(
      async (tx) => {
        await tx.apiAssignment.deleteMany({ where: { teamId } });
        await tx.apiAssignment.createMany({
          data: chosen.apis.map((a) => ({ teamId, apiId: a.id })),
        });
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: `Set ${chosen.setNum} (5 APIs) allotted to squad successfully.`,
    };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to allot Set to team." };
  }
}

/**
 * Re-sync all APIs in the database from docs/apis.json file.
 */
export async function syncApisFromJsonAction(): Promise<AdminActionState> {
  await verifyAdmin();

  try {
    const jsonPath = path.join(process.cwd(), "docs", "apis.json");
    if (!fs.existsSync(jsonPath)) {
      return { error: "docs/apis.json file not found." };
    }

    const sets = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const apiRecords: { name: string; docsLink: string; setNumber: number }[] = [];

    for (const s of sets) {
      for (const a of s.apis) {
        apiRecords.push({
          name: a.name,
          docsLink: a.docsLink,
          setNumber: s.setNumber,
        });
      }
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.apiAssignment.deleteMany();
        await tx.api.deleteMany();
        await tx.api.createMany({
          data: apiRecords,
        });
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: `Synced ${apiRecords.length} APIs across ${sets.length} sets from docs/apis.json into database!`,
    };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to sync APIs from JSON." };
  }
}

/**
 * Instant toggle to publish or unpublish APIs to participants.
 */
export async function togglePublishApisAction(publish?: boolean): Promise<AdminActionState> {
  await verifyAdmin();

  try {
    let nextValue: string;
    if (typeof publish === "boolean") {
      nextValue = publish ? "true" : "false";
    } else {
      const current = await prisma.setting.findUnique({
        where: { key: "apis_published" },
      });
      nextValue = current?.value === "true" ? "false" : "true";
    }

    await prisma.setting.upsert({
      where: { key: "apis_published" },
      update: { value: nextValue },
      create: { key: "apis_published", value: nextValue },
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return {
      success: true,
      message:
        nextValue === "true"
          ? "APIs published! All participants can now see their allotted APIs on their dashboard."
          : "APIs locked/unpublished. Participants can no longer see their APIs.",
    };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update API publish status." };
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
  const apisPublished =
    formData.get("apis_published") === "true" ||
    formData.get("apis_published") === "on";
  const registrationsLocked =
    formData.get("registrations_locked") === "true" ||
    formData.get("registrations_locked") === "on";
  const shortlistPublished =
    formData.get("shortlist_published") === "true" ||
    formData.get("shortlist_published") === "on";

  const removeRulebookFile = formData.get("remove_rulebook_file") === "true";
  const rulebookFile = formData.get("rulebook_file") as File | null;

  const updates: Record<string, string> = {
    announcement,
    whatsapp_url: whatsappUrl,
    rulebook_url: rulebookUrl,
    submissions_unlocked: submissionsUnlocked ? "true" : "false",
    apis_published: apisPublished ? "true" : "false",
    registrations_locked: registrationsLocked ? "true" : "false",
    shortlist_published: shortlistPublished ? "true" : "false",
  };

  if (removeRulebookFile) {
    try {
      await prisma.setting.deleteMany({
        where: {
          key: {
            in: [
              "rulebook_pdf_base64",
              "rulebook_file_name",
              "rulebook_file_size",
              "rulebook_file_updated_at",
            ],
          },
        },
      });
      updates.rulebook_url = "";
    } catch {
      // ignore if keys do not exist
    }
  } else if (rulebookFile && rulebookFile.size > 0) {
    const isPdf =
      rulebookFile.type === "application/pdf" ||
      rulebookFile.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return { error: "The uploaded file must be a valid PDF document (.pdf)." };
    }
    if (rulebookFile.size > 15 * 1024 * 1024) {
      return { error: "The rulebook file size exceeds the 15MB limit." };
    }

    try {
      const bytes = await rulebookFile.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      updates.rulebook_pdf_base64 = base64;
      updates.rulebook_file_name = rulebookFile.name;
      updates.rulebook_file_size = String(rulebookFile.size);
      updates.rulebook_file_updated_at = new Date().toISOString();
      updates.rulebook_url = "/api/rulebook";
    } catch {
      return { error: "Failed to process rulebook file upload." };
    }
  }

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
    revalidatePath("/rulebook");
    revalidatePath("/dashboard");
    return { success: true, message: "Event configuration and rulebook updated successfully." };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to save settings." };
  }
}

/**
 * Remove uploaded custom rulebook and revert back to default /rulebook.pdf
 */
export async function removeRulebookAction(): Promise<AdminActionState> {
  await verifyAdmin();
  try {
    await prisma.setting.deleteMany({
      where: {
        key: {
          in: [
            "rulebook_pdf_base64",
            "rulebook_file_name",
            "rulebook_file_size",
            "rulebook_file_updated_at",
          ],
        },
      },
    });
    await prisma.setting.upsert({
      where: { key: "rulebook_url" },
      update: { value: "" },
      create: { key: "rulebook_url", value: "" },
    });
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/rulebook");
    revalidatePath("/dashboard");
    return { success: true, message: "Custom rulebook removed. Reverted to default rulebook." };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to remove rulebook file." };
  }
}

/**
 * Toggle shortlist status for an individual team.
 */
export async function toggleShortlistTeamAction(
  teamId: string,
  isShortlisted: boolean
): Promise<AdminActionState> {
  await verifyAdmin();

  try {
    await prisma.team.update({
      where: { id: teamId },
      data: { isShortlisted },
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath("/showcase");
    return {
      success: true,
      message: isShortlisted
        ? "Squad marked as shortlisted for Top 7."
        : "Squad removed from shortlist.",
    };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update shortlist status." };
  }
}

/**
 * Bulk set the Top 7 shortlisted teams by IDs.
 */
export async function setTop7ShortlistAction(teamIds: string[]): Promise<AdminActionState> {
  await verifyAdmin();

  try {
    await prisma.$transaction(async (tx) => {
      // Un-shortlist all approved teams
      await tx.team.updateMany({
        data: { isShortlisted: false },
      });

      // Shortlist selected teams
      if (teamIds.length > 0) {
        await tx.team.updateMany({
          where: { id: { in: teamIds } },
          data: { isShortlisted: true },
        });
      }
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath("/showcase");
    return {
      success: true,
      message: `Successfully updated shortlist with ${teamIds.length} squads.`,
    };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to set shortlist." };
  }
}

/**
 * Toggle whether the Top 7 shortlist results are published and visible to participants.
 */
export async function togglePublishShortlistAction(publish?: boolean): Promise<AdminActionState> {
  await verifyAdmin();

  try {
    let nextValue: string;
    if (typeof publish === "boolean") {
      nextValue = publish ? "true" : "false";
    } else {
      const current = await prisma.setting.findUnique({
        where: { key: "shortlist_published" },
      });
      nextValue = current?.value === "true" ? "false" : "true";
    }

    await prisma.setting.upsert({
      where: { key: "shortlist_published" },
      update: { value: nextValue },
      create: { key: "shortlist_published", value: nextValue },
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidatePath("/showcase");

    return {
      success: true,
      message:
        nextValue === "true"
          ? "Top 7 Shortlist published! All participants can now see their shortlisted / not shortlisted status on their dashboards."
          : "Shortlist unpublished / hidden from participant dashboards.",
    };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update shortlist visibility." };
  }
}

/**
 * Sends notification emails to the group leaders of shortlisted squads.
 * If teamIds is specified, only sends to those squads; otherwise sends to all currently shortlisted squads.
 */
export async function notifyShortlistedTeamsAction(
  teamIds?: string[]
): Promise<AdminActionState & { count?: number; failed?: number }> {
  await verifyAdmin();

  try {
    const whereClause: any = {
      isShortlisted: true,
    };
    if (teamIds && teamIds.length > 0) {
      whereClause.id = { in: teamIds };
    }

    const shortlistedTeams = await prisma.team.findMany({
      where: whereClause,
      include: {
        members: {
          orderBy: { isLeader: "desc" },
        },
      },
    });

    if (shortlistedTeams.length === 0) {
      return {
        error: "No shortlisted teams found to notify. Please shortlist teams first.",
      };
    }

    let successCount = 0;
    let failCount = 0;
    const notifiedTeamIds: string[] = [];

    for (const team of shortlistedTeams) {
      const leader = team.members.find((m) => m.isLeader);
      const partner = team.members.find((m) => !m.isLeader);

      if (!leader || !leader.email) {
        failCount++;
        continue;
      }

      const delivered = await sendShortlistNotificationEmail({
        teamName: team.name,
        leaderName: leader.name || "Squad Leader",
        leaderEmail: leader.email,
        partnerName: partner?.name,
        partnerEmail: partner?.email,
      });

      if (delivered) {
        successCount++;
        notifiedTeamIds.push(team.id);
      } else {
        failCount++;
      }
    }

    if (notifiedTeamIds.length > 0) {
      await prisma.team.updateMany({
        where: { id: { in: notifiedTeamIds } },
        data: { shortlistNotifiedAt: new Date() },
      });
    }

    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return {
      success: true,
      count: successCount,
      failed: failCount,
      message: `Delivered shortlist email notifications to ${successCount} squad leader(s)${
        failCount > 0 ? ` (${failCount} failed)` : ""
      }.`,
    };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to send notifications." };
  }
}

/**
 * Sends a test shortlist notification email to the admin or specified email address for verification.
 */
export async function sendTestShortlistEmailAction(
  targetEmail?: string
): Promise<AdminActionState> {
  const admin = await verifyAdmin();
  const recipient = (
    targetEmail ||
    admin.user.email ||
    process.env.NOTIFICATION_EMAIL ||
    "202501069@dau.ac.in"
  ).trim();

  try {
    const success = await sendShortlistNotificationEmail({
      teamName: "Apex Innovators (Test Preview)",
      leaderName: "Squad Leader",
      leaderEmail: recipient,
      partnerName: "Partner",
      partnerEmail: recipient.includes("@dau.ac.in") ? "mankad.dhanya@gmail.com" : undefined,
      presentationDate: "Monday, 2 November 2026",
      presentationTime: "8:00 PM IST",
      presentationVenue: "CEP 105, Dhirubhai Ambani University",
    });

    if (!success) {
      return { error: "Failed to dispatch test shortlist email. Check SMTP credentials." };
    }

    return {
      success: true,
      message: `Test shortlist notification email dispatched successfully to ${recipient}!`,
    };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to send test email." };
  }
}


