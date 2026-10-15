import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const day = 24 * 60 * 60 * 1000;
  const defaults: Record<string, string> = {
    event_start_at: new Date(Date.now() + 7 * day).toISOString(),
    submission_deadline: new Date(Date.now() + 9 * day).toISOString(),
    whatsapp_url: "https://chat.whatsapp.com/PLACEHOLDER",
    rulebook_url: "",
    announcement: "",
  };
  for (const [key, value] of Object.entries(defaults)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }
  const count = await prisma.api.count();
  if (count === 0) {
    await prisma.api.createMany({
      data: Array.from({ length: 10 }, (_, i) => ({
        name: `Sample API ${i + 1}`,
        docsLink: `https://example.com/docs/${i + 1}`,
      })),
    });
  }
  console.log("Seeded placeholder settings and sample APIs.");
}
main().finally(() => prisma.$disconnect());
