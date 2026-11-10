import { NextResponse } from "next/server";
import { generateStructuredContent } from "@/lib/gemini";
import {
  collectIdentityEvidence,
  verifyDomainIdentity,
  type DomainIdentity,
} from "@/lib/cekin/url-verification";

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
  "rb.gy", "rebrand.ly", "linktr.ee", "shorturl.at", "wa.me",
  "ow.ly", "goo.gl", "t.ly", "tiny.cc", "v.gd", "shorte.st", "adf.ly", "bc.vc",
  "ouo.io", "clck.ru", "bl.ink", "soo.gd", "lnkd.in", "qr.ae", "cur.lv", "x.co",
  "u.to", "j.mp", "bitly.com", "bit.do", "mcaf.ee", "su.pr", "trib.al", "dlvr.it",
  "ift.tt", "tiny.one", "short.io", "short.cm", "kutt.it", "snip.ly", "hyperurl.co",
  "lnk.to", "lnk.bio", "bio.link", "1url.com", "2u.pw", "chilp.it", "clk.sh",
  "cli.re", "dwarfurl.com", "easyurl.net", "fur.ly", "gg.gg", "href.li", "migre.me",
  "n9.cl", "ouo.press", "shrinkme.io", "shrtco.de", "t2m.io", "tny.im", "urlz.fr",
  "vzturl.com", "zpr.io", "adfoc.us", "exe.io", "fc.lc", "gplinks.co",
  "linkvertise.com", "mboost.me", "shrinke.me", "droplink.co", "safelinku.com",
  "za.gl", "cutt.us", "shorturl.asia", "smarturl.it", "qrco.de", "lc.cx", "rotf.lol",
  "spoo.me", "u.nu", "x.gd", "zzb.bz", "urlr.me", "rlu.ru", "tinyarro.ws", "0rz.tw",
  "1ink.cc", "3.ly", "tiny.ie", "short.gy", "ulvis.net", "go2l.ink", "bom.so",
  "t.cn", "okt.to", "ity.im", "sh.st", "po.st"
]);


const RISKY_TLDS = new Set([
  "xyz", "top", "work", "click", "buzz", "cfd", "monster", "sbs",
  "rest", "cam", "fit", "icu", "gq", "ml", "cf", "ga", "tk",
  "loan", "win", "bid", "men", "date", "download", "stream", "review", "trade", "party",
  "racing", "accountant", "science", "faith", "cricket", "gdn", "kim", "country", "webcam", "link",
  "live", "online", "site", "website", "space", "store", "shop", "tech", "fun", "life",
  "world", "today", "club", "vip", "info", "biz", "cc", "ws", "pw", "su",
  "zip", "mov", "bar", "bond", "quest", "uno", "host", "press", "digital", "network",
  "cloud", "rocks", "ninja", "guru", "support", "services", "center", "agency", "email", "solutions",
  "run", "one", "pics", "mom", "lol", "cyou", "ltd", "wang", "xin", "ren",
  "red", "ooo", "gold", "bet", "poker", "casino", "bingo", "game", "games", "vegas",
  "cash", "money", "loans", "credit", "finance", "capital", "trading", "forex", "deals", "gift"
]);

const SENSITIVE_BRANDS = [

  "bca", "bri", "mandiri", "bankmandiri", "bni", "cimb", "bsi", "btn", "permata", "danamon", "ocbc",
  "maybank", "panin", "btpn", "jago", "seabank", "allobank", "jenius", "livin", "brimo",
  "klikbca", "mybca", "bjb",

  "dana", "ovo", "gopay", "linkaja", "shopeepay", "isaku", "doku", "flip", "kredivo",
  "akulaku", "spaylater", "gopaylater", "indodana", "atome",

  "shopee", "tokopedia", "lazada", "blibli", "bukalapak", "tiktokshop", "olx", "zalora",
  "traveloka", "tiketcom", "pegipegi", "agoda", "grab", "gojek", "maxim",

  "jne", "jnt", "sicepat", "anteraja", "posindonesia", "ninjaxpress", "idexpress",
  "tiki", "dhl", "fedex",

  "telkomsel", "indosat", "axis", "smartfren", "indihome",

  "whatsapp", "telegram", "facebook", "instagram", "tiktok", "twitter", "youtube",

  "pajak", "djp", "coretax", "bpjs", "polri", "kominfo", "komdigi", "kemnaker",
  "dukcapil", "imigrasi", "samsat", "beacukai", "ojk", "prakerja", "pln", "pertamina",
  "mypertamina", "kemensos", "bansos",

  "google", "apple", "netflix", "microsoft", "amazon", "paypal", "spotify", "vidio",
  "dropbox", "icloud", "gmail", "binance", "indodax", "pintu", "coinbase", "metamask",
  "garena", "freefire", "mobilelegends", "roblox"
];

const GAMBLING_KEYWORDS = [
  "slot", "gacor", "maxwin", "pragmatic", "judi", "togel", "casino", "poker",
  "rtp", "deposit", "judol", "sbobet", "bandar", "taruhan", "jackpot", "zeus",
  "olympus", "mahjong", "scatter", "habanero", "microgaming", "pgsoft", "slot88",
  "depo", "withdraw", "wd", "bonus", "member", "livecasino", "bocoran", "anti-rungkad",
  "rungkad", "freebet", "agen", "parlay", "spadegaming", "jokergaming", "link-alternatif",
  "situs-judi", "slot-online", "domino99", "qq", "capsa", "cuan", "garansi-kekalahan",
  "slot-gacor", "slot777", "rajaslot", "dewaslot", "dewa-slot", "slot-demo", "demo-slot",
  "situs-slot", "slot-terpercaya", "judi-online", "judionline", "judi-bola", "judibola",
  "bola-online", "ibcbet", "maxbet", "cmd368", "sabung-ayam", "sabungayam", "tembak-ikan",
  "poker-online", "pokerqq", "dominoqq", "bandarq", "bandar-togel", "togel-online",
  "toto-macau", "totomacau", "hongkong-pools", "hk-pools", "angka-jitu", "prediksi-togel",
  "result-togel", "data-sgp", "paito", "agen-bola", "agen-slot", "agen-judi", "agen-togel",
  "mix-parlay", "sportsbook", "baccarat", "roulette", "blackjack", "sicbo", "dragon-tiger",
  "idnpoker", "idnplay", "joker123", "pragmaticplay", "sweetbonanza", "gatesofolympus",
  "mahjong-ways", "starlight-princess", "new-member", "bonus-new-member", "depo-5000",
  "deposit-pulsa", "slot-dana", "slot-pulsa", "slot-qris", "rtp-live", "rtp-slot",
  "bocoran-rtp", "link-gacor", "situs-gacor", "jam-gacor", "pola-gacor", "scatter-hitam",
  "slot-thailand", "server-thailand", "server-kamboja", "wd-cepat", "jp-paus",
  "bebas-blokir", "anti-nawala", "nawala", "hoki", "hokibet", "gampang-menang"
];

interface RawSignal {
  id: string;
  label: string;
  rawFact: string;
  suggestedPoints: number;
}


function safeNormalizeUrl(value: string): string | null {
  try {
    const u = new URL(value);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    const path = u.pathname.replace(/\/+$/, "");
    return `${u.protocol}//${host}${path}${u.search}`;
  } catch {
    return null;
  }
}


const MIN_SIGNAL_POINTS = 15;

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
  } catch {
    return null;
  }
}

async function fetchPageMetadata(targetUrl: string): Promise<string> {
  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return "";
    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i);
    const h1Matches = Array.from(html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)).map(m => m[1].replace(/<[^>]+>/g, "").trim());

    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
    const description = metaDescMatch ? metaDescMatch[1].trim() : "";
    const h1Text = h1Matches.join(" ");

    return `Title: ${title}\nMeta Description: ${description}\nH1 Content: ${h1Text}`.trim();
  } catch {
    return "";
  }
}

function analyzeUrlStructure(
  urlObj: URL,
  identity: DomainIdentity | null,
): RawSignal[] {
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


  const hostParts = hostname.split(".");
  const tld = hostParts[hostParts.length - 1];
  const riskyTld = RISKY_TLDS.has(tld);

  if (identity?.verdict === "suspicious" && identity.evidence.registration?.notRegistered) {
    signals.push({
      id: "unregistered-domain",
      label: "Domain Tidak Terdaftar",
      rawFact: `Nama domain '${hostname}' tidak ditemukan di registry resmi sehingga tidak dimiliki oleh siapa pun.`,
      suggestedPoints: 30,
    });
    return signals;
  }

  if (identity?.verdict === "verified") {
    return signals;
  }

  for (const brand of SENSITIVE_BRANDS) {
    if (hostname.includes(brand)) {
      const isOfficial = new RegExp(`(^|\\.)${brand}\\.(co\\.id|com|id)$`, "i").test(hostname);
      if (!isOfficial) {
        signals.push({
          id: `brand-spoofing-${brand}`,
          label: `Pencatutan Nama Brand (${brand.toUpperCase()})`,
          rawFact: riskyTld
            ? `Nama '${brand}' muncul dalam host '${hostname}' yang bukan domain resmi, dan memakai akhiran berisiko (.${tld}).`
            : `Nama '${brand}' muncul dalam host '${hostname}', namun bukan domain resmi entitas tersebut.`,
          suggestedPoints: riskyTld ? 40 : 30,
        });
        break;
      }
    }
  }

  if (riskyTld && signals.length > 0) {
    const accompanied = signals.some((s) => s.id !== "insecure-http");
    if (accompanied) {
      signals.push({
        id: "risky-tld-context",
        label: `Akhiran Domain Berisiko (.${tld})`,
        rawFact: `Akhiran (.${tld}) kerap dipakai situs phising sekali pakai, dan muncul bersamaan dengan indikator risiko lain.`,
        suggestedPoints: 15,
      });
    }
  }

  return signals;
}

function analyzeDomainPattern(urlObj: URL): RawSignal[] {
  const signals: RawSignal[] = [];
  const hostname = urlObj.hostname.toLowerCase();

  const domainGamblingPattern = /(toto|slot|bet|casino|poker|togel|maxwin|gacor|dewi|hoki|808|777|888)/i;

  if (domainGamblingPattern.test(hostname)) {
    signals.push({
      id: "gambling-domain-keyword",
      label: "Domain Mengandung Indikator Judi",
      rawFact: `Nama domain '${hostname}' mengandung kata kunci identik situs perjudian.`,
      suggestedPoints: 45,
    });
  }

  return signals;
}

function analyzeGamblingContent(urlObj: URL, metadata: string): RawSignal[] {
  const signals: RawSignal[] = [];

  const urlTarget = `${urlObj.hostname} ${urlObj.pathname}`.toLowerCase();
  const urlHits = GAMBLING_KEYWORDS.filter((k) => urlTarget.includes(k));

  const metaTarget = metadata.toLowerCase();
  const metaHits = GAMBLING_KEYWORDS.filter((k) => metaTarget.includes(k));

  if (urlHits.length > 0) {
    signals.push({
      id: "gambling-seo-poisoning",
      label: "Indikasi Konten Judi Online / SEO Spam",
      rawFact: `Kata kunci perjudian [${urlHits.slice(0, 10).join(", ")}] muncul langsung di nama domain atau jalur URL, bukan sekadar di badan halaman.`,
      suggestedPoints: Math.min(50, 35 + urlHits.length * 5),
    });
    return signals;
  }

  if (metaHits.length >= 2) {
    signals.push({
      id: "gambling-seo-poisoning",
      label: "Indikasi Konten Judi Online / SEO Spam",
      rawFact: `Judul atau heading halaman memuat beberapa kata kunci perjudian: [${metaHits.slice(0, 10).join(", ")}].`,
      suggestedPoints: Math.min(50, 30 + metaHits.length * 5),
    });
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

    const normalizedInput = parsedUrl.href;

    const [sucuriData, pageMetadata, identity] = await Promise.all([
      fetchSucuriScan(normalizedInput),
      fetchPageMetadata(normalizedInput),
      collectIdentityEvidence(parsedUrl.hostname).then((evidence) => {
        try {
          return verifyDomainIdentity(evidence);
        } catch {
          return null;
        }
      }),
    ]);

    const collectedSignals: RawSignal[] = [];

    const heuristicSignals = analyzeUrlStructure(parsedUrl, identity);
    collectedSignals.push(...heuristicSignals);

    const domainSignals = analyzeDomainPattern(parsedUrl);
    collectedSignals.push(...domainSignals);


    const gamblingSignals = analyzeGamblingContent(parsedUrl, pageMetadata);
    collectedSignals.push(...gamblingSignals);

    let sucuriSummary = "";

    if (sucuriData) {
      const finalUrl = sucuriData.site?.final_url || normalizedInput;
      const isShortener = SHORTENER_DOMAINS.has(
        parsedUrl.hostname.toLowerCase().replace(/^www\./, ""),
      );

      const redirectHops: Array<{ url?: string }> = Array.isArray(
        sucuriData.site?.redirects_to,
      )
        ? sucuriData.site.redirects_to
        : [];

      const normalizedFinal = safeNormalizeUrl(finalUrl);
      const hasRealRedirect =
        redirectHops.length > 0 ||
        (normalizedFinal !== null && normalizedFinal !== normalizedInput);

      if (hasRealRedirect || isShortener) {
        const hopsText =
          redirectHops.length > 0
            ? redirectHops.map((h) => h.url).filter(Boolean).join(" → ")
            : finalUrl;

        collectedSignals.push({
          id: "url-redirection",
          label: isShortener ? "Tautan Diperpendek (Shortener)" : "Pengalihan Tautan",
          rawFact: `Tautan diarahkan melalui: ${hopsText}. Tujuan akhirnya adalah '${finalUrl}'.`,
          suggestedPoints: isShortener && redirectHops.length === 0 ? 10 : 5,
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

    const MUST_SURVIVE = new Set([
      "security-blacklist-hit",
      "raw-ip-host",
      "credential-spoofing-at",
      "dangerous-file-download",
      "unregistered-domain",
      "gambling-seo-poisoning",
      "gambling-domain-keyword",
    ]);

    const strongSignals = collectedSignals.filter(
      (s) => MUST_SURVIVE.has(s.id) || s.suggestedPoints >= MIN_SIGNAL_POINTS,
    );

    const verificationNote =
      identity?.verdict === "verified"
        ? `\n      CATATAN PENTING - IDENTITAS DOMAIN TERVERIFIKASI:
      Domain ini terbukti dikelola entitas resmi berdasarkan bukti independen:
      ${identity.reasons.map((r) => `- ${r}`).join("\n      ")}
      Karena itu, sinyal yang berkaitan dengan pencatutan nama brand, umur domain,
      atau akhiran domain sudah otomatis dikesampingkan. Jangan mengarang temuan
      dari sinyal tersebut. Hanya laporkan sinyal yang masih tersisa di daftar.`
        : identity?.verdict === "suspicious"
          ? `\n      CATATAN - IDENTITAS DOMAIN TIDAK TERBUKTI:
      ${identity.reasons.map((r) => `- ${r}`).join("\n      ")}
      Belum ada bukti bahwa domain ini milik entitas resmi. Sampaikan hal ini
      sebagai indikator tambahan, dengan bahasa yang tidak menuduh secara pasti.`
          : "";

    if (strongSignals.length === 0) {
      const cleanNote = identity
        ? `Pemeriksaan domain: ${identity.reasons.join(" ")}`
        : "";

      return NextResponse.json({
        score: 0,
        level: "Rendah",
        findings:
          identity?.verdict === "verified"
            ? [
                {
                  id: "domain-verified",
                  label: "Domain Resmi Terverifikasi",
                  why: cleanNote,
                  tactic:
                    "Tidak ada taktik penipuan yang terdeteksi pada struktur tautan ini.",
                  recommendation:
                    "Tetap pastikan halaman yang terbuka sesuai layanan yang kamu tuju, dan jangan pernah membagikan OTP atau PIN kepada siapa pun.",
                  points: 0,
                },
              ]
            : [],
        category: "URL / Link",
      });
    }

    collectedSignals.length = 0;
    collectedSignals.push(...strongSignals);

    const prompt = `
      Anda adalah analis keamanan siber handal.
      Kami melakukan pemindaian terhadap URL: "${normalizedInput}".

      Informasi Metadata Halaman Target:
      ${pageMetadata || "Metadata tidak berhasil diambil"}

      Informasi Teknis dari Sucuri SiteCheck:
      ${sucuriSummary || "Data Sucuri tidak tersedia (timeout/gagal)"}

      Sinyal Bahaya / Anomali yang Terdeteksi:
      ${JSON.stringify(collectedSignals, null, 2)}
      ${verificationNote}

      Tugas Anda:
      Terjemahkan temuan-temuan di atas ke format JSON yang ramah, jelas, dan edukatif bagi masyarakat awam di Indonesia.
      PENTING: hanya boleh membuat finding dari sinyal yang ada di daftar di atas.
      Jangan menambah temuan baru yang tidak punya sinyal pendukung. Jumlah finding
      tidak boleh melebihi jumlah sinyal.
      Jika terdapat temuan 'gambling-seo-poisoning' atau 'gambling-domain-keyword', jelaskan bahaya situs judi online, penipuan saldo/data pribadi, serta risiko finansial secara eksplisit.
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

    const allowedById = new Map(collectedSignals.map((s) => [s.id, s.suggestedPoints]));
    const seen = new Set<string>();

    const findings = (rawResult.findings || [])
      .filter((f) => allowedById.has(f.id) && !seen.has(f.id) && seen.add(f.id))
      .map((f) => ({
        ...f,
        points: Math.min(
          Math.max(0, Math.round(f.points) || 0),
          allowedById.get(f.id)!,
        ),
      }));

    const rawScore = findings.reduce((sum, item) => sum + item.points, 0);
    const score = Math.min(100, rawScore);

    const cappedScore =
      identity?.verdict === "verified" ? Math.min(score, 15) : score;

    const level =
      cappedScore >= 60
        ? "Kritis"
        : cappedScore >= 40
          ? "Tinggi"
          : cappedScore >= 18
            ? "Sedang"
            : "Rendah";

    return NextResponse.json({
      score: cappedScore,
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