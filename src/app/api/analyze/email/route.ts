import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

function isEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const email = value.trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return regex.test(email);
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { error: "Email wajib diisi" },
        { status: 400 }
      );
    }

    if (!isEmail(text)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    const email = text.trim().toLowerCase();

    const formData = new FormData();
    formData.append("email", email);

    const response = await fetch("https://periksadata.com", {
      method: "POST",
      body: formData,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const findings: {
      id: string;
      label: string;
      why: string;
      tactic: string;
      recommendation: string;
      points: number;
    }[] = [];
    let rawScore = 0;

    $(".bg--dark .feature__body").each((index: any, element: any) => {
      const title = $(element).find("h5").text().trim();
      const bTags = $(element).find("b");

      const date = bTags.eq(0).text().replace("<br>", "").trim();
      const dataLeaked = bTags.eq(1).text().replace("<br>", "").trim();

      if (title) {
        findings.push({
          id: `breach-${index}`,
          label: `Kebocoran Data: ${title}`,
          why: `Data Anda terdeteksi dalam insiden kebocoran ini (${date}).`,
          tactic: `Pelaku penipuan sering menggunakan data bocor (${dataLeaked}) untuk melancarkan serangan phishing yang sangat meyakinkan.`,
          recommendation: `Segera ganti password Anda, aktifkan 2FA, dan waspadai email atau pesan masuk yang mencurigakan.`,
          points: 20,
        });
        rawScore += 20;
      }
    });

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
      category: "Cek Kebobolan Email",
    });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { error: "Gagal memeriksa data kebocoran" },
      { status: 500 }
    );
  }
}