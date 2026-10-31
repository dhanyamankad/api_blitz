import nodemailer from "nodemailer";

interface NewRegistrationNotificationParams {
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  memberName: string;
  memberEmail: string;
}

/**
 * Creates a reusable Nodemailer transporter using Gmail SMTP.
 */
function getTransporter() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "").trim();

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Resolves the official public website URL for outbound participant and organizer emails.
 * Guarantees that links in emails always open the live website (e.g. https://api-blitz-mstc.vercel.app)
 * rather than localhost:3000 even when triggered during local testing.
 */
export function getPublicSiteUrl(): string {
  const customUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "").trim();
  if (customUrl && !customUrl.includes("localhost") && !customUrl.includes("127.0.0.1")) {
    return customUrl.replace(/\/+$/, "");
  }

  const authUrl = (process.env.AUTH_URL || "").trim();
  if (authUrl && !authUrl.includes("localhost") && !authUrl.includes("127.0.0.1")) {
    return authUrl.replace(/\/+$/, "");
  }

  return "https://api-blitz-mstc.vercel.app";
}

/**
 * Asynchronously sends an admin notification when a new team registers.
 * Designed to be completely fire-and-forget: it never throws or blocks the caller.
 */
export async function sendNewRegistrationNotification(
  params: NewRegistrationNotificationParams
): Promise<boolean> {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn(
        "[EMAIL_NOTIFIER] GMAIL_USER or GMAIL_APP_PASSWORD is not configured. Notification skipped."
      );
      return false;
    }

    const recipients = (
      process.env.NOTIFICATION_EMAIL || "202501069@dau.ac.in"
    )
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      recipients.push("202501069@dau.ac.in");
    }

    const siteUrl = getPublicSiteUrl();
    const adminUrl = `${siteUrl}/admin`;
    const formattedDate = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const subject = `⚡ [API Blitz] New Squad Registration: ${params.teamName}`;

    const textContent = `
New Squad Registration Received for API Blitz 2026!

Team Name: ${params.teamName}
Registered At: ${formattedDate} IST

Member 1 (Squad Leader):
- Name: ${params.leaderName}
- Email: ${params.leaderEmail}

Member 2 (Partner):
- Name: ${params.memberName}
- Email: ${params.memberEmail}

Review and approve this squad in the Admin Console:
${adminUrl}
`.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #0b1329; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
    <!-- Header -->
    <tr>
      <td style="padding: 24px 28px; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); border-bottom: 1px solid #1e293b;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <span style="display: inline-block; padding: 4px 10px; font-size: 10px; font-weight: 700; font-family: monospace; letter-spacing: 1.5px; text-transform: uppercase; color: #38bdf8; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 9999px; margin-bottom: 8px;">
                NEW REGISTRATION PENDING
              </span>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                API BLITZ 2026
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; font-family: monospace;">
                Microsoft Student Technical Club · DAU
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 28px;">
        <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
          A new 2-person squad has just registered and is awaiting approval in the organizer queue.
        </p>

        <!-- Squad Details Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712; border: 1px solid #1e293b; border-radius: 12px; margin-bottom: 24px; padding: 16px;">
          <tr>
            <td style="padding: 8px 12px;">
              <span style="font-size: 10px; font-family: monospace; text-transform: uppercase; color: #64748b; letter-spacing: 1px; display: block; margin-bottom: 4px;">SQUAD NAME</span>
              <span style="font-size: 18px; font-weight: 700; color: #38bdf8; font-family: monospace;">${params.teamName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border-top: 1px solid #1e293b;">
              <span style="font-size: 10px; font-family: monospace; text-transform: uppercase; color: #64748b; letter-spacing: 1px; display: block; margin-bottom: 4px;">REGISTERED AT</span>
              <span style="font-size: 12px; color: #e2e8f0; font-family: monospace;">${formattedDate} IST</span>
            </td>
          </tr>
        </table>

        <!-- Members Section -->
        <h3 style="margin: 0 0 12px 0; font-size: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">
          Squad Members
        </h3>

        <!-- Member 1: Leader -->
        <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 12px 16px; margin-bottom: 10px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td>
                <span style="display: inline-block; font-size: 9px; font-family: monospace; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 2px;">
                  SQUAD LEADER
                </span>
                <div style="font-size: 14px; font-weight: 600; color: #ffffff;">${params.leaderName}</div>
                <div style="font-size: 12px; font-family: monospace; color: #94a3b8; margin-top: 2px;">${params.leaderEmail}</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Member 2: Partner -->
        <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td>
                <span style="display: inline-block; font-size: 9px; font-family: monospace; font-weight: 700; color: #c084fc; text-transform: uppercase; margin-bottom: 2px;">
                  PARTNER
                </span>
                <div style="font-size: 14px; font-weight: 600; color: #ffffff;">${params.memberName}</div>
                <div style="font-size: 12px; font-family: monospace; color: #94a3b8; margin-top: 2px;">${params.memberEmail}</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA Button -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <a href="${adminUrl}" style="display: inline-block; background: #38bdf8; color: #020617; font-size: 13px; font-weight: 700; font-family: monospace; text-decoration: none; padding: 14px 28px; border-radius: 10px; text-align: center; box-shadow: 0 4px 12px rgba(56, 189, 248, 0.35);">
                Open Admin Approval Queue &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 28px; background-color: #030712; border-top: 1px solid #1e293b; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #64748b; font-family: monospace;">
          Automated organizer notification for API Blitz 2026 · Dhirubhai Ambani University
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

    const info = await transporter.sendMail({
      from: `"API Blitz Bot" <${process.env.GMAIL_USER}>`,
      to: recipients.join(", "),
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(
      `[EMAIL_NOTIFIER] Notification sent successfully for team "${params.teamName}": ${info.messageId}`
    );
    return true;
  } catch (error) {
    // Log error cleanly without crashing or interrupting caller
    console.error("[EMAIL_NOTIFIER] Failed to send registration notification:", error);
    return false;
  }
}

export interface ShortlistEmailParams {
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  partnerName?: string;
  partnerEmail?: string;
  rank?: number | null;
  presentationDate?: string;
  presentationTime?: string;
  presentationVenue?: string;
}

/**
 * Sends an official celebratory Top 7 Shortlist email to the group leader (and partner)
 * informing them that their squad has advanced to the next round / grand finale.
 */
export async function sendShortlistNotificationEmail(
  params: ShortlistEmailParams
): Promise<boolean> {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn(
        `[SHORTLIST_EMAIL] Transporter unavailable (GMAIL_USER or GMAIL_APP_PASSWORD missing). Notification skipped for team "${params.teamName}".`
      );
      return false;
    }

    const siteUrl = getPublicSiteUrl();
    const dashboardUrl = `${siteUrl}/dashboard`;
    const venue = params.presentationVenue || "CEP 105, Dhirubhai Ambani University";
    const dateStr = params.presentationDate || "Monday, 2 November 2026";
    const timeStr = params.presentationTime || "8:00 PM IST";

    const subject = `🏆 [API Blitz 2026] Important: Team "${params.teamName}" Shortlisted for Live Presentation Round!`;

    const textContent = `
Dear ${params.leaderName},

We are pleased to inform you that your team, "${params.teamName}", has been officially SHORTLISTED for the Grand Finale & Live Presentation Round of API Blitz 2026!

Following an extensive jury evaluation of all sprint submissions, repositories, and technical deliverables, your squad has been selected among the Top 7 Finalists. In this final round, you will be presenting your application live before the judging panel.

--- GRAND FINALE & PRESENTATION DETAILS ---
• Shortlisted Team: ${params.teamName}
• Date: ${dateStr}
• Time: ${timeStr} (Reporting time: 7:45 PM for AV & environment check)
• Venue: ${venue}

--- WHAT YOU NEED TO PRESENT ---
Each shortlisted squad will be allotted 5–7 minutes for a live demonstration, followed by a 3-minute technical Q&A with the jury:
1. Live Application Demo: Present your working application live in real time. Showcase key user workflows, responsiveness, and how the core problem statement is addressed.
2. API Integrations Deep Dive: Explain in detail how you consumed and utilized your assigned APIs, data pipelines, error-handling mechanisms, and how they power your application's functionality.
3. System Architecture & Code: Walk through your repository structure, tech stack, database models, and engineering trade-offs.

--- SQUAD ATTENDANCE & SETUP ---
• In-Person Requirement: Both squad members must attend in person at CEP 105.
• Equipment to Bring: Please bring your laptops, chargers, active local or hosted deployments, and any display adapters required for projection.

You can view your shortlist status anytime on your team dashboard:
${dashboardUrl}

Congratulations once again to both hackers on earning a spot in the Top 7. We look forward to an outstanding live presentation on Monday evening!

Warm regards,

The Organizing Committee · API Blitz 2026
Microsoft Student Technical Club (MSTC)
Dhirubhai Ambani University, Gandhinagar
`.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; margin: 0 auto; background-color: #0b1329; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.7);">
    
    <!-- Hero Banner with Gradient -->
    <tr>
      <td style="padding: 32px 28px 24px; background: linear-gradient(135deg, #091e3a 0%, #17103a 50%, #2b1055 100%); border-bottom: 1px solid #334155; text-align: center;">
        <span style="display: inline-block; padding: 6px 14px; font-size: 11px; font-weight: 800; font-family: monospace; letter-spacing: 2px; text-transform: uppercase; color: #fbbf24; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 9999px; margin-bottom: 14px;">
          🏆 OFFICIAL TOP 7 FINALIST SELECTION
        </span>
        <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; line-height: 1.2;">
          API BLITZ 2026
        </h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; font-family: monospace;">
          Microsoft Student Technical Club · Dhirubhai Ambani University
        </p>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 32px 28px;">
        <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #f8fafc;">
          Dear <span style="color: #38bdf8;">${params.leaderName}</span>,
        </p>
        <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.7; color: #cbd5e1;">
          We are pleased to inform you that your squad, <strong style="color: #38bdf8; font-size: 15px;">${params.teamName}</strong>, has been officially <strong style="color: #fbbf24;">SHORTLISTED</strong> for the <strong>Grand Finale &amp; Live Presentation Round</strong> of API Blitz 2026!
        </p>
        <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.7; color: #94a3b8;">
          Following a comprehensive jury evaluation of all repositories, sprint deliverables, and architectural implementations, your project was selected among the Top 7 squads to compete in the final evaluation round before the judging panel.
        </p>

        <!-- Qualified Squad Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%); border: 1px solid #3b82f6; border-radius: 12px; margin-bottom: 26px; overflow: hidden;">
          <tr>
            <td style="padding: 18px 20px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 10px; font-family: monospace; text-transform: uppercase; color: #93c5fd; letter-spacing: 1.5px; display: block; margin-bottom: 4px;">
                      SHORTLISTED SQUAD
                    </span>
                    <span style="font-size: 20px; font-weight: 800; color: #ffffff; font-family: monospace;">
                      ${params.teamName}
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 800; font-family: monospace; color: #10b981; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 8px;">
                      ✓ SHORTLISTED
                    </span>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 12px; font-family: monospace; color: #cbd5e1;">
                <div><strong style="color: #38bdf8;">Leader:</strong> ${params.leaderName} (${params.leaderEmail})</div>
                ${params.partnerName ? `<div style="margin-top: 4px;"><strong style="color: #c084fc;">Partner:</strong> ${params.partnerName} (${params.partnerEmail || "N/A"})</div>` : ""}
              </div>
            </td>
          </tr>
        </table>

        <!-- Presentation Round Schedule Details -->
        <div style="background-color: #030712; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 26px;">
          <h3 style="margin: 0 0 14px 0; font-size: 13px; font-family: monospace; text-transform: uppercase; letter-spacing: 1.5px; color: #fbbf24;">
            🎤 Live Presentation Round Details
          </h3>
          <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 12px; font-family: monospace; color: #e2e8f0;">
            <tr>
              <td width="28%" style="color: #64748b; font-weight: 600;">DATE:</td>
              <td style="font-weight: 700; color: #ffffff;">${dateStr}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-weight: 600;">TIME:</td>
              <td style="font-weight: 700; color: #38bdf8;">${timeStr} <span style="font-size: 10px; color: #94a3b8; font-weight: normal;">(Reporting time: 7:45 PM)</span></td>
            </tr>
            <tr>
              <td style="color: #64748b; font-weight: 600;">VENUE:</td>
              <td style="font-weight: 700; color: #fbbf24;">${venue}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-weight: 600;">FORMAT:</td>
              <td style="color: #e2e8f0;">5–7 Min Live Product Demo + 3 Min Technical Q&amp;A</td>
            </tr>
          </table>
        </div>

        <!-- What to Present Card -->
        <div style="background-color: #080e1e; border: 1px solid #1e3a5f; border-radius: 12px; padding: 20px; margin-bottom: 26px;">
          <h3 style="margin: 0 0 12px 0; font-size: 13px; font-family: monospace; text-transform: uppercase; letter-spacing: 1.5px; color: #38bdf8;">
            📋 Presentation Requirements &amp; Guidelines
          </h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px; line-height: 1.7; color: #cbd5e1; font-family: monospace;">
            <li style="margin-bottom: 8px;">
              <strong style="color: #ffffff;">Live App Demonstration:</strong> Present your working application live. Walk through the core functionality, user flow, UI design, and problem statement resolution.
            </li>
            <li style="margin-bottom: 8px;">
              <strong style="color: #ffffff;">API Integrations Deep Dive:</strong> Explicitly explain and demonstrate how your squad integrated the assigned secret APIs, showcasing request/response workflows, data handling, and the technical value added to your product.
            </li>
            <li style="margin-bottom: 8px;">
              <strong style="color: #ffffff;">Technical Architecture:</strong> Discuss your engineering design, codebase structure, schema models, and resilience to errors or rate limits.
            </li>
            <li>
              <strong style="color: #ffffff;">In-Person Equipment:</strong> Both team members must attend in person at CEP 105. Bring your laptops, chargers, and pre-tested local or cloud environments ready for projection.
            </li>
          </ul>
        </div>

        <!-- CTA Button -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
          <tr>
            <td align="center">
              <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%); color: #020617; font-size: 14px; font-weight: 800; font-family: monospace; text-decoration: none; padding: 14px 32px; border-radius: 12px; text-align: center; box-shadow: 0 6px 20px rgba(56, 189, 248, 0.35);">
                Open Team Dashboard &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 28px; background-color: #030712; border-top: 1px solid #1e293b; text-align: center;">
        <p style="margin: 0 0 6px 0; font-size: 12px; color: #94a3b8; font-weight: 600;">
          Microsoft Student Technical Club (MSTC)
        </p>
        <p style="margin: 0; font-size: 11px; color: #64748b; font-family: monospace;">
          Dhirubhai Ambani University, Gandhinagar, Gujarat
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

    // Send email to Leader (and CC partner if email is valid and different)
    const toRecipients = [params.leaderEmail.trim()];
    let ccRecipients: string[] | undefined = undefined;

    if (
      params.partnerEmail &&
      params.partnerEmail.trim().toLowerCase() !== params.leaderEmail.trim().toLowerCase()
    ) {
      ccRecipients = [params.partnerEmail.trim()];
    }

    const info = await transporter.sendMail({
      from: `"API Blitz Organizers" <${process.env.GMAIL_USER}>`,
      to: toRecipients.join(", "),
      cc: ccRecipients ? ccRecipients.join(", ") : undefined,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(
      `[SHORTLIST_EMAIL] Successfully sent Top 7 shortlist email to "${params.leaderEmail}" for team "${params.teamName}": ${info.messageId}`
    );
    return true;
  } catch (error) {
    console.error(
      `[SHORTLIST_EMAIL] Failed to send shortlist email to "${params.leaderEmail}" for team "${params.teamName}":`,
      error
    );
    return false;
  }
}

