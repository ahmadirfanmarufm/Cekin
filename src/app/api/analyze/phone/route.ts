import { NextResponse } from "next/server";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { Finding } from "@/lib/cekin/analysis";

// ---------- Aduan Nomor (Indonesia) ----------
const ADUAN_URL = "https://aduannomor.id/api/v.1/ticket/phone-check";

interface AduanData {
  reported_phone: string;
  reported_phone_status: string;
  reported_count: number;
  reported_kejahatan: unknown[];
  reported_status_laporan: unknown[];
}

async function checkAduanNomor(
  callingCode: string,
  nationalNumber: string,
): Promise<AduanData> {
  const form = new FormData();
  form.append("calling_code", `+${callingCode}`);
  form.append("phone_number", nationalNumber);

  const res = await fetch(ADUAN_URL, {
    method: "POST",
    body: form,
    cache: "no-store",
    headers: {
      Origin: "https://aduannomor.id",
      Referer: "https://aduannomor.id",
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
      Accept: "*/*",
    },
    signal: AbortSignal.timeout(8000),
  });

  const raw = await res.text();
  if (!res.ok)
    throw new Error(`Aduannomor HTTP ${res.status}: ${raw.slice(0, 200)}`);

  const json = JSON.parse(raw);
  if (json.error || !json.data) {
    throw new Error(`Respons aduannomor: ${raw.slice(0, 200)}`);
  }
  return json.data as AduanData;
}

// Cek Nomor Luar +1 Database
const CALLSHIELD_URL =
  "https://raw.githubusercontent.com/SysAdminDoc/CallShield/master/data/spam_numbers.json";
const CALLSHIELD_TTL = 6 * 60 * 60 * 1000; // 6 jam

interface CallShieldNumber {
  number: string;
  type: string;
  reports: number;
  first_seen?: string;
  last_seen?: string;
  description?: string;
  sources?: string[];
}

interface CallShieldDatabase {
  version: number;
  updated: string;
  numbers: CallShieldNumber[];
  prefixes?: { prefix: string; type: string; description?: string }[];
}

let csCache: {
  at: number;
  db: CallShieldDatabase;
  map: Map<string, CallShieldNumber>;
} | null = null;

async function getCallShield() {
  if (csCache && Date.now() - csCache.at < CALLSHIELD_TTL) return csCache;

  const res = await fetch(CALLSHIELD_URL, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`CallShield HTTP ${res.status}`);

  const db: CallShieldDatabase = await res.json();
  const map = new Map(db.numbers.map((n) => [n.number, n]));
  csCache = { at: Date.now(), db, map };
  return csCache;
}

// ---------- Util ----------
const toLabel = (item: unknown) =>
  typeof item === "string"
    ? item
    : String(
        (item as any)?.name ?? (item as any)?.label ?? JSON.stringify(item),
      );

function levelFromScore(score: number) {
  if (score < 25) return "Rendah";
  if (score < 50) return "Sedang";
  if (score < 75) return "Tinggi";
  return "Kritis";
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Nomor telepon wajib diisi" },
        { status: 400 },
      );
    }

    const phone = parsePhoneNumberFromString(text.trim());
    if (!phone || !phone.isValid()) {
      return NextResponse.json(
        { error: "Format nomor telepon tidak valid" },
        { status: 400 },
      );
    }

    const findings: Finding[] = [];
    let score = 0;
    let database: Record<string, unknown>;
    let notFoundMessage: string;

    if (phone.country === "ID") {
      // ===== Nomor Indonesia -> Aduan Nomor =====
      const data = await checkAduanNomor(
        phone.countryCallingCode,
        phone.nationalNumber,
      );

      const statuses = data.reported_phone_status
        .split("|")
        .map((s) => s.trim().toLowerCase());
      const count = data.reported_count ?? 0;
      const crimes = (data.reported_kejahatan ?? []).map(toLabel);

      if (count > 0) {
        const pts = count >= 10 ? 70 : count >= 3 ? 55 : 40;
        score += pts;
        findings.push({
          id: "aduan-count",
          label: `Dilaporkan ${count} kali di Aduan Nomor Komdigi`,
          why: "Nomor ini pernah dilaporkan pengguna lain sebagai nomor bermasalah.",
          tactic:
            "Penipu sering memakai nomor yang sama berulang kali sampai diblokir.",
          recommendation:
            "Jangan berikan OTP, PIN, atau data pribadi. Verifikasi lewat kanal resmi.",
          points: pts,
        });
      }

      if (crimes.length > 0) {
        score += 15;
        findings.push({
          id: "aduan-kejahatan",
          label: `Jenis laporan: ${crimes.join(", ")}`,
          why: "Laporan terhadap nomor ini dikategorikan sebagai modus kejahatan tertentu.",
          tactic:
            "Pelaku biasanya mengulang modus yang sama pada banyak korban.",
          recommendation:
            "Cocokkan dengan modus yang sedang Anda alami dan hentikan komunikasi.",
          points: 15,
        });
      }

      database = { name: "Aduan Nomor Komdigi", reports: count, statuses };
      notFoundMessage =
        "Belum ada laporan di Aduan Nomor. Ini bukan jaminan nomor aman.";
    } else {
      const { db, map } = await getCallShield();
      const matched = map.get(phone.number);

      const prefixMatch = db.prefixes?.find((p) =>
        phone.number.startsWith(p.prefix),
      );

      if (matched) {
        const r = matched.reports;
        const pts = r >= 100 ? 70 : r >= 20 ? 55 : r >= 5 ? 40 : 30;
        score += pts;
        findings.push({
          id: "callshield-number",
          label: `Nomor terindikasi ${matched.type}`,
          why: `Nomor ini ada di database CallShield dengan ${r} laporan${
            matched.last_seen
              ? ` (terakhir dilaporkan ${matched.last_seen})`
              : ""
          }.`,
          tactic:
            matched.description ||
            "Nomor ini tercatat sebagai nomor yang terindikasi spam.",
          recommendation:
            "Jangan memberikan OTP, PIN, password, atau informasi pribadi. Verifikasi identitas penelepon melalui kanal resmi.",
          points: pts,
        });
      }

      if (prefixMatch) {
        score += 20;
        findings.push({
          id: "callshield-prefix",
          label: `Awalan nomor terindikasi ${prefixMatch.type}`,
          why: "Awalan nomor ini tercatat dipakai untuk telepon spam atau telemarketing.",
          tactic:
            prefixMatch.description ||
            "Penelepon memakai banyak nomor dengan awalan yang sama.",
          recommendation:
            "Waspada, apalagi jika Anda tidak sedang menunggu telepon dari luar negeri.",
          points: 30,
        });
      }

      database = {
        name: "CallShield",
        updated: db.updated,
        reports: matched?.reports ?? 0,
        sources: matched?.sources ?? [],
        firstSeen: matched?.first_seen,
        lastSeen: matched?.last_seen,
      };
      notFoundMessage =
        "Nomor belum ditemukan di database CallShield (data utamanya nomor Amerika/Kanada). Ini bukan jaminan nomor aman.";
    }

    score = Math.min(score, 100);

    return NextResponse.json({
      score,
      level: levelFromScore(score),
      category: "Cek Nomor Telepon",
      phone: phone.number,
      status: findings.length ? "reported" : "not_found",
      findings,
      message: findings.length ? undefined : notFoundMessage,
      database,
    });
  } catch (error) {
    console.error("Phone checker error:", error);
    return NextResponse.json(
      {
        error: "Gagal memeriksa nomor telepon",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
