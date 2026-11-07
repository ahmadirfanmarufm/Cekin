import { NextResponse } from "next/server";
import { generateStructuredContent } from "@/lib/gemini";

const investasiAnalysisSchema = {
  type: "object",
  properties: {
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID unik temuan, misal: 'ponzi-scheme'" },
          label: { type: "string", description: "Nama indikator, misal: 'Janji Profit Tidak Realistis'" },
          why: { type: "string", description: "Penjelasan mengapa tawaran investasi ini mencurigakan" },
          tactic: { type: "string", description: "Cara pelaku investasi bodong memanfaatkan hal ini" },
          recommendation: { type: "string", description: "Langkah aman yang harus dilakukan calon investor" },
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
      Anda adalah analis keuangan dan pengawas investasi yang ahli dalam mendeteksi penipuan berkedok investasi (investasi bodong, skema ponzi, money game, robot trading ilegal).
      
      Analisis teks/nama platform investasi berikut: "${text}"
      
      Berikan penilaian Anda. Cari indikator seperti:
      1. Janji keuntungan (profit) pasti atau tidak realistis dalam waktu singkat.
      2. Tidak ada kejelasan badan hukum atau tidak terdaftar di OJK.
      3. Skema member get member (piramida/ponzi).
      4. Tidak ada risiko (risk-free) padahal investasi selalu ada risiko.
      5. Testimoni berlebihan atau memaksa untuk segera deposit (FOMO).
      6. Menggunakan entitas/robot trading tanpa izin resmi.
      
      Jika informasi yang diberikan terlalu sedikit atau tidak ada indikasi penipuan, kembalikan array "findings" kosong.
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
      schema: investasiAnalysisSchema,
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
      category: "Investasi",
    });

  } catch (error: any) {
    console.error("Gemini Investasi analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menganalisis tawaran investasi" },
      { status: 500 }
    );
  }
}