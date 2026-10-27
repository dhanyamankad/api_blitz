import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface TeamExportMember {
  id?: string;
  name: string;
  email: string;
  isLeader?: boolean;
}

export interface TeamExportApi {
  id?: string;
  name: string;
  docsLink?: string;
  setNumber?: number | null;
}

export interface TeamExportAssignment {
  api: TeamExportApi;
}

export interface TeamExportSubmission {
  githubUrl: string;
  youtubeUrl?: string | null;
  submittedAt?: Date | string;
  updatedAt?: Date | string;
}

export interface TeamExportData {
  id?: string;
  name: string;
  status: "pending_approval" | "approved" | "rejected" | string;
  createdAt: Date | string;
  members: TeamExportMember[];
  assignments?: TeamExportAssignment[];
  submission?: TeamExportSubmission | null;
}

export interface GeneratePdfOptions {
  title?: string;
  subtitle?: string;
  generatedBy?: string;
  filterLabel?: string;
}

function formatISTDate(d: Date | string): string {
  try {
    const dateObj = typeof d === "string" ? new Date(d) : d;
    return dateObj.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return String(d);
  }
}

function formatShortDate(d: Date | string): string {
  try {
    const dateObj = typeof d === "string" ? new Date(d) : d;
    return dateObj.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  } catch {
    return String(d);
  }
}

/**
 * Generates an official, beautifully formatted A4 Landscape PDF
 * containing all registered teams, participant names, allocated APIs, deliverables, and statuses.
 */
export function generateTeamsPdf(
  teams: TeamExportData[],
  options: GeneratePdfOptions = {}
): jsPDF {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const marginX = 14;
  const usableWidth = pageWidth - marginX * 2; // 269mm

  // Summary Metrics calculations
  const totalTeams = teams.length;
  const totalHackers = teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);
  const approvedCount = teams.filter((t) => t.status === "approved").length;
  const pendingCount = teams.filter((t) => t.status === "pending_approval").length;
  const rejectedCount = teams.filter((t) => t.status === "rejected").length;
  const allottedCount = teams.filter((t) => (t.assignments?.length || 0) > 0).length;
  const unallottedCount = totalTeams - allottedCount;
  const submittedCount = teams.filter((t) => !!t.submission).length;

  // 1. Top Header Slate Banner (Page 1)
  const bannerY = 10;
  const bannerHeight = 26;
  doc.setFillColor(15, 23, 42); // slate-900 #0f172a
  doc.roundedRect(marginX, bannerY, usableWidth, bannerHeight, 2, 2, "F");

  // Cyan top stripe
  doc.setFillColor(14, 165, 233); // sky-500 #0ea5e9
  doc.rect(marginX, bannerY, usableWidth, 1.8, "F");

  // Left Brand & Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(options.title || "API BLITZ 2026", marginX + 5, bannerY + 9);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(56, 189, 248); // sky-400 #38bdf8
  doc.text(
    options.subtitle || "OFFICIAL REGISTRATIONS & API ALLOTMENT MASTER REPORT",
    marginX + 5,
    bannerY + 15
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // slate-400 #94a3b8
  doc.text("MSTC · DHIRUBHAI AMBANI UNIVERSITY (DAU)", marginX + 5, bannerY + 20.5);

  // Right Metadata Block
  const rightX = marginX + usableWidth - 5;
  const now = new Date();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Generated: ${formatISTDate(now)} IST`, rightX, bannerY + 8, { align: "right" });

  if (options.generatedBy) {
    doc.text(`Admin: ${options.generatedBy}`, rightX, bannerY + 13, { align: "right" });
  }

  const scopeText = options.filterLabel
    ? `Scope: ${options.filterLabel} (${totalTeams} Squads)`
    : `Scope: All Registrations (${totalTeams} Squads)`;
  doc.text(scopeText, rightX, bannerY + 18, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text("OFFICIAL AUDIT REPORT", rightX, bannerY + 23, { align: "right" });

  // 2. Executive KPI Summary Cards
  const kpiY = bannerY + bannerHeight + 4; // 40mm
  const kpiHeight = 13;
  const cardGap = 3;
  const cardCount = 5;
  const cardWidth = (usableWidth - cardGap * (cardCount - 1)) / cardCount; // ~51.4mm

  const kpis = [
    { label: "TOTAL SQUADS", value: `${totalTeams}`, sub: `${totalHackers} Hackers registered` },
    { label: "APPROVAL STATUS", value: `${approvedCount} Approved`, sub: `${pendingCount} Pending · ${rejectedCount} Rej` },
    { label: "API ALLOTMENT", value: `${allottedCount} Allotted`, sub: `${unallottedCount} Pending assignment` },
    { label: "DELIVERABLES", value: `${submittedCount} Submitted`, sub: `${totalTeams - submittedCount} Pending submission` },
    { label: "ORGANIZER", value: "MSTC DAU", sub: "Tech Council 2026" },
  ];

  kpis.forEach((kpi, idx) => {
    const x = marginX + idx * (cardWidth + cardGap);
    // Card background
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(x, kpiY, cardWidth, kpiHeight, 1.5, 1.5, "FD");

    // Card top border accent
    doc.setFillColor(idx === 0 ? 14 : idx === 1 ? 16 : idx === 2 ? 147 : idx === 3 ? 168 : 99, 165, 233);
    doc.rect(x + 1, kpiY, cardWidth - 2, 0.8, "F");

    // KPI Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(kpi.label, x + 3, kpiY + 4);

    // KPI Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(kpi.value, x + 3, kpiY + 8.5);

    // KPI Subtext
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(kpi.sub, x + 3, kpiY + 11.5);
  });

  // 3. Prepare Table Data
  const headers = [
    [
      "#",
      "Squad Name",
      "Status",
      "Team Leader (Primary)",
      "Teammate / Member 2",
      "Allotted API(s)",
      "Deliverables",
      "Registered",
    ],
  ];

  const rows = teams.map((team, index) => {
    // Leader & Teammates
    const leader = team.members?.find((m) => m.isLeader) || team.members?.[0];
    const otherMembers = team.members?.filter((m) => m !== leader) || [];
    const teammate = otherMembers[0];

    const leaderCell = leader
      ? `${leader.name}\n${leader.email}`
      : "Not Registered";

    let teammateCell = "Solo / Single Member";
    if (teammate) {
      teammateCell = `${teammate.name}\n${teammate.email}`;
      if (otherMembers.length > 1) {
        const extraNames = otherMembers.slice(1).map((m) => `+ ${m.name}`).join("\n");
        teammateCell += `\n${extraNames}`;
      }
    }

    // Allotted APIs
    let apiCell = "None (Pending Allotment)";
    if (team.assignments && team.assignments.length > 0) {
      const setNum = team.assignments[0]?.api?.setNumber;
      const setPrefix = setNum ? `Set ${setNum} (${team.assignments.length} APIs):\n` : "";
      const apiNames = team.assignments.map((a) => `• ${a.api?.name || "API"}`).join("\n");
      apiCell = `${setPrefix}${apiNames}`;
    }

    // Submissions
    let deliverablesCell = "Pending Submission";
    if (team.submission) {
      const git = team.submission.githubUrl
        ? `Repo: ${team.submission.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "")}`
        : "";
      const yt = team.submission.youtubeUrl ? `\nDemo: ${team.submission.youtubeUrl}` : "";
      deliverablesCell = `${git}${yt}`;
    }

    // Status format
    let statusText = "APPROVED";
    if (team.status === "pending_approval") statusText = "PENDING";
    else if (team.status === "rejected") statusText = "REJECTED";
    else if (typeof team.status === "string") statusText = team.status.toUpperCase();

    const regDate = formatShortDate(team.createdAt);

    return [
      (index + 1).toString(),
      team.name,
      statusText,
      leaderCell,
      teammateCell,
      apiCell,
      deliverablesCell,
      regDate,
    ];
  });

  // 4. AutoTable Configuration
  const startTableY = kpiY + kpiHeight + 4; // ~57mm

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: startTableY,
    margin: { left: marginX, right: marginX, top: 16, bottom: 14 },
    tableWidth: usableWidth,
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: { top: 2.5, bottom: 2.5, left: 2.5, right: 2.5 },
      overflow: "linebreak",
      valign: "middle",
      lineColor: [226, 232, 240], // slate-200
      lineWidth: 0.2,
      textColor: [30, 41, 59], // slate-800
    },
    headStyles: {
      fillColor: [15, 23, 42], // slate-900
      textColor: [248, 250, 252], // slate-50
      fontSize: 7,
      fontStyle: "bold",
      halign: "left",
      cellPadding: { top: 3, bottom: 3, left: 2.5, right: 2.5 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: {
      0: { cellWidth: 9, halign: "center", fontStyle: "bold" }, // Sr #
      1: { cellWidth: 38, fontStyle: "bold" }, // Team Name
      2: { cellWidth: 22, halign: "center", fontStyle: "bold" }, // Status
      3: { cellWidth: 48 }, // Leader
      4: { cellWidth: 48 }, // Teammate
      5: { cellWidth: 54 }, // Allotted APIs
      6: { cellWidth: 33 }, // Deliverables
      7: { cellWidth: 17, halign: "center" }, // Registered Date
    },
    didParseCell: (data) => {
      // Custom styling for Status column
      if (data.section === "body" && data.column.index === 2) {
        const val = String(data.cell.raw || "");
        if (val === "APPROVED") {
          data.cell.styles.textColor = [21, 128, 61]; // emerald-700
          data.cell.styles.fillColor = [240, 253, 244]; // emerald-50
        } else if (val === "PENDING") {
          data.cell.styles.textColor = [180, 83, 9]; // amber-700
          data.cell.styles.fillColor = [254, 243, 199]; // amber-50
        } else if (val === "REJECTED") {
          data.cell.styles.textColor = [185, 28, 28]; // red-700
          data.cell.styles.fillColor = [254, 226, 226]; // red-50
        }
      }

      // Muted style for unallotted APIs
      if (data.section === "body" && data.column.index === 5) {
        const val = String(data.cell.raw || "");
        if (val.startsWith("None")) {
          data.cell.styles.textColor = [148, 163, 184]; // slate-400
          data.cell.styles.fontStyle = "italic";
        } else {
          data.cell.styles.textColor = [15, 23, 42]; // slate-900
        }
      }

      // Deliverables style
      if (data.section === "body" && data.column.index === 6) {
        const val = String(data.cell.raw || "");
        if (val.startsWith("Pending")) {
          data.cell.styles.textColor = [148, 163, 184]; // slate-400
          data.cell.styles.fontStyle = "italic";
        } else {
          data.cell.styles.textColor = [2, 132, 199]; // sky-600
        }
      }

      // Solo teammate style
      if (data.section === "body" && data.column.index === 4) {
        const val = String(data.cell.raw || "");
        if (val.startsWith("Solo")) {
          data.cell.styles.textColor = [148, 163, 184];
          data.cell.styles.fontStyle = "italic";
        }
      }
    },
    didDrawPage: (data) => {
      // Header for pages > 1
      if (data.pageNumber > 1) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text("API BLITZ 2026 — MASTER TEAMS & ALLOTMENT REPORT", marginX, 10);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text("MSTC · DHIRUBHAI AMBANI UNIVERSITY", marginX + usableWidth, 10, {
          align: "right",
        });

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(marginX, 12, marginX + usableWidth, 12);
      }

      // Running footer on every page
      const footerY = pageHeight - 7;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(marginX, footerY - 2.5, marginX + usableWidth, footerY - 2.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        "CONFIDENTIAL · API Blitz 2026 · Microsoft Student Technical Club (MSTC) · Dhirubhai Ambani University",
        marginX,
        footerY
      );
    },
  });

  // 5. Total Page Numbering ("Page X of Y")
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${i} of ${totalPages}`, marginX + usableWidth, footerY, {
      align: "right",
    });
  }

  return doc;
}
