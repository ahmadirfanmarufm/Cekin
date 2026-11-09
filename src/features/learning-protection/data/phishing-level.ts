import type { EmailScenarioData, SimulationScenario, SimulationChoice } from "@/types/learning-protection/index";

function defineEmail(
  scenario: Omit<SimulationScenario, "context"> & { emailDetails: EmailScenarioData },
): SimulationScenario {
  return { ...scenario, context: scenario.emailDetails.body.join("\n\n") };
}

const c = (
  id: string, label: string, isSafe: boolean,
  feedback: string, explanation: string, saferAction: string,
): SimulationChoice => ({ id, label, isSafe, feedback, explanation, saferAction });

const chk = (label: string, value: string, suspicious: boolean) => ({ label, value, suspicious });

export const phishingScenarios: SimulationScenario[] = [
  defineEmail({
    id: "phishing-1", level: 1, difficulty: "Mudah", topic: "Pencurian kata sandi",
    title: "Akun Akan Dinonaktifkan",
    description: "Email mendadak mengancam akunmu akan diblokir.",
    emailDetails: {
      senderName: "Layanan Keamanan Akun",
      senderEmail: "security-alert@akun-verifikasi-layanan.example",
      subject: "Akun Anda Akan Dinonaktifkan dalam 30 Menit!",
      body: ["Kepada Pelanggan,", "Kami mendeteksi aktivitas mencurigakan. Verifikasi dalam 30 menit atau akun DIBLOKIR permanen."],
      links: [{ text: "Verifikasi Akun Sekarang", url: "http://akun-verifikasi-layanan.example/login" }],
      checks: [chk("Sapaan", "“Kepada Pelanggan”", true), chk("Protokol tautan", "http:// (tidak terenkripsi)", true), chk("Tekanan waktu", "Blokir dalam 30 menit", true)],
    },
    choices: [
      c("a", "Klik tombol dan login untuk mengamankan akun", false, "Kata sandimu terkirim ke penipu.", "Halaman tujuan palsu.", "Buka situs resmi sendiri."),
      c("b", "Buka aplikasi resmi sendiri untuk melihat peringatan akun, lalu hapus email", true, "Tepat.", "Peringatan akun asli juga muncul di aplikasinya.", "Laporkan email sebagai phishing."),
      c("c", "Balas email menanyakan kebenarannya", false, "Balasanmu hanya sampai ke penipu.", "Membuktikan emailmu aktif.", "Jangan membalas."),
      c("d", "Klik tautannya hanya untuk melihat", false, "Membuka tautan saja sudah berisiko.", "Halaman bisa melacak perangkat.", "Jangan buka tautan mencurigakan."),
    ],
  }),

  /* 2. ASLI: reset kata sandi yang kamu minta */
  defineEmail({
    id: "phishing-2", level: 2, difficulty: "Mudah", topic: "Email asli: reset kata sandi yang kamu minta",
    title: "Atur Ulang Kata Sandi",
    description: "Dua menit lalu kamu menekan “Lupa kata sandi” di aplikasi belanja favoritmu.",
    emailDetails: {
      senderName: "BelanjaKu",
      senderEmail: "no-reply@belanjaku.example",
      subject: "Atur ulang kata sandi BelanjaKu Anda",
      body: ["Halo Rina, kami menerima permintaan mengatur ulang kata sandi untuk akun BelanjaKu Anda.", "Jika ini Anda, tekan tombol di bawah (berlaku 30 menit). Jika bukan, abaikan email ini; kata sandi Anda tidak berubah."],
      links: [{ text: "Atur Ulang Kata Sandi", url: "https://belanjaku.example/reset?token=••••" }],
      checks: [chk("Domain pengirim", "belanjaku.example (cocok dengan situs resmi)", false), chk("Waktu permintaan", "Cocok dengan saat kamu menekan “Lupa kata sandi”", false), chk("Sapaan", "Menyebut namamu", false)],
    },
    choices: [
      c("a", "Tekan tombol, atur ulang kata sandi, dan aktifkan verifikasi dua langkah", true, "Tepat.", "Kamu yang memulai permintaan, domain cocok, dan isinya tidak meminta data selain mengganti sandi.", "Pastikan alamat di bilah browser benar sebelum mengetik sandi baru."),
      c("b", "Tandai sebagai phishing dan hapus", false, "Kali ini asli.", "Kamu tidak bisa masuk karena sandi tak berubah.", "Cocokkan dengan aksi yang baru kamu lakukan."),
      c("c", "Balas email: tolong kirimkan kata sandi barunya", false, "Tidak ada yang mengirim sandi lewat email.", "Balasan bisa dibaca pihak lain.", "Atur ulang lewat tombol resmi."),
      c("d", "Teruskan ke teman agar dibantu menekan tombolnya", false, "Tautan reset bersifat pribadi.", "Siapa pun yang memegangnya bisa mengambil alih akunmu.", "Tekan sendiri."),
    ],
  }),

  defineEmail({
    id: "phishing-3", level: 3, difficulty: "Mudah", topic: "Lampiran berbahaya",
    title: "Resi Paket Gagal Kirim",
    description: "Email kurir meminta kamu membuka lampiran untuk melihat resi. Kamu memang sedang menunggu paket.",
    emailDetails: {
      senderName: "Kurir Ekspres", senderEmail: "no-reply@resi-ekspres-kirim.example",
      subject: "Paket Anda Gagal Dikirim: Lihat Resi",
      body: ["Paket atas nama Anda gagal diantar. Unduh dan buka lampiran untuk melihat resi dan menjadwalkan ulang pengiriman."],
      attachments: [{ name: "Resi_Paket_88213.pdf.exe", size: "2,1 MB" }],
      checks: [chk("Ekstensi lampiran", ".pdf.exe, sebenarnya program", true), chk("Nomor resi", "Tidak ada di isi email", true)],
    },
    choices: [
      c("a", "Membuka lampiran untuk melihat resinya", false, "Lampiran itu program berbahaya.", ".exe dijalankan sebagai program.", "Jangan buka lampiran .exe."),
      c("b", "Cek paket lewat aplikasi kurir dengan nomor resimu, abaikan lampiran", true, "Tepat.", "Kurir sungguhan mencantumkan nomor resi di badan email.", "Laporkan emailnya."),
      c("c", "Pindai dengan antivirus lalu buka jika bersih", false, "Antivirus bukan jaminan.", "Program baru sering belum dikenali.", "Hapus tanpa membuka."),
      c("d", "Buka tapi tidak menekan “Enable”", false, "Program bisa langsung bekerja saat dibuka.", "Tidak semua minta izin.", "Jangan membukanya."),
    ],
  }),

  defineEmail({
    id: "phishing-4", level: 4, difficulty: "Menengah", topic: "Domain mirip",
    title: "Pesanan yang Tidak Pernah Kamu Buat",
    description: "Email “marketplace” menyebut ada pesanan mahal atas namamu.",
    emailDetails: {
      senderName: "BelanjaKu Notifikasi", senderEmail: "no-reply@belanjaku-id.example",
      subject: "Pesanan #BK-77120 Senilai Rp4.299.000 Telah Dibayar",
      body: ["Terima kasih telah berbelanja! 1 unit laptop gaming sudah dibayar dan segera dikirim.", "Bukan Anda? Batalkan dalam 1 jam dengan masuk melalui tombol berikut."],
      links: [{ text: "Batalkan Pesanan", url: "https://belanjaku-id.example/batalkan" }],
      checks: [chk("Domain pengirim", "belanjaku-id.example (resmi: belanjaku.example)", true), chk("Rincian pesanan", "Tanpa alamat atau metode bayar", true)],
    },
    choices: [
      c("a", "Klik “Batalkan Pesanan” dan login", false, "Halaman login itu milik penipu.", "Panik karena nominal dipakai agar kamu tak memeriksa domain.", "Buka aplikasi resmi sendiri."),
      c("b", "Buka aplikasi BelanjaKu sendiri untuk cek riwayat. Jika tidak ada, abaikan", true, "Tepat.", "Satu huruf pada domain cukup menipu mata.", "Ganti sandi jika ada transaksi asing di akun asli."),
      c("c", "Percaya karena logo dan tampilannya sama persis", false, "Desain mudah disalin.", "Domain tidak bisa dipalsukan semudah desain.", "Periksa domain pengirim."),
      c("d", "Balas email meminta refund", false, "Tidak ada pesanan asli.", "Balasanmu sampai ke penipu.", "Jangan membalas."),
    ],
  }),

  defineEmail({
    id: "phishing-5", level: 5, difficulty: "Menengah", topic: "Kode QR (quishing)",
    title: "Aktifkan Ulang Verifikasi Dua Langkah",
    description: "Email dari “tim IT” menyuruhmu memindai kode QR, bukan mengklik tautan.",
    emailDetails: {
      senderName: "Tim Keamanan TI", senderEmail: "it-security@sso-karyawan-verif.example",
      subject: "Wajib: Aktifkan Ulang Verifikasi Dua Langkah Sebelum Jumat",
      body: ["Mulai Jumat, akun yang belum mengaktifkan ulang akan dikunci.", "Pindai kode QR berikut: [ KODE QR ]", "Jangan klik tautan apa pun. Cukup pindai QR agar aman."],
      links: [{ text: "Tujuan kode QR", url: "https://sso-karyawan-verif.example/2fa-aktivasi" }],
      checks: [chk("Alamat pengirim", "Domain luar kantor", true), chk("Instruksi", "“Jangan klik tautan, pindai QR”", true)],
    },
    choices: [
      c("a", "Pindai QR dan ikuti langkah di ponsel", false, "Ponselmu tidak punya perlindungan tautan seperti emailmu.", "QR menyembunyikan tujuan.", "Jangan pindai QR dari email."),
      c("b", "Tidak memindai. Tanyakan ke tim IT lewat kanal internal, lalu laporkan email", true, "Tepat.", "Verifikasi dua langkah diatur di portal resmi.", "Peringatkan rekan lain."),
      c("c", "Teruskan ke tim agar semua mengaktifkan sebelum Jumat", false, "Kamu menyebarkan serangan.", "Semakin banyak yang memindai, semakin banyak akun jatuh.", "Laporkan ke IT."),
      c("d", "Pindai hanya untuk melihat tujuannya", false, "Membuka tujuannya sudah berisiko.", "Halaman bisa memancing unduhan.", "Tanya IT dulu."),
    ],
  }),

  /* 6. ASLI: tagihan langganan */
  defineEmail({
    id: "phishing-6", level: 6, difficulty: "Menengah", topic: "Email asli: tagihan langganan yang kamu buat",
    title: "Kartu Kreditmu Ditagih Lagi",
    description: "Kamu berlangganan layanan musik dan memang menambahkan kartu baru kemarin.",
    emailDetails: {
      senderName: "SonaMusik", senderEmail: "billing@sonamusik.example",
      subject: "Pembayaran langganan Rp54.900 berhasil",
      body: ["Halo Rina, pembayaran langganan Premium Rp54.900 melalui kartu berakhiran 4821 berhasil.", "Kelola langganan kapan saja di Pengaturan > Langganan di aplikasi. Kami tidak pernah meminta data kartu lewat email."],
      checks: [chk("Domain pengirim", "sonamusik.example (cocok dengan situs resmi)", false), chk("Rincian", "Cocok dengan kartu yang kamu tambahkan kemarin", false), chk("Permintaan", "Tidak ada tautan atau permintaan data", false)],
    },
    choices: [
      c("a", "Cocokkan dengan mutasi kartumu. Jika sesuai, tidak perlu tindakan apa pun", true, "Tepat.", "Email hanya memberi tahu, dan rinciannya cocok dengan aktivitasmu.", "Cek langganan lewat aplikasi bila ingin mengubah."),
      c("b", "Laporkan sebagai phishing karena minta uang", false, "Email ini tidak meminta uang.", "Ini hanya konfirmasi pembayaran.", "Periksa permintaannya, bukan hanya topiknya."),
      c("c", "Klik “Kelola langganan” di email dan login ulang", false, "Tidak ada tombol itu di email.", "Kebiasaan login lewat tautan email berbahaya.", "Buka aplikasi sendiri."),
      c("d", "Balas email dan kirim foto kartu agar langganan dihentikan", false, "Tidak ada layanan yang butuh foto kartu.", "Foto kartu bisa dipakai belanja.", "Hentikan lewat pengaturan aplikasi."),
    ],
  }),

  defineEmail({
    id: "phishing-7", level: 7, difficulty: "Sulit", topic: "Pembajakan percakapan (BEC)",
    title: "Vendor Mengganti Rekening Pembayaran",
    description: "Balasan di thread invoice yang nyata, dengan rekening berbeda.",
    emailDetails: {
      senderName: "Maya (CV Mitra Jaya)", senderEmail: "maya@mitrajaya-co.example", replyTo: "pembayaran@mitrajaya-co.example",
      subject: "Re: Invoice INV-2291, Perubahan Rekening Pembayaran",
      body: ["Melanjutkan email kita soal invoice INV-2291 sebesar Rp86.500.000.", "Rekening kami pindah karena audit bank. Mohon dialihkan ke: Bank Nusantara 7712-0098-331 a.n. PT Mitra Jaya Abadi.", "Mohon konfirmasi sebelum sore."],
      checks: [chk("Domain pengirim", "mitrajaya-co.example (sebelumnya mitrajaya.example)", true), chk("Reply-To", "Berbeda dari pengirim", true), chk("Isi thread", "Mengutip percakapan asli dengan benar", false)],
    },
    choices: [
      c("a", "Perbarui rekening dan bayar karena isinya cocok dengan percakapan sebelumnya", false, "Detail benar tidak membuktikan pengirim asli.", "Penyerang membaca percakapan asli.", "Verifikasi lewat jalur lain."),
      c("b", "Telepon vendor lewat nomor di kontrak lama, dan ikuti persetujuan dua orang sebelum ubah rekening", true, "Tepat.", "Perubahan rekening wajib diverifikasi di luar email.", "Laporkan ke keuangan dan IT."),
      c("c", "Balas email meminta Maya mengonfirmasi", false, "Balasan sampai ke penyerang.", "Jalur yang sama dijawab pihak yang sama.", "Telepon ke nomor lama."),
      c("d", "Bayar separuh ke rekening baru", false, "Rp43 juta tetap kerugian.", "Membagi risiko tidak memverifikasi apa pun.", "Tahan pembayaran."),
    ],
  }),

  defineEmail({
    id: "phishing-8", level: 8, difficulty: "Sulit", topic: "Formulir “data gaji” dari HR palsu",
    title: "Verifikasi Data Penggajian",
    description: "Email dari “HR” dengan nama dan jabatan yang benar. Tidak ada ancaman, hanya permintaan rutin.",
    emailDetails: {
      senderName: "Dewi Kartika (HRD)", senderEmail: "d.kartika@hr-portal-kantor.example",
      subject: "Pembaruan Data Penggajian Q4",
      body: ["Halo Rina, untuk penggajian Q4 mohon perbarui data rekening dan NPWP melalui formulir berikut sebelum akhir pekan.", "Terima kasih atas kerja samanya 🙏"],
      links: [{ text: "Buka Formulir", url: "https://hr-portal-kantor.example/form/gaji" }],
      checks: [chk("Nama pengirim", "Sesuai nama HRD sungguhan", false), chk("Domain pengirim", "Bukan domain kantor", true), chk("Tekanan", "Tidak ada, nada rutin", false)],
    },
    choices: [
      c("a", "Isi formulir karena nada dan namanya sesuai", false, "Nada biasa bukan bukti.", "Data rekening dan NPWP dipakai penipuan identitas.", "Cek dulu."),
      c("b", "Tanyakan langsung ke Bu Dewi lewat chat internal kantor sebelum mengisi", true, "Tepat.", "Kamu memverifikasi lewat jalur yang sudah kamu kenal.", "Laporkan ke IT agar rekan lain waspada."),
      c("c", "Isi formulir tetapi hanya nomor rekening, NPWP kosong", false, "Nomor rekening pun sensitif.", "Sebagian data tetap membantu pelaku.", "Verifikasi dulu."),
      c("d", "Balas email: kirim saja datanya ke saya lewat email ini", false, "Kamu mengirim data ke pihak yang belum terbukti.", "Balasan ke domain luar.", "Pakai kanal internal."),
    ],
  }),

  /* 9. ASLI-ish: notifikasi bank */
  defineEmail({
    id: "phishing-9", level: 9, difficulty: "Ahli", topic: "Email asli yang mirip peringatan phishing",
    title: "Login Baru Terdeteksi (Kali Ini Asli)",
    description: "Kamu baru login ke aplikasi bank di ponsel baru 10 menit lalu. Lalu masuk email ini.",
    emailDetails: {
      senderName: "Bank Nusantara", senderEmail: "notifikasi@banknusantara.example",
      subject: "Login Baru Terdeteksi pada Akun Anda",
      body: ["Halo Rina, kami mendeteksi login dari perangkat baru: Samsung Galaxy A55, Jakarta, 09:38.", "Jika ini Anda, tidak perlu tindakan. Jika bukan, buka aplikasi dan pilih Keamanan > Perangkat Terhubung. Kami tidak pernah meminta PIN, OTP, atau kata sandi lewat email."],
      links: [{ text: "Pusat Bantuan Keamanan", url: "https://banknusantara.example/bantuan/keamanan" }],
      checks: [chk("Domain pengirim", "banknusantara.example, sesuai situs resmi", false), chk("SPF/DKIM/DMARC", "Lolos", false), chk("Rincian", "Cocok dengan aktivitasmu", false)],
    },
    choices: [
      c("a", "Cocokkan dengan aktivitasmu. Karena memang baru login, tidak perlu panik", true, "Tepat.", "Domain sesuai, rincian cocok, dan email tidak meminta data.", "Jika perangkatnya asing, cabut akses lewat aplikasi."),
      c("b", "Tandai phishing dan blokir pengirim selamanya", false, "Terlalu waspada.", "Kamu bisa melewatkan peringatan sungguhan kelak.", "Periksa tanda-tandanya dulu."),
      c("c", "Klik tautan di email lalu login", false, "Domainnya benar, tapi kebiasaannya berbahaya.", "Membuatmu mudah tertipu email palsu yang mirip.", "Buka aplikasi sendiri."),
      c("d", "Hapus tanpa membaca", false, "Mengabaikan bisa berbahaya jika bukan kamu yang login.", "Penundaan memberi waktu pelaku.", "Baca dan cocokkan."),
    ],
  }),

  defineEmail({
    id: "phishing-10", level: 10, difficulty: "Ahli", topic: "Persetujuan izin aplikasi (consent phishing)",
    title: "Proposal yang Menyebut Rapat Nyata",
    description: "Email sangat personal, lolos pemeriksaan teknis, dan halaman loginnya benar-benar asli.",
    emailDetails: {
      senderName: "Dimas (Mitra Proyek Dermaga)", senderEmail: "dimas@signflow-docs.example",
      subject: "Proposal Proyek Dermaga Tahap 2: Mohon Tanda Tangan Digital",
      body: ["Mengikuti rapat Selasa kemarin soal Proyek Dermaga Tahap 2, berikut proposal revisinya untuk ditandatangani secara digital.", "Buka lewat SignFlow Viewer. Kamu akan masuk lewat halaman login resmi akunmu dan diminta menyetujui izin akses."],
      links: [{ text: "Tinjau & Tanda Tangani", url: "https://masuk.akun-resmi.example/oauth/authorize?app=SignFlowViewer&scope=baca-email+baca-kontak+kelola-file" }],
      checks: [chk("SPF/DKIM/DMARC", "Lolos", false), chk("Usia domain pengirim", "6 hari", true), chk("Halaman login", "Halaman login resmi, bukan palsu", false), chk("Izin diminta", "Baca seluruh email, kontak, kelola semua file", true)],
    },
    choices: [
      c("a", "Lanjut login dan setujui izin karena halaman login resmi dan 2FA-ku aktif", false, "2FA tidak melindungi dari izin yang kamu setujui.", "Aplikasi mendapat akses tanpa sandi lagi.", "Jangan setujui izin aplikasi asing."),
      c("b", "Konfirmasi ke Dimas lewat telepon, tanpa menyetujui izin apa pun, lalu laporkan ke IT", true, "Tepat.", "Serangan ini tidak mencuri sandi; ia meminta izin lewat halaman login asli.", "Cabut akses aplikasi jika sudah terlanjur setuju."),
      c("c", "Percaya karena lolos SPF/DKIM/DMARC dan menyebut rapat yang nyata", false, "“Lolos” hanya berarti pengirim pemilik domain.", "Domain baru bisa lolos. Detail rapat bisa dari informasi publik.", "Periksa usia domain dan izin."),
      c("d", "Setujui izin lalu cabut aksesnya setelah selesai", false, "Akses bisa disalin dalam hitungan detik.", "Sering tetap aktif.", "Jangan setujui sejak awal."),
    ],
  }),
];