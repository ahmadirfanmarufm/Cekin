import { NextResponse } from "next/server";
import { generateStructuredContent } from "@/lib/gemini";

const chatAnalysisSchema = {
  type: "object",
  properties: {
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID unik temuan, misal: 'otp-request'" },
          label: { type: "string", description: "Nama indikator, misal: 'Permintaan Kode OTP'" },
          why: { type: "string", description: "Penjelasan mengapa ini mencurigakan" },
          tactic: { type: "string", description: "Cara pelaku penipuan memanfaatkan ini" },
          recommendation: { type: "string", description: "Langkah aman yang harus dilakukan korban" },
          points: { type: "integer", description: "Skor bahaya (10-50)" },
        },
        required: ["id", "label", "why", "tactic", "recommendation", "points"],
      },
    },
  },
  required: ["findings"],
};

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const prompt = `
      Anda adalah sistem keamanan siber ahli yang bertugas mendeteksi penipuan (scam/phishing).
      Analisis teks berikut: "${text}"
      
      Temukan indikator penipuan. Jika pesan aman, kembalikan array "findings" kosong.
    `;

    const rawResult = await generateStructuredContent<{
      findings: Array<{
        id: string;
        label: string;
        why: string;
        tactic: string;
        recommendation: string;
        points: number;
      }>;
    }>({
      prompt,
      schema: chatAnalysisSchema,
      temperature: 0.2,
    });

    const findings = rawResult.findings || [];
    
    const rawScore = findings.reduce((sum, item) => sum + item.points, 0);
    const score = Math.min(100, rawScore);
    const level = score >= 60 ? "Kritis" : score >= 40 ? "Tinggi" : score >= 18 ? "Sedang" : "Rendah";

    return NextResponse.json({
      score,
      level,
      findings,
      category: "Pesan / Chat",
    });

  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menganalisis pesan" },
      { status: 500 }
    );
  }
}