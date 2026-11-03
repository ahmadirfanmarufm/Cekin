import { NextResponse } from "next/server";
import { generateStructuredContent } from "@/lib/gemini";

const urlAnalysisSchema = {
  type: "object",
  properties: {
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID unik temuan, misal: 'blacklist-google'" },
          label: { type: "string", description: "Nama indikator teknis" },
          why: { type: "string", description: "Penjelasan mengapa temuan teknis ini berbahaya/mencurigakan" },
          tactic: { type: "string", description: "Bagaimana pelaku penipuan memanfaatkannya" },
          recommendation: { type: "string", description: "Saran tindakan aman untuk korban" },
          points: { type: "integer", description: "Skor risiko heuristik (10-50)" },
        },
        required: ["id", "label", "why", "tactic", "recommendation", "points"],
      },
    },
  },
  required: ["findings"],
};

const SHORTENER_DOMAINS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "s.id", "is.gd", "buff.ly", "cutt.ly",
  "rb.gy", "rebrand.ly", "linktr.ee", "shorturl.at", "wa.me"
]);

const SUSPICIOUS_TLDS = new Set([
  "xyz", "top", "work", "click", "buzz", "cfd", "monster", "sbs", 
  "rest", "cam", "fit", "icu", "gq", "ml", "cf", "ga", "tk"
]);

const SENSITIVE_BRANDS = [
  "bca", "bri", "mandiri", "bni", "cimb", "bsi", "dana", "ovo", "gopay",
  "shopee", "tokopedia", "whatsapp", "telegram", "facebook", "instagram",
  "google", "apple", "netflix", "pajak", "pln", "telkomsel"
];

interface RawSignal {
  id: string;
  label: string;
  rawFact: string;
  suggestedPoints: number;
}

async function fetchSucuriScan(targetUrl: string) {
  try {
    const endpoint = `https://sitecheck.sucuri.net/api/v3/?scan=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("Sucuri API check failed or timed out:", err);
    return null;
  }
}

function analyzeUrlStructure(urlObj: URL): RawSignal[] {
  const signals: RawSignal[] = [];
  const hostname = urlObj.hostname.toLowerCase();
  const path = urlObj.pathname;
  const fullUrl = urlObj.href;

  if (urlObj.protocol === "http:") {
    signals.push({
      id: "insecure-http",
      label: "Koneksi Tidak Terenkripsi (HTTP)",
      rawFact: "Tautan tidak menggunakan sertifikat SSL/HTTPS.",
      suggestedPoints: 20,
    });
  }

  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  if (isIpAddress) {
    signals.push({
      id: "raw-ip-host",
      label: "Menggunakan Alamat IP Langsung",
      rawFact: `Domain menggunakan IP address (${hostname}) alih-alih domain resmi terdaftar.`,
      suggestedPoints: 35,
    });
  }

  const hostParts = hostname.split(".");
  const tld = hostParts[hostParts.length - 1];
  if (SUSPICIOUS_TLDS.has(tld)) {
    signals.push({
      id: "suspicious-tld",
      label: `Domain dengan TLD Berisiko (.${tld})`,
      rawFact: `Menggunakan akhiran domain (.${tld}) yang kerap dipakai situs phising sekali pakai.`,
      suggestedPoints: 25,
    });
  }

  if (fullUrl.includes("@")) {
    signals.push({
      id: "credential-spoofing-at",
      label: "Simbol '@' dalam Tautan",
      rawFact: "Tautan mengandung karakter '@' yang berpotensi menyamarkan host sebenarnya.",
      suggestedPoints: 35,
    });
  }

  const dangerousExtensions = /\.(apk|exe|bat|vbs|scr|cmd|zip|rar|iso)$/i;
  if (dangerousExtensions.test(path)) {
    signals.push({
      id: "dangerous-file-download",
      label: "Tautan File Berbahaya",
      rawFact: `URL langsung mengarah ke unduhan berkas executable/arsip (${path}).`,
      suggestedPoints: 40,
    });
  }

  for (const brand of SENSITIVE_BRANDS) {
    if (hostname.includes(brand)) {
      const isOfficial = new RegExp(`(^|\\.)${brand}\\.(co\\.id|com|id)$`, "i").test(hostname);
      if (!isOfficial) {
        signals.push({
          id: `brand-spoofing-${brand}`,
          label: `Pencatutan Nama Brand (${brand.toUpperCase()})`,
          rawFact: `Nama '${brand}' muncul dalam host '${hostname}', namun bukan domain resmi entitas tersebut.`,
          suggestedPoints: 30,
        });
        break;
      }
    }
  }

  return signals;
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "URL wajib diisi" }, { status: 400 });
    }

    let rawInput = text.trim();
    if (!/^https?:\/\//i.test(rawInput)) {
      rawInput = `https://${rawInput}`;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawInput);
    } catch {
      return NextResponse.json({ error: "Format tautan / URL tidak valid" }, { status: 400 });
    }

    const collectedSignals: RawSignal[] = [];

    const heuristicSignals = analyzeUrlStructure(parsedUrl);
    collectedSignals.push(...heuristicSignals);

    const sucuriData = await fetchSucuriScan(rawInput);
    let sucuriSummary = "";

    if (sucuriData) {
      const finalUrl = sucuriData.site?.final_url || rawInput;
      const isShortener = SHORTENER_DOMAINS.has(parsedUrl.hostname.toLowerCase().replace(/^www\./, ""));
      
      if (finalUrl !== rawInput || isShortener) {
        collectedSignals.push({
          id: "url-redirection",
          label: "Pengalihan / URL Shortener",
          rawFact: `Tautan awal '${rawInput}' diarahkan menuju URL akhir: '${finalUrl}'.`,
          suggestedPoints: 5,
        });
      }

      if (Array.isArray(sucuriData.blacklists) && sucuriData.blacklists.length > 0) {
        const vendors = sucuriData.blacklists.map((b: any) => b.vendor).join(", ");
        collectedSignals.push({
          id: "security-blacklist-hit",
          label: `Masuk Blacklist Keamanan (${vendors})`,
          rawFact: `Situs ini sudah ditandai berbahaya/phishing oleh vendor keamanan: ${vendors}.`,
          suggestedPoints: 50,
        });
      }

      const secRating = sucuriData.ratings?.security?.rating || sucuriData.ratings?.total?.rating;
      if (secRating === "E" || secRating === "D") {
        collectedSignals.push({
          id: "low-security-rating",
          label: `Rating Keamanan Sangat Buruk (Grade ${secRating})`,
          rawFact: `Sucuri mendeteksi kerentanan atau indikasi ancaman serius dengan skor keamanan Grade ${secRating}.`,
          suggestedPoints: 30,
        });
      }

      sucuriSummary = `
        - Final URL: ${finalUrl}
        - IP Target: ${sucuriData.site?.ip?.join(", ") || "-"}
        - CDN / Provider: ${sucuriData.site?.cdn?.join(", ") || "-"}
        - Security Grade: ${secRating || "N/A"}
      `;
    }

    if (collectedSignals.length === 0) {
      return NextResponse.json({
        score: 0,
        level: "Rendah",
        findings: [],
        category: "URL / Link",
      });
    }

    const prompt = `
      Anda adalah analis keamanan siber handal.
      Kami melakukan pemindaian terhadap URL: "${rawInput}".
      
      Informasi Teknis dari Sucuri SiteCheck:
      ${sucuriSummary || "Data Sucuri tidak tersedia (timeout/gagal)"}

      Sinyal Bahaya / Anomali yang Terdeteksi:
      ${JSON.stringify(collectedSignals, null, 2)}

      Tugas Anda:
      Terjemahkan temuan-temuan di atas ke format JSON yang ramah, jelas, dan edukatif bagi masyarakat awam di Indonesia.
      Pastikan setiap finding memiliki:
      - 'id': ID unik temuan
      - 'label': Nama indikator yang jelas dan tidak terlalu teknis
      - 'why': Penjelasan mengapa hal ini patut diwaspadai
      - 'tactic': Taktik yang biasa digunakan pelaku penipuan
      - 'recommendation': Langkah aman yang harus dilakukan pengguna sekarang
      - 'points': Nilai poin bahaya (sesuai suggestedPoints)
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
      schema: urlAnalysisSchema,
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
      category: "URL / Link",
    });

  } catch (error: any) {
    console.error("URL analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memeriksa tautan" },
      { status: 500 }
    );
  }
}