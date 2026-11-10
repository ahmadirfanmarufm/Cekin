# Cekin

<p align="center">
  <strong>Platform edukasi dan analisis ancaman digital untuk membantu pengguna mengenali penipuan dengan lebih percaya diri.</strong>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://orm.drizzle.team/"><img src="https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F?logo=drizzle&logoColor=111827" alt="Drizzle ORM"></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/pnpm-10.x-F69220?logo=pnpm&logoColor=white" alt="pnpm"></a>
</p>

## Overview

Cekin adalah aplikasi web untuk membantu pengguna melakukan pemeriksaan awal terhadap potensi ancaman digital. Pengguna dapat menganalisis konten dari beberapa sumber, mempelajari pola-pola penipuan melalui simulasi interaktif, serta berdiskusi dan berbagi bukti di komunitas.

![Cekin](./public/logo_cekin.webp)

> Hasil analisis Cekin bersifat informatif dan edukatif. Gunakan penilaian manusia serta sumber resmi sebelum mengambil keputusan finansial, keamanan, atau hukum.

## Fitur Utama

| Area | Fitur |
| --- | --- |
| **Analisis ancaman** | Pemeriksaan URL, email, nomor telepon, gambar, percakapan/chat, dan peluang investasi. |
| **Insight berbasis AI** | Analisis terstruktur dengan rekomendasi dan indikator risiko yang mudah dipahami. |
| **Learning Protection** | Simulasi interaktif untuk mengenali phishing, spam call, aplikasi scam, judi online, manipulasi psikologis, dan membangun kepercayaan digital. |
| **Komunitas** | Membuat posting, komentar bertingkat, reaksi, media pendukung, laporan, moderasi, serta riwayat perubahan. |
| **Akun dan progres** | Registrasi/login, sesi pengguna, XP, progres simulasi, dan badge pembelajaran. |
| **Emergency Center** | Akses cepat ke panduan dan tindakan awal saat menghadapi insiden digital. |

## Tech Stack

- **Framework:** Next.js 16 App Router, React 19
- **Bahasa:** TypeScript 5 dengan strict mode
- **Styling:** Tailwind CSS 4 dan komponen berbasis shadcn/Base UI
- **Database:** PostgreSQL
- **ORM & migrasi:** Drizzle ORM dan Drizzle Kit
- **Backend services:** Next.js Route Handlers dan Supabase Storage
- **AI:** Google Gemini API untuk analisis terstruktur
- **Validasi & utilitas:** Zod, libphonenumber-js, Cheerio
- **Package manager:** pnpm 10

## Arsitektur dan Struktur Direktori

```text
.
├── drizzle/                  # Migration SQL dan snapshot schema
├── public/                   # Asset statis, termasuk logo Cekin
├── src/
│   ├── app/                  # App Router, halaman, layout, dan API Route Handlers
│   │   ├── (app)/            # Halaman utama aplikasi
│   │   └── api/              # Endpoint auth, analisis, komunitas, dan learning
│   ├── components/           # Komponen UI dan layout yang reusable
│   ├── features/             # Modul fitur berdasarkan domain bisnis
│   │   ├── auth/             # Registrasi, login, dan sesi pengguna
│   │   ├── community/        # Posting, komentar, reaksi, laporan, dan moderasi
│   │   ├── emergency/        # Emergency Center dan panduan tindakan awal
│   │   ├── home/             # Halaman utama dan navigasi fitur
│   │   ├── learning-protection/  # Simulasi interaktif dan materi edukasi
│   │   └── threat-check/     # Alur analisis ancaman dan form input pengguna
│   ├── lib/                  # Integrasi database, auth, AI, Supabase, dan utilitas
│   │   ├── auth/             # Hashing password, sesi, dan proteksi request
│   │   ├── cekin/            # Engine analisis: aturan dan data indikator ancaman
│   │   ├── db/               # Koneksi dan schema Drizzle
│   │   ├── learning-protection/  # XP, badge, dialog, dan state progres
│   │   └── supabase/         # Supabase admin client (server-only)
│   └── types/                # Type definitions lintas fitur
├── .env.example              # Template environment variables
├── drizzle.config.ts         # Konfigurasi Drizzle Kit
├── next.config.ts            # Konfigurasi Next.js
├── package.json              # Script dan dependency proyek
└── pnpm-lock.yaml            # Lockfile pnpm
```

### Prinsip arsitektur

1. **Domain-driven feature modules:** logika fitur dikelompokkan di `src/features`, bukan dipusatkan dalam satu folder global.
2. **Server/client boundary:** akses database, secret, dan integrasi admin berada di modul server; komponen interaktif tetap berada pada boundary client yang diperlukan.
3. **Typed data access:** schema PostgreSQL didefinisikan di `src/lib/db/schema.ts` dan dikelola melalui Drizzle migration.
4. **API terpisah per domain:** endpoint tersedia di `src/app/api` dengan route group berdasarkan use case.

## Getting Started

### Prasyarat

- Node.js versi LTS (disarankan Node.js 20 atau lebih baru)
- pnpm `10.16.1` atau kompatibel
- PostgreSQL yang dapat diakses aplikasi
- Project Supabase dengan Storage bucket untuk media komunitas
- API key Google Gemini untuk fitur analisis AI

### Instalasi

```bash
git clone https://github.com/ahmadirfanmarufm/Cekin.git
cd Cekin
pnpm install
```

### Environment variables

Salin template environment lalu isi nilainya sesuai environment lokal:

```bash
cp .env.example .env
```

| Variable | Kegunaan |
| --- | --- |
| `DATABASE_URL` | Connection string PostgreSQL untuk Drizzle dan aplikasi. |
| `SUPABASE_URL` | URL Supabase untuk operasi server-side (termasuk Supabase Storage). |
| `SUPABASE_SECRET_KEY` | Secret key Supabase; hanya untuk server dan jangan diekspos ke client. |
| `KLIPY_API_KEY` | API key Klipy untuk fitur GIF komunitas. |
| `GEMINI_API_KEY` | API key Google Gemini untuk analisis AI. |
| `GEMINI_MODEL` | Opsional; override model Gemini default yang digunakan aplikasi. |

> Seluruh akses Supabase bersifat server-side melalui `src/lib/supabase/admin.ts`. Tidak ada Supabase client yang berjalan di browser, sehingga tidak diperlukan environment variable ber-prefix `NEXT_PUBLIC_`.

### Supabase Storage

Media komunitas (gambar pada posting dan komentar) disimpan di Supabase Storage, bukan di filesystem aplikasi. Sebelum upload dapat berfungsi, buat bucket bernama `cekin-community-evidence` pada project Supabase. Nama bucket didefinisikan sebagai konstanta `COMMUNITY_BUCKET` di `src/lib/supabase/admin.ts`, jadi sesuaikan di sana bila ingin memakai nama lain.

Jika bucket belum tersedia, endpoint komunitas akan mengembalikan error saat menerima upload media.

### Database

Pastikan `DATABASE_URL` sudah terisi, lalu jalankan migration yang tersedia:

```bash
pnpm exec drizzle-kit migrate
```

Jika schema berubah selama pengembangan, buat migration baru sebelum menerapkannya:

```bash
pnpm exec drizzle-kit generate
pnpm exec drizzle-kit migrate
```

### Menjalankan development server

```bash
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Quality Checks

Jalankan pemeriksaan yang relevan sebelum membuat pull request:

```bash
pnpm lint
pnpm test
pnpm build
```

`pnpm test` menjalankan unit test berbasis Vitest. Saat ini cakupannya masih terbatas pada hook komunitas, jadi tambahkan test baru untuk perilaku yang Anda ubah.

## Build dan Deployment

### Build production lokal

```bash
pnpm build
pnpm start
```

`pnpm build` menjalankan build production Next.js. Setelah berhasil, `pnpm start` menjalankan server production pada port default Next.js.

### Deployment ke Vercel

1. Push repository ke GitHub dan import project ke [Vercel](https://vercel.com/new).
2. Pilih framework **Next.js**. Vercel biasanya mendeteksi konfigurasi secara otomatis.
3. Gunakan `pnpm install` sebagai install command bila diperlukan.
4. Tambahkan seluruh environment variables production di **Project Settings → Environment Variables**.
5. Pastikan database PostgreSQL dan Supabase Storage dapat diakses dari deployment.
6. Jalankan migration database melalui proses deployment yang terkontrol, bukan dari browser atau client.
7. Deploy, lalu verifikasi halaman utama, autentikasi, analisis, upload media, dan endpoint komunitas.

Untuk production, gunakan branch deployment yang terlindungi, preview environment terpisah, dan rotasi secret sesuai kebijakan operasional.

## Contributing

Kontribusi dipersilakan melalui pull request.

1. Fork repository dan buat branch dari branch utama:
   ```bash
   git checkout -b feat/nama-perubahan
   ```
2. Buat perubahan yang terfokus dan ikuti pola arsitektur yang sudah ada.
3. Tambahkan atau perbarui test untuk perilaku yang berubah.
4. Jalankan `pnpm lint`, `pnpm test`, dan `pnpm build`.
5. Buka pull request dengan ringkasan perubahan, alasan teknis, dan langkah verifikasi.

Hindari memasukkan secret, data pengguna, hasil build, atau perubahan migration yang tidak diperlukan. Untuk perubahan schema, sertakan migration Drizzle yang dapat direproduksi.

## License

MIT License

Copyright (c) 2026 ProgrammerAkhirZaman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

Dibuat untuk membantu pengguna Indonesia menjadi lebih siap menghadapi ancaman digital.