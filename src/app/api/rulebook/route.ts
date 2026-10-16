import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [fileRecord, nameRecord] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "rulebook_pdf_base64" } }),
      prisma.setting.findUnique({ where: { key: "rulebook_file_name" } }),
    ]);

    if (fileRecord?.value && fileRecord.value.length > 0) {
      const buffer = Buffer.from(fileRecord.value, "base64");
      const fileName = nameRecord?.value || "API-Blitz-Official-Rulebook.pdf";

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
          "Content-Length": buffer.length.toString(),
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      });
    }

    // Fallback: try reading the local public/rulebook.pdf or redirecting
    const localFilePath = path.join(process.cwd(), "public", "rulebook.pdf");
    if (fs.existsSync(localFilePath)) {
      const fileBuffer = fs.readFileSync(localFilePath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'inline; filename="API-Blitz-Official-Rulebook.pdf"',
          "Content-Length": fileBuffer.length.toString(),
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      });
    }

    // Default redirect if file buffer cannot be read directly
    return NextResponse.redirect(new URL("/rulebook.pdf", process.env.AUTH_URL || "https://api-blitz-mstc.vercel.app"));
  } catch (error) {
    console.error("Failed to serve rulebook:", error);
    return NextResponse.redirect(new URL("/rulebook.pdf", process.env.AUTH_URL || "https://api-blitz-mstc.vercel.app"));
  }
}
