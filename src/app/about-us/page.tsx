import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Eye,
  FileSearch,
  FlaskConical,
  Globe,
  LockKeyhole,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Tone = "blue" | "green" | "amber" | "purple";

const toneClasses: Record<Tone, string> = {
  blue: "bg-[#eaf1fc] text-[#2457a6]",
  green: "bg-[#e9f7ef] text-[#26a269]",
  amber: "bg-[#fff5df] text-[#b87916]",
  purple: "bg-[#f1ecff] text-[#7355b5]",
};

const heroGradient =
  "bg-[radial-gradient(circle_at_80%_10%,#eaf2ff_0%,#ffffff_40%)]";

const heroContent = (
  <div
    className={`${heroGradient} relative flex min-h-[480px] items-center overflow-hidden sm:min-h-[560px] lg:min-h-[600px]`}
  >
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -right-12 -top-20 size-48 rounded-full border border-[#2457a6]/10" />
      <div className="absolute -bottom-28 -left-12 size-56 rounded-full border border-[#2457a6]/10" />
    </div>

    <div className="relative z-10 mx-auto w-full max-w-[1160px] px-5 py-20 text-center sm:px-8 sm:py-24 md:px-10">
      <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf1fc] px-3 py-2 text-[11px] font-extrabold tracking-wide text-[#2457a6]">
        <ShieldCheck size={14} /> Tentang Cekin
      </span>

      <h1 className="mx-auto mt-6 max-w-[920px] text-[39px] font-extrabold leading-[1.12] tracking-[-1.8px] text-[#17233b] sm:text-5xl lg:text-[58px] lg:tracking-[-2.5px]">
        Jangan langsung percaya kalau belum{" "}
        <span className="text-[#2457a6]">diCEKIN</span>
      </h1>

      <p className="mx-auto mt-6 max-w-[700px] text-sm leading-8 text-[#667085] sm:text-base">
        Cekin hadir sebagai benteng pertahanan pertama Anda dari modus
        penipuan online, phishing, dan ancaman siber melalui kecerdasan
        buatan dan simulasi interaktif.
      </p>
    </div>
  </div>
);

const missionContent = (
  <div>
    <span className="text-[11px] font-extrabold tracking-[1px] text-[#2457a6]">
      CERITA DAN MISI KAMI
    </span>

    <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#17233b] sm:text-4xl">
      Membuat keamanan digital lebih mudah dipahami
    </h2>

    <div className="mt-5 space-y-4 text-sm leading-8 text-[#667085]">
      <p>
        Penipuan digital di Indonesia terus berkembang, mulai dari
        phishing, APK jahat, hingga judi online yang memanfaatkan
        tekanan dan rasa percaya penggunanya.
      </p>
      <p>
        Cekin dibangun untuk membantu siapa pun mendapatkan analisis
        instan sekaligus belajar mencegahnya melalui kasus nyata dan
        simulasi yang aman untuk dicoba.
      </p>
    </div>
  </div>
);

const workflowSteps: {
  number: string;
  title: string;
  description: string;
  icon: typeof ScanSearch;
  tone: Tone;
}[] = [
  {
    number: "01",
    title: "Deteksi",
    description: "Masukkan informasi yang terasa mencurigakan.",
    icon: ScanSearch,
    tone: "blue",
  },
  {
    number: "02",
    title: "Analisis AI",
    description: "Dapatkan konteks dan sinyal risiko secara cepat.",
    icon: BrainCircuit,
    tone: "green",
  },
  {
    number: "03",
    title: "Simulasi Edukasi",
    description: "Latih respons aman melalui skenario interaktif.",
    icon: FlaskConical,
    tone: "purple",
  },
];

const workflowContent = (
  <div>
    <span className="text-[11px] font-extrabold tracking-[1px] text-[#2457a6]">
      CARA KERJA CEKIN
    </span>

    <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#17233b] sm:text-4xl">
      Dari ragu menjadi lebih siap
    </h2>

    <div className="mt-7 space-y-3">
      {workflowSteps.map(({ number, title, description, icon: Icon, tone }) => (
        <div
          key={number}
          className="flex items-center gap-3 rounded-xl bg-[#f7f9fc] p-3.5 ring-1 ring-[#e6eaf0]"
        >
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-xl text-xs font-extrabold ${toneClasses[tone]}`}
          >
            {number}
          </span>

          <Icon className={`shrink-0 ${toneClasses[tone].split(" ")[1]}`} size={19} />

          <div>
            <strong className="block text-xs font-bold text-[#17233b]">
              {title}
            </strong>
            <small className="mt-1 block text-[11px] leading-relaxed text-[#667085]">
              {description}
            </small>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const storyContent = (
  <section className="bg-white">
    <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 gap-12 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-2 md:gap-10 md:px-10 lg:gap-16 xl:px-0">
      {missionContent}
      {workflowContent}
    </div>
  </section>
);

const pillars: {
  title: string;
  description: string;
  icon: typeof ScanSearch;
  tone: Tone;
}[] = [
  {
    title: "Cek Ancaman Instan",
    description:
      "Validasi teks, URL, file, dan nomor telepon berbasis AI untuk membantu membaca sinyal risiko dengan lebih cepat.",
    icon: ScanSearch,
    tone: "blue",
  },
  {
    title: "Edukasi & Simulasi Lab",
    description:
      "Latih kepekaan melalui simulasi langsung yang meniru pola phishing, scam, dan manipulasi digital.",
    icon: FlaskConical,
    tone: "green",
  },
  {
    title: "Komunitas & Pelaporan",
    description:
      "Ruang diskusi untuk membagikan pengalaman dan membantu memverifikasi modus penipuan baru.",
    icon: Users,
    tone: "amber",
  },
  {
    title: "Analisis AI & Pemrosesan Data",
    description:
      "Analisis cepat berbasis AI dengan komitmen terhadap pemrosesan data yang aman dan bertanggung jawab.",
    icon: LockKeyhole,
    tone: "purple",
  },
];

const pillarsContent = (
  <section className="bg-[#f7f9fc]">
    <div className="mx-auto w-full max-w-[1160px] px-5 py-16 sm:px-8 sm:py-20 md:px-10 xl:px-0">
      <div className="mx-auto mb-9 max-w-[650px] text-center">
        <span className="inline-flex rounded-full bg-[#eaf1fc] px-3 py-2 text-[11px] font-extrabold tracking-wide text-[#2457a6]">
          PILAR CEKIN
        </span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#17233b]">
          Satu platform, empat cara untuk lebih aman
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
        {pillars.map(({ title, description, icon: Icon, tone }) => (
          <Card
            key={title}
            className="border-0 bg-white p-5 shadow-none ring-1 ring-[#e6eaf0]"
          >
            <CardContent className="p-0">
              <span
                className={`grid size-12 place-items-center rounded-2xl ${toneClasses[tone]}`}
              >
                <Icon size={23} />
              </span>
              <h3 className="mt-5 text-base font-extrabold leading-snug text-[#17233b]">
                {title}
              </h3>
              <p className="mt-3 text-xs leading-6 text-[#667085]">
                {description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

const metrics: {
  value: string;
  label: string;
  icon: typeof Zap;
  tone: Tone;
}[] = [
  {
    value: "< 6 Detik",
    label: "Waktu rata-rata analisis AI",
    icon: Zap,
    tone: "blue",
  },
  {
    value: "10+ Skenario",
    label: "Simulasi modus penipuan siap latih",
    icon: FlaskConical,
    tone: "green",
  },
  {
    value: "6 Jenis Deteksi",
    label: "URL, pesan, gambar, telepon, investasi, email",
    icon: ScanSearch,
    tone: "amber",
  },
  {
    value: "24/7",
    label: "Aksesibilitas sistem real-time",
    icon: Globe,
    tone: "purple",
  },
];

const capabilitiesContent = (
  <section className="bg-white">
    <div className="mx-auto w-full max-w-[1160px] px-5 py-16 sm:px-8 sm:py-20 md:px-10 xl:px-0">
      <div className="mb-9 text-center">
        <span className="text-[11px] font-extrabold tracking-[1px] text-[#2457a6]">
          KAPABILITAS PLATFORM
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#17233b]">
          Dirancang untuk membantu saat dibutuhkan
        </h2>
        <p className="mx-auto mt-3 max-w-[560px] text-sm leading-7 text-[#667085]">
          Angka berikut menggambarkan kapabilitas yang disiapkan untuk
          mendukung pengalaman belajar dan pemeriksaan Anda.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {metrics.map(({ value, label, icon: Icon, tone }) => (
          <Card
            key={value}
            className="border-0 bg-[#f7f9fc] p-4 text-center shadow-none ring-1 ring-[#e6eaf0]"
          >
            <CardContent className="p-0">
              <span
                className={`mx-auto grid size-10 place-items-center rounded-xl ${toneClasses[tone]}`}
              >
                <Icon size={21} />
              </span>
              <strong className="mt-4 block text-xl font-extrabold text-[#17233b] sm:text-2xl">
                {value}
              </strong>
              <span className="mt-2 block text-[10px] leading-5 text-[#667085] sm:text-[11px]">
                {label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

const principles: {
  title: string;
  description: string;
  icon: typeof Eye;
  tone: Tone;
  purpose: string;
}[] = [
  {
    title: "Transparansi Pemrosesan",
    description:
      "Kami menjelaskan dengan terbuka bahwa data diproses oleh model AI untuk menghasilkan analisis yang lebih presisi.",
    icon: Eye,
    tone: "purple",
    purpose:
      "Membangun kepercayaan pengguna dengan menjelaskan alur data AI secara terbuka dan verifikasi.",
  },
  {
    title: "Aksesibilitas Tinggi",
    description:
      "Cekin dirancang agar mudah digunakan oleh semua kalangan masyarakat, dengan bahasa dan alur yang sederhana.",
    icon: Users,
    tone: "blue",
    purpose:
      "Menjamin pengalaman yang inklusif untuk semua lapisan masyarakat dengan kemampuan pengguna yang beragam.",
  },
  {
    title: "Edukasi Berkelanjutan",
    description:
      "Pencegahan jangka panjang menjadi fokus melalui simulasi yang membantu membangun kebiasaan aman.",
    icon: Sparkles,
    tone: "amber",
    purpose:
      "Mendorong perubahan perilaku jangka panjang melalui simulasi edukasi, bukan sekadar sekumpulan fakta.",
  },
];

const principlesContent = (
  <section className="bg-[#f7f9fc]">
    <div className="mx-auto w-full max-w-[1160px] px-5 py-16 sm:px-8 sm:py-20 md:px-10 xl:px-0">
      <div className="mb-9 max-w-[600px]">
        <span className="text-[11px] font-extrabold tracking-[1px] text-[#2457a6]">
          PRINSIP UTAMA
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#17233b]">
          Teknologi yang tetap berpihak pada pengguna
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {principles.map(({ title, description, icon: Icon, tone, purpose }) => (
          <div
            key={title}
            className="flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-[#e6eaf0]"
          >
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-xl ${toneClasses[tone]}`}
            >
              <Icon size={21} />
            </span>

            <div>
              <h3 className="text-sm font-extrabold text-[#17233b]">{title}</h3>
              <p className="mt-2 text-xs leading-6 text-[#667085]">
                {description}
              </p>
              <p className="mt-2 text-[11px] leading-5 text-[#667085]">
                {purpose}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ctaContent = (
  <section className="bg-white">
    <div className="mx-auto w-full max-w-[1160px] px-5 py-16 sm:px-8 sm:py-20 md:px-10 xl:px-0">
      <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#183d78_0%,#2457a6_58%,#26a269_100%)] px-6 py-12 text-center sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-12 -top-20 size-48 rounded-full border-2 border-white/10" />
        <div className="pointer-events-none absolute -bottom-28 -left-12 size-60 rounded-full border-2 border-white/10" />

        <div className="relative z-10">
          <CheckCircle2 className="mx-auto text-white/80" size={30} />

          <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
            Siap Melindungi Diri dari Penipuan Digital?
          </h2>
          <p className="mx-auto mt-3 max-w-[560px] text-sm leading-7 text-white/75">
            Mulai dari satu pemeriksaan atau latih kepekaan Anda melalui
            simulasi interaktif.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/threat-check"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-[13px] font-bold text-[#2457a6] transition-all hover:-translate-y-0.5 hover:bg-[#f4f8ff]"
            >
              <FileSearch size={17} /> Mulai Periksa Ancaman
            </Link>
            <Link
              href="/learning-protection"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/10 px-5 py-3 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/20"
            >

              <FlaskConical size={17} className="text-white" />
              <span className="text-white">Belajar Melalui Simulasi</span>
              <ArrowRight size={16} className="text-white"/>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default function AboutPage() {
  return (
    <div className="bg-white">
      {heroContent}
      {storyContent}
      {pillarsContent}
      {capabilitiesContent}
      {principlesContent}
      {ctaContent}
    </div>
  );
}