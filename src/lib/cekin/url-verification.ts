import { connect as tlsConnect, type PeerCertificate } from "node:tls";



export type IdentityVerdict = "verified" | "suspicious" | "unknown";

export type DomainRegistration = {

  domain: string;

  registeredAt: string | null;

  ageInDays: number | null;

  nameservers: string[];

  statuses: string[];

  selfHostedNameservers: boolean;

  registrar: string | null;

  notRegistered: boolean;

  source: string;
};

export type CertificateIdentity = {

  organization: string | null;

  serialNumber: string | null;

  commonName: string | null;

  isEv: boolean;

  authorized: boolean;
  issuer: string | null;
};

export type IdentityEvidence = {
  registration: DomainRegistration | null;
  certificate: CertificateIdentity | null;
};

export type DomainIdentity = {
  verdict: IdentityVerdict;

  reasons: string[];
  evidence: IdentityEvidence;
};

const RDAP_TIMEOUT_MS = 6000;
const TLS_TIMEOUT_MS = 6000;


const STATIC_RDAP_ENDPOINTS: Record<string, string> = {
  "co.id": "https://rdap.pandi.id/rdap/",
  id: "https://rdap.pandi.id/rdap/",
  "my.id": "https://rdap.pandi.id/rdap/",
  "biz.id": "https://rdap.pandi.id/rdap/",
  "web.id": "https://rdap.pandi.id/rdap/",
  "or.id": "https://rdap.pandi.id/rdap/",
  "ac.id": "https://rdap.pandi.id/rdap/",
  "sch.id": "https://rdap.pandi.id/rdap/",
  "go.id": "https://rdap.pandi.id/rdap/",
  "net.id": "https://rdap.pandi.id/rdap/",
};

const RDAP_BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json";


const MULTI_LABEL_SUFFIXES = new Set([
  "co.id", "my.id", "biz.id", "web.id", "or.id", "ac.id", "sch.id",
  "go.id", "net.id", "co.uk", "ac.uk", "gov.uk", "com.au", "net.au",
  "co.jp", "co.kr", "com.br", "com.my", "com.sg", "com.ph", "co.in",
  "com.hk", "co.nz", "co.za", "com.mx", "co.th", "com.vn", "com.tr",
]);

type BootstrapCache = {
  map: Map<string, string[]>;
  fetchedAt: number;
};

let bootstrapCache: BootstrapCache | null = null;
const BOOTSTRAP_TTL_MS = 24 * 60 * 60 * 1000;


async function fetchRdapBootstrap(): Promise<Map<string, string[]>> {
  if (bootstrapCache && Date.now() - bootstrapCache.fetchedAt < BOOTSTRAP_TTL_MS) {
    return bootstrapCache.map;
  }

  const map = new Map<string, string[]>();

  try {
    const res = await fetch(RDAP_BOOTSTRAP_URL, {
      signal: AbortSignal.timeout(RDAP_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return map;

    const payload = (await res.json()) as {
      services?: Array<[string[], string[]]>;
    };

    for (const entry of payload.services ?? []) {
      const [tlds, urls] = entry;
      if (!Array.isArray(tlds) || !Array.isArray(urls)) continue;
      for (const tld of tlds) map.set(tld.toLowerCase(), urls);
    }

    bootstrapCache = { map, fetchedAt: Date.now() };
  } catch {

  }

  return map;
}


export function getRegistrableDomain(hostname: string): string | null {
  const host = hostname.toLowerCase().replace(/\.$/, "");

  if (!host || host.includes(":") || /^[\d.]+$/.test(host)) return null;

  const labels = host.split(".");
  if (labels.length < 2) return null;

  const lastTwo = labels.slice(-2).join(".");
  const suffixLength = MULTI_LABEL_SUFFIXES.has(lastTwo) ? 3 : 2;

  if (labels.length < suffixLength) return null;

  return labels.slice(-suffixLength).join(".");
}


export async function resolveRdapEndpoint(domain: string): Promise<string | null> {
  const labels = domain.split(".");


  for (const size of [2, 1]) {
    if (labels.length <= size) continue;
    const suffix = labels.slice(-size).join(".");

    const staticEndpoint = STATIC_RDAP_ENDPOINTS[suffix];
    if (staticEndpoint) return staticEndpoint;
  }

  const tld = labels[labels.length - 1];
  const bootstrap = await fetchRdapBootstrap();
  const urls = bootstrap.get(tld);

  return urls?.[0] ?? null;
}

function extractRegistrar(payload: {
  entities?: Array<{
    roles?: string[];
    vcardArray?: [string, Array<[string, unknown, string, unknown]>];
  }>;
}): string | null {
  for (const entity of payload.entities ?? []) {
    if (!entity.roles?.includes("registrar")) continue;

    const vcard = entity.vcardArray?.[1] ?? [];
    for (const field of vcard) {
      if (field[0] === "fn" && typeof field[3] === "string") return field[3];
    }
  }
  return null;
}

function collectOrganizations(payload: {
  entities?: Array<{
    vcardArray?: [string, Array<[string, unknown, string, unknown]>];
  }>;
}): string[] {
  const found: string[] = [];
  for (const entity of payload.entities ?? []) {
    const vcard = entity.vcardArray?.[1] ?? [];
    for (const field of vcard) {
      if (field[0] === "org" && typeof field[3] === "string") found.push(field[3]);
    }
  }
  return found;
}


export async function fetchDomainRegistration(
  domain: string,
): Promise<DomainRegistration | null> {
  const endpoint = await resolveRdapEndpoint(domain);
  if (!endpoint) return null;

  const url = `${endpoint.replace(/\/$/, "")}/domain/${encodeURIComponent(domain)}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(RDAP_TIMEOUT_MS),
      headers: { Accept: "application/rdap+json, application/json" },
    });

    if (res.status === 404) {
      return {
        domain,
        registeredAt: null,
        ageInDays: null,
        nameservers: [],
        statuses: [],
        selfHostedNameservers: false,
        registrar: null,
        notRegistered: true,
        source: url,
      };
    }

    if (!res.ok) return null;

    const payload = (await res.json()) as {
      errorCode?: number;
      events?: Array<{ eventAction?: string; eventDate?: string }>;
      nameservers?: Array<{ ldhName?: string }>;
      status?: string[];
      entities?: Array<{
        roles?: string[];
        vcardArray?: [string, Array<[string, unknown, string, unknown]>];
      }>;
    };

    if (payload.errorCode) return null;

    const events = payload.events ?? [];
    const registeredAt =
      events.find((e) => e.eventAction === "registration")?.eventDate ?? null;

    let ageInDays: number | null = null;
    if (registeredAt) {
      const ts = Date.parse(registeredAt);
      if (!Number.isNaN(ts)) {
        ageInDays = Math.floor((Date.now() - ts) / 86_400_000);
      }
    }

    const nameservers = (payload.nameservers ?? [])
      .map((n) => n.ldhName?.toLowerCase())
      .filter((n): n is string => Boolean(n));

    return {
      domain,
      registeredAt,
      ageInDays,
      nameservers,
      statuses: (payload.status ?? []).map((s) => s.toLowerCase()),
      selfHostedNameservers:
        nameservers.length > 0 &&
        nameservers.every((ns) => ns.endsWith(`.${domain}`)),
      registrar: extractRegistrar(payload),
      notRegistered: false,
      source: url,
    };
  } catch {
    return null;
  }
}


export function fetchCertificateIdentity(
  hostname: string,
): Promise<CertificateIdentity | null> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (value: CertificateIdentity | null) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    };

    const socket = tlsConnect(
      {
        host: hostname,
        servername: hostname,
        port: 443,
        timeout: TLS_TIMEOUT_MS,

        rejectUnauthorized: false,
      },
      () => {
        const cert = socket.getPeerCertificate() as PeerCertificate;
        const authorized = socket.authorized;

        if (!cert || Object.keys(cert).length === 0) {
          finish(null);
          return;
        }

        const subject = (cert.subject ?? {}) as Record<string, string>;
        const issuer = (cert.issuer ?? {}) as Record<string, string>;
        const issuerName = [issuer.O, issuer.CN].filter(Boolean).join(" ") || null;



        const isEv =
          Boolean(subject.businessCategory) ||
          Boolean(subject.jurisdictionC) ||
          /\bEV\b/i.test(issuerName ?? "");

        finish({
          organization: subject.O ?? null,
          serialNumber: subject.serialNumber ?? null,
          commonName: subject.CN ?? null,
          isEv,
          authorized,
          issuer: issuerName,
        });
      },
    );

    socket.on("error", () => finish(null));
    socket.setTimeout(TLS_TIMEOUT_MS, () => finish(null));
  });
}


export async function collectIdentityEvidence(
  hostname: string,
): Promise<IdentityEvidence> {
  const domain = getRegistrableDomain(hostname);

  const [registration, certificate] = await Promise.all([
    domain ? fetchDomainRegistration(domain) : Promise.resolve(null),
    fetchCertificateIdentity(hostname),
  ]);

  return { registration, certificate };
}


export function verifyDomainIdentity(evidence: IdentityEvidence): DomainIdentity {
  const { registration, certificate } = evidence;
  const reasons: string[] = [];

  if (!registration && !certificate) {
    return {
      verdict: "unknown",
      reasons: ["Data registrasi domain dan sertifikat tidak dapat diambil."],
      evidence,
    };
  }

  if (registration?.notRegistered) {
    return {
      verdict: "suspicious",
      reasons: [
        `Domain ${registration.domain} tidak terdaftar di registry resmi — nama ini tidak dimiliki oleh siapa pun.`,
      ],
      evidence,
    };
  }

  const domainAge = registration?.ageInDays ?? null;
  const isOld = domainAge !== null && domainAge >= 365 * 2;
  const selfHosted = registration?.selfHostedNameservers ?? false;
  const hasOrgIdentity = Boolean(certificate?.organization) && certificate?.isEv === true;
  const locked = Boolean(
    registration?.statuses.some((s) => s.includes("transfer prohibited")),
  );

  if (isOld) {
    reasons.push(
      `Domain terdaftar sejak ${registration!.registeredAt!.slice(0, 10)} (${Math.floor(
        domainAge! / 365,
      )} tahun).`,
    );
  }


  if (isOld && (hasOrgIdentity || selfHosted)) {
    if (hasOrgIdentity) {
      reasons.push(
        `Sertifikat TLS memuat identitas badan hukum: ${certificate!.organization}.`,
      );
    }
    if (selfHosted) {
      reasons.push(
        "Server nama (DNS) domain dikelola sendiri, bukan dipinjam dari layanan parkir.",
      );
    }
    if (locked) reasons.push("Status registry menunjukkan domain dikunci dari pemindahan.");

    return { verdict: "verified", reasons, evidence };
  }

  if (isOld) {
    reasons.push("Domain berumur, namun tidak ada penguat identitas badan hukum.");
  }

  if (domainAge !== null && domainAge < 180) {
    reasons.push(`Domain baru terdaftar ${domainAge} hari lalu.`);
  }

  return {
    verdict: "suspicious",
    reasons:
      reasons.length > 0
        ? reasons
        : ["Tidak ditemukan bukti bahwa domain ini dikelola entitas resmi."],
    evidence,
  };
}
