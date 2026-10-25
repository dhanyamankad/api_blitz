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

    const siteUrl = process.env.AUTH_URL || "https://api-blitz-mstc.vercel.app";
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
