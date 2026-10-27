import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateTeamsPdf, TeamExportData } from "@/lib/pdfGenerator";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();

    // Guard: Admin role required
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized: Please sign in", { status: 401 });
    }

    if (session.user.role !== "admin") {
      return new NextResponse("Forbidden: Admin access required", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all"; // all | approved | pending | rejected | allotted | submitted

    // Fetch all teams with full relations
    const rawTeams = await prisma.team.findMany({
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
    });

    let filteredTeams = rawTeams;
    let filterLabel = "All Registered Squads";

    if (filter === "approved") {
      filteredTeams = rawTeams.filter((t) => t.status === "approved");
      filterLabel = "Approved Squads";
    } else if (filter === "pending") {
      filteredTeams = rawTeams.filter((t) => t.status === "pending_approval");
      filterLabel = "Pending Review Squads";
    } else if (filter === "rejected") {
      filteredTeams = rawTeams.filter((t) => t.status === "rejected");
      filterLabel = "Rejected Squads";
    } else if (filter === "allotted") {
      filteredTeams = rawTeams.filter((t) => t.assignments.length > 0);
      filterLabel = "Squads with Allotted APIs";
    } else if (filter === "submitted") {
      filteredTeams = rawTeams.filter((t) => !!t.submission);
      filterLabel = "Squads with Submissions";
    }

    const doc = generateTeamsPdf(filteredTeams as unknown as TeamExportData[], {
      generatedBy: session.user.email,
      filterLabel,
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const filename = `api-blitz-teams-allotment-${filter}-${new Date().toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Failed to generate PDF report:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate PDF report" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
