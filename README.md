This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## CEKIN - Jangan Asal Percaya!

Cekin adalah website untuk membantu masyarakat mengenali dan menghindari penipuan digital.

## Fungsionalitas Sistem

Cekin memiliki tiga fitur utama yang saling melengkapi: mendeteksi ancaman, mengedukasi pengguna, dan membangun kewaspadaan bersama lewat komunitas.

### 1. Cek Ancaman
Fitur inti untuk memeriksa apakah sesuatu yang diterima pengguna berpotensi penipuan. Pengguna memasukkan data yang ingin dicek, lalu sistem memberikan hasil penilaian risikonya.

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

### 3. Komunitas

Ruang bagi pengguna untuk saling berbagi pengalaman dan informasi seputar penipuan, sehingga pengguna lain bisa lebih waspada terhadap modus yang sedang beredar.


| Jenis Pengecekan | Deskripsi |
|---|---|
| Pesan / Chat | Memeriksa isi pesan (SMS, WhatsApp, dll.) yang mencurigakan |
| URL | Memeriksa apakah sebuah tautan berpotensi phishing atau situs berbahaya |
| Nomor Telepon | Memeriksa apakah nomor pernah terindikasi sebagai nomor penipu |
| Kebocoran Email | Memeriksa apakah alamat email pernah terlibat dalam kebocoran data |
| Investasi | Memeriksa apakah tawaran investasi memiliki ciri-ciri investasi bodong |



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
