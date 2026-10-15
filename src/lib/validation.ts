export const ALLOWED_DOMAIN = "dau.ac.in";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isDauEmail(email: string): boolean {
  return /^[a-z0-9._+-]+@dau\.ac\.in$/.test(normalizeEmail(email));
}

export function isGithubRepoUrl(url: string): boolean {
  return /^https:\/\/github\.com\/[A-Za-z0-9-]+\/[A-Za-z0-9._-]+\/?$/.test(url.trim());
}

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  return adminEmails().includes(normalizeEmail(email));
}
