import fs from "fs";
import path from "path";

// Load .env variables for standalone script execution
if (typeof process.loadEnvFile === "function") {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
}

import { sendNewRegistrationNotification } from "../src/lib/email";

async function main() {
  console.log("Testing email notification to 202501069@dau.ac.in...");
  console.log("Using GMAIL_USER:", process.env.GMAIL_USER || "(not set)");
  console.log(
    "Using GMAIL_APP_PASSWORD:",
    process.env.GMAIL_APP_PASSWORD ? "[CONFIGURED]" : "(not set)"
  );
  console.log(
    "Using NOTIFICATION_EMAIL:",
    process.env.NOTIFICATION_EMAIL || "202501069@dau.ac.in"
  );

  const success = await sendNewRegistrationNotification({
    teamName: "Test Squad 404",
    leaderName: "Dhanya Mankad",
    leaderEmail: "202501069@dau.ac.in",
    memberName: "Test Teammate",
    memberEmail: "202501431@dau.ac.in",
  });

  if (success) {
    console.log("✅ Test email delivered successfully! Check your inbox.");
  } else {
    console.error(
      "❌ Failed to send test email. Please ensure GMAIL_USER and GMAIL_APP_PASSWORD are set in your .env file."
    );
  }
}

main();
