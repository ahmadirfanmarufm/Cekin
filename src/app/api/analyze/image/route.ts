import { NextResponse } from "next/server";
import { generateStructuredContent } from "@/lib/gemini";

const imageAnalysisSchema = {
  type: "object",
  properties: {
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID unik temuan, misal: 'edited-receipt-font' atau 'fake-letterhead'" },
          label: { type: "string", description: "Nama indikator visual / isi temuan" },
          why: { type: "string", description: "Mengapa gambar atau teks di dalamnya terindikasi mencurigakan / palsu" },
          tactic: { type: "string", description: "Cara pelaku memanfaatkan trik visual atau pesan ini untuk menipu" },
          recommendation: { type: "string", description: "Langkah verifikasi atau pencegahan yang wajib dilakukan korban" },
          points: { type: "integer", description: "Skor bahaya (10-50)" },
        },
        required: ["id", "label", "why", "tactic", "recommendation", "points"],
      },
    },
  },
  required: ["findings"],
};

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File gambar tidak ditemukan." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format gambar tidak didukung. Gunakan JPG, PNG, atau WEBP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Ukuran gambar maksimal 5 MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    const prompt = `
      Anda adalah ahli forensik digital dan analis keamanan siber yang bertugas mendeteksi penipuan visual dan dokumen palsu.
      Periksa gambar ini secara mendalam, baik dari teks yang tertulis maupun anomali visualnya:
      
      Perhatikan indikator berikut:
      1. Manipulasi visual / tanda editing: Font yang tidak seragam, tata letak berantakan, kualitas resolusi logo tidak rata, stempel palsu, atau bukti transfer yang diedit.
      2. Pesan teks penipuan: Surat panggilan kepolisian/instansi palsu, bukti transfer fiktif, screenshot chat mencurigakan (minta OTP/PIN, penagihan tagihan ilegal/APK), atau pengumuman menang undian berhadiah.
      3. Brand impersonation: Menggunakan logo instansi resmi (bank, BUMN, instansi pemerintah) namun kontak/tata bahasanya tidak profesional atau tidak resmi.

      Jika gambar terbukti aman, dokumen asli yang sah, atau tidak ada tanda manipulasi/penipuan, kembalikan array "findings" kosong.
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
      schema: imageAnalysisSchema,
      temperature: 0.1,
      image: {
        mimeType: file.type,
        data: base64Data,
      },
    });

    const findings = rawResult.findings || [];
    const rawScore = findings.reduce((sum, item) => sum + item.points, 0);
    const score = Math.min(100, rawScore);
    const level =
      score >= 60
        ? "Kritis"
        : score >= 40
        ? "Tinggi"
        : score >= 18
        ? "Sedang"
        : "Rendah";

    return NextResponse.json({
      score,
      level,
      findings,
      category: "Informasi Lainnya",
    });

  } catch (error: unknown) {
    console.error("Gemini image analysis error:", error);
    const message = error instanceof Error ? error.message : "Gagal menganalisis gambar";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}