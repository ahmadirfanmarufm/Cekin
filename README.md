This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## CEKIN - Jangan Asal Percaya!

Cekin adalah web app untuk membantu masyarakat mengenali dan menghindari penipuan digital.

## Fungsionalitas Sistem

Cekin memiliki tiga fungsionalitas utama yang saling melengkapi: mendeteksi ancaman, mengedukasi pengguna, dan membangun kewaspadaan bersama lewat komunitas.

### 1. Cek Ancaman
Fitur inti untuk memeriksa apakah sesuatu yang diterima pengguna berpotensi penipuan. Pengguna memasukkan data yang ingin dicek, lalu sistem memberikan skor risiko dalam skala 0-100.

| Jenis Pengecekan | Deskripsi |
|---|---|
| Pesan / Chat | Memeriksa isi pesan (SMS, WhatsApp, dll.) yang mencurigakan |
| URL | Memeriksa apakah sebuah tautan berpotensi phishing atau situs berbahaya |
| Nomor Telepon | Memeriksa apakah nomor berpotensi merupakan nomor penipu |
| Kebocoran Email | Memeriksa apakah alamat email pernah terlibat dalam kebocoran data |
| Investasi | Memeriksa apakah tawaran investasi memiliki ciri-ciri investasi bodong |

### 2. Learning & Protection

Fitur edukasi agar pengguna paham cara melindungi diri dari penipuan melalui enam simulasi interaktif. Setiap simulasi memiliki tingkat kesulitan dan estimasi durasi yang berbeda.

| No | Simulasi | Tingkat | Durasi | Deskripsi |
|---|---|---|---|---|
| 01 | Penipuan Chat | Pemula | 4 menit | Menghadapi lowongan, top-up, dan investasi palsu |
| 02 | Aplikasi Sus | Menengah | 3 menit | Memeriksa aplikasi, sumber unduhan, dan izinnya |
| 03 | Phishing | Menengah | 4 menit | Menyelidiki email palsu sebelum tautan menjebak |
| 04 | Penipuan Telepon | Menengah | 3 menit | Menerima telepon fiktif dan memilih respons yang tepat |
| 05 | Judol | Penting | 5 menit | Mengenali promosi, near-miss, dan loss chasing |
| 06 | Jebakan Logika | Pemula | 4 menit | Mengenali pola pikir yang dimanfaatkan pelaku |

#### Badge

Pengguna dapat mengumpulkan badge sebagai penanda progres belajar. Badge awalnya terkunci dan terbuka setelah pengguna menyelesaikan simulasi yang bersangkutan. Total ada 6 badge:

| Badge | Simulasi |
|---|---|
| Si Kebal Tipu | Penipuan Chat |
| Detektif Aplikasi | Aplikasi Sus |
| Pemburu Phishing | Phishing |
| King Gocek Telepon | Penipuan Telepon |
| Pejuang Anti Judol | Judol |
| Mikir Kids | Jebakan Logika |

### 3. Komunitas

Ruang bagi pengguna untuk saling berbagi pengalaman dan informasi seputar penipuan, sehingga pengguna lain bisa lebih waspada terhadap modus yang sedang beredar.

### Profil**: menyimpan akun pengguna beserta progres simulasi dan badge yang sudah diperoleh

### Pusat Bantuan

Panduan penanganan bagi pengguna yang sudah terlanjur terkena penipuan. Pengguna memilih kondisi yang sedang dialami pada daftar "Apa yang sedang terjadi?", lalu sistem menampilkan **Panduan Langkah Aman** yang berisi:

- Langkah-langkah yang perlu dilakukan, disusun berurutan
- Sumber bantuan, misalnya pelaporan ke platform tempat penipuan terjadi

## Catatan Penting

> [!WARNING]
> Cekin adalah alat bantu pengecekan awal dan edukasi, bukan jaminan keamanan mutlak.

- **Hasil pengecekan tidak 100% akurat.** Skor risiko pada Cek Ancaman hanyalah perkiraan. Skor rendah tidak berarti pesan, tautan, nomor, atau tawaran tersebut pasti aman, dan skor tinggi tidak berarti pasti penipuan. Tetap gunakan kewaspadaan dan pertimbangan sendiri.
- **Panduan Pusat Bantuan tidak menjamin pemulihan.** Mengikuti panduan tidak menjamin dana atau akun yang sudah terdampak dapat dipulihkan.
- **Gunakan kanal resmi.** Untuk penanganan kasus yang sebenarnya, hubungi pihak resmi seperti bank, penyedia layanan, platform terkait, atau pihak berwenang, dan hindari pihak yang menjanjikan pemulihan dengan biaya di muka.
- **Simulasi bersifat edukasi.** Skenario pada Learning & Protection adalah contoh untuk latihan dan tidak mencakup seluruh modus penipuan yang ada.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
