"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSettings, siteNow, areSubmissionsOpen } from "@/lib/settings";
import { isDauEmail, isGithubRepoUrl, isYoutubeUrl, normalizeEmail } from "@/lib/validation";
import { Prisma } from "@prisma/client";

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Register a new team with 2 members.
 */
export async function registerTeamAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: "You must be signed in to register a team." };
  }

  const leaderEmail = normalizeEmail(session.user.email);
  const leaderUser = await prisma.user.findUnique({ where: { email: leaderEmail } });

  if (!leaderUser) {
    return { error: "User account could not be found. Please log in again." };
  }

  const leaderNameRaw = (formData.get("leaderName") as string) || "";
  const teamNameRaw = (formData.get("teamName") as string) || "";
  const memberNameRaw = (formData.get("memberName") as string) || "";
  const memberEmailRaw = (formData.get("memberEmail") as string) || "";

  const leaderName = leaderNameRaw.trim() || session.user.name || leaderEmail;
  const teamName = teamNameRaw.trim();
  const nameLower = teamName.toLowerCase();
  const memberName = memberNameRaw.trim();
  const memberEmail = normalizeEmail(memberEmailRaw);

  const fieldErrors: Record<string, string> = {};

  if (!leaderName || leaderName.length < 2) {
    fieldErrors.leaderName = "Please enter your full name.";
  }

  if (!teamName || teamName.length < 2 || teamName.length > 40) {
    fieldErrors.teamName = "Team name must be between 2 and 40 characters.";
  }

  if (!memberName || memberName.length < 2) {
    fieldErrors.memberName = "Please provide your teammate's full name.";
  }

  if (!isDauEmail(memberEmail)) {
    fieldErrors.memberEmail = "Teammate email must be a valid @dau.ac.in account.";
  } else if (memberEmail === leaderEmail) {
    fieldErrors.memberEmail = "You cannot enter your own email as your teammate.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Ensure leader is not already on any team
      const existingLeader = await tx.teamMember.findUnique({
        where: { email: leaderEmail },
      });
      if (existingLeader) {
        throw new Error("You are already registered on a team.");
      }

      // 2. Ensure second member is not already on any team
      const existingMember = await tx.teamMember.findUnique({
        where: { email: memberEmail },
      });
      if (existingMember) {
        throw new Error(
          `Participant ${memberEmail} is already registered on another team.`
        );
      }

      // 3. Ensure team name is unique (case-insensitive)
      const existingTeam = await tx.team.findUnique({
        where: { nameLower },
      });
      if (existingTeam) {
        throw new Error(`Team name "${teamName}" is already taken. Please choose another.`);
      }

      // Update leader's user record with their typed real name
      await tx.user.update({
        where: { id: leaderUser.id },
        data: { name: leaderName },
      });

      // 4. Create Team
      const team = await tx.team.create({
        data: {
          name: teamName,
          nameLower,
          status: "pending_approval",
        },
      });

      // 5. Create TeamMember rows (preserve typed human names)
      await tx.teamMember.createMany({
        data: [
          {
            teamId: team.id,
            email: leaderEmail,
            name: leaderName,
            userId: leaderUser.id,
            isLeader: true,
          },
          {
            teamId: team.id,
            email: memberEmail,
            name: memberName,
            userId: null,
            isLeader: false,
          },
        ],
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return {
          error:
            "A conflict occurred: team name or one of the emails was just registered by another user.",
        };
      }
    }
    return { error: err instanceof Error ? err.message : "An unexpected error occurred." };
  }
}

/**
 * Edit team details while in pending_approval (Leader only).
 */
export async function editTeamAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: "Unauthorized." };
  }

  const leaderEmail = normalizeEmail(session.user.email);
  const currentMember = await prisma.teamMember.findUnique({
    where: { email: leaderEmail },
    include: { team: { include: { members: true } } },
  });

  if (!currentMember || !currentMember.isLeader) {
    return { error: "Only the team leader can modify registration details." };
  }

  if (currentMember.team.status !== "pending_approval") {
    return { error: "Team details are locked once approved by organizers." };
  }

  const leaderNameRaw = (formData.get("leaderName") as string) || "";
  const teamNameRaw = (formData.get("teamName") as string) || "";
  const memberNameRaw = (formData.get("memberName") as string) || "";
  const memberEmailRaw = (formData.get("memberEmail") as string) || "";

  const leaderName = leaderNameRaw.trim();
  const teamName = teamNameRaw.trim();
  const nameLower = teamName.toLowerCase();
  const memberName = memberNameRaw.trim();
  const memberEmail = normalizeEmail(memberEmailRaw);

  const fieldErrors: Record<string, string> = {};

  if (!teamName || teamName.length < 2 || teamName.length > 40) {
    fieldErrors.teamName = "Team name must be between 2 and 40 characters.";
  }

  if (!memberName || memberName.length < 2) {
    fieldErrors.memberName = "Teammate name is required.";
  }

  if (!isDauEmail(memberEmail)) {
    fieldErrors.memberEmail = "Teammate email must be an @dau.ac.in account.";
  } else if (memberEmail === leaderEmail) {
    fieldErrors.memberEmail = "You cannot be your own teammate.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const otherMember = currentMember.team.members.find((m) => !m.isLeader);

  try {
    await prisma.$transaction(async (tx) => {
      // 1. If leaderName provided, update User and TeamMember records
      if (leaderName && leaderName.length >= 2) {
        await tx.user.updateMany({
          where: { email: leaderEmail },
          data: { name: leaderName },
        });
        await tx.teamMember.update({
          where: { id: currentMember.id },
          data: { name: leaderName },
        });
      }

      // 2. If team name changed, check uniqueness
      if (nameLower !== currentMember.team.nameLower) {
        const existingTeam = await tx.team.findUnique({ where: { nameLower } });
        if (existingTeam) {
          throw new Error(`Team name "${teamName}" is already taken.`);
        }
      }

      // 3. If member email changed, check if new email is on another team
      if (otherMember && memberEmail !== otherMember.email) {
        const existingMember = await tx.teamMember.findUnique({
          where: { email: memberEmail },
        });
        if (existingMember && existingMember.teamId !== currentMember.teamId) {
          throw new Error(`Participant ${memberEmail} is already on another team.`);
        }
      }

      // 4. Update Team name
      await tx.team.update({
        where: { id: currentMember.teamId },
        data: { name: teamName, nameLower },
      });

      // 5. Update or replace second member (preserving typed name)
      if (otherMember) {
        await tx.teamMember.update({
          where: { id: otherMember.id },
          data: {
            email: memberEmail,
            name: memberName,
          },
        });
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update team details." };
  }
}

/**
 * Submit or update project GitHub repository URL.
 */
export async function submitGithubAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: "You must be signed in." };
  }

  const email = normalizeEmail(session.user.email);
  const [membership, s] = await Promise.all([
    prisma.teamMember.findUnique({
      where: { email },
      include: { team: true },
    }),
    getSettings(),
  ]);

  if (!membership || membership.team.status !== "approved") {
    return { error: "Only approved teams can submit project repositories." };
  }

  // Server-side submission lock enforcement (admin unlocked + before deadline)
  if (!areSubmissionsOpen(s)) {
    const now = siteNow(s).getTime();
    if (s.submissionDeadline && now >= s.submissionDeadline.getTime()) {
      return { error: "Submissions are closed. The deadline has passed." };
    }
    return {
      error:
        "Submissions are currently locked. Organizers will unlock project submissions during the sprint.",
    };
  }

  const githubUrlRaw = (formData.get("githubUrl") as string) || "";
  const githubUrl = githubUrlRaw.trim();
  const youtubeUrlRaw = (formData.get("youtubeUrl") as string) || "";
  const youtubeUrl = youtubeUrlRaw.trim();

  const fieldErrors: Record<string, string> = {};

  if (!isGithubRepoUrl(githubUrl)) {
    fieldErrors.githubUrl =
      "Must be a valid GitHub repository URL (e.g., https://github.com/owner/repo)";
  }

  if (!isYoutubeUrl(youtubeUrl)) {
    fieldErrors.youtubeUrl =
      "Must be a valid YouTube video link (e.g., https://youtu.be/... or https://youtube.com/watch?v=...)";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  try {
    await prisma.submission.upsert({
      where: { teamId: membership.teamId },
      update: { githubUrl, youtubeUrl },
      create: { teamId: membership.teamId, githubUrl, youtubeUrl },
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidatePath("/showcase");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to save submission." };
  }
}

/**
 * Leave or release a rejected team so participants can register again.
 */
export async function resetRejectedTeamAction(): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  const email = normalizeEmail(session.user.email);
  const membership = await prisma.teamMember.findUnique({
    where: { email },
    include: { team: true },
  });

  if (!membership || membership.team.status !== "rejected") {
    return { error: "Team is not in rejected state." };
  }

  // Delete team (cascades to teamMember rows)
  await prisma.team.delete({
    where: { id: membership.teamId },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
