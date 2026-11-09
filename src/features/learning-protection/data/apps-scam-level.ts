import type { SimulationScenario, SimulationChoice } from "@/types/learning-protection/index";

const c = (
  id: string, label: string, isSafe: boolean,
  feedback: string, explanation: string, saferAction: string,
): SimulationChoice => ({ id, label, isSafe, feedback, explanation, saferAction });

const p = (name: string, reason: string, suspicious: boolean, mode: string) => ({ name, reason, suspicious, mode });
const d = (label: string, value: string, suspicious: boolean) => ({ label, value, suspicious });

export const appsScamScenarios: SimulationScenario[] = [
  /* 1. Sah tapi izinnya berlebihan. Benar: b */
  {
    id: "apps-1", level: 1, difficulty: "Mudah", topic: "Aplikasi sah dengan izin berlebihan",
    title: "Filter Selfie Terbaru",
    description: "Aplikasi filter selfie populer yang dipakai temanmu.",
    context: "Filter terbaru, bisa video dan lokasi.",
    choices: [
      c("a", "Tidak memasang, karena semua aplikasi filter wajah pasti menjual data wajahmu", false, "Terlalu curiga.", "Developer terverifikasi dan sumbernya resmi. Risikonya ada di izin yang berlebihan, bukan di aplikasinya.", "Pasang, lalu atur izin."),
      c("b", "Pasang dari toko resmi, kamera dan mikrofon hanya \"Saat dipakai\", lokasi dan semua file ditolak", true, "Tepat.", "Kamera dan mikrofon (saat merekam video) sesuai fungsi. Lokasi dan akses semua file tidak dibutuhkan filter.", "Tinjau izin tiap bulan."),
      c("c", "Pasang dan izinkan semua dulu supaya semua filter jalan, nanti dicabut lewat pengaturan", false, "Datanya keburu terbaca.", "Selama izin aktif, aplikasi sudah bisa membaca lokasi dan file. Mencabut belakangan tidak menarik data yang terlanjur diambil.", "Mulai dari izin paling sempit."),
      c("d", "Pasang, izinkan kamera \"Selalu\" agar tidak ditanya izin berulang kali", false, "\"Selalu\" tidak perlu.", "Kamera yang aktif di latar belakang membuka peluang pengambilan gambar tanpa kamu sadari.", "Pilih \"Saat dipakai\"."),
    ],
    appDetails: {
      name: "GlowCam: Filter & Selfie", description: "Aplikasi filter wajah, stiker, dan video pendek.",
      developer: "GlowLabs Inc. (terverifikasi)", category: "Foto & Video", rating: "4.5", downloads: "5.000.000+", badge: "Populer",
      source: "Toko aplikasi resmi (simulasi)", sourceType: "official", risk: "Rendah",
      foundVia: "Temanmu memakai filter-nya di story. Kamu mencarinya sendiri di toko aplikasi.",
      claim: "Ratusan filter baru tiap minggu.", reviews: "Ulasan beragam dan wajar. Beberapa menyebut iklan yang mengganggu.",
      permissions: [
        p("Kamera", "Mengambil foto dan video.", false, "Saat dipakai"),
        p("Mikrofon", "Merekam suara pada video.", false, "Saat merekam video"),
        p("Lokasi", "Filter berdasarkan kota.", true, "Di latar belakang"),
        p("Semua file", "Mengakses seluruh penyimpanan.", true, "Akses penuh"),
      ],
      details: [d("Riwayat pembaruan", "Rutin 4 tahun", false), d("Kebijakan privasi", "Jelas", false)],
      redFlags: ["Developer terverifikasi dan sumber resmi.", "Izin kamera dan mikrofon sesuai fungsi video.", "Izin lokasi dan semua file berlebihan untuk filter."],
      explanation: "Aplikasi sah tidak perlu ditolak. Yang perlu kamu atur adalah izin yang tidak sesuai fungsi.",
      saferAction: "Pasang, izinkan kamera dan mikrofon saat dipakai, tolak yang lain.",
      postInstall: ["Cek izin di pengaturan.", "Cabut izin lokasi dan semua file."],
    },
  },

  /* 2. APK MOD. Benar: c */
  {
    id: "apps-2", level: 2, difficulty: "Mudah", topic: "APK MOD dari grup",
    title: "Skin Gratis dari Grup Telegram",
    description: "Anggota grup game membagikan file APK dengan banyak testimoni.",
    context: "Download APK MOD dan nikmati semua skin premium gratis.",
    choices: [
      c("a", "Pasang di ponsel cadangan tanpa SIM dan tanpa login akun penting", false, "Risikonya tetap ada.", "Akun game dan data yang kamu masukkan di sana tetap bisa dicuri, dan kamu bisa terbiasa memasang file dari sumber liar.", "Jangan pasang APK dari grup."),
      c("b", "Pindai file di situs pemindai antivirus dulu, pasang kalau hasilnya bersih", false, "Hasil \"bersih\" bukan jaminan.", "Kode berbahaya yang baru dibuat sering belum dikenali pemindai. Ukuran 3 MB untuk game besar juga tidak wajar.", "Gunakan toko resmi."),
      c("c", "Lewati file itu, beli item lewat top-up resmi di dalam game, dan laporkan tautannya ke admin grup", true, "Tepat.", "Izin SMS, aksesibilitas, dan overlay tidak dibutuhkan game dan dipakai untuk mencuri OTP. Melapor ikut melindungi anggota lain.", "Tunggu event gratis resmi dari developer."),
      c("d", "Pasang, lalu cabut izin SMS dan aksesibilitas setelah game terbuka", false, "Izin bisa dipaksa kembali.", "Aplikasi berbahaya bisa meminta izin berulang atau mengaktifkannya sendiri lewat aksesibilitas.", "Jangan memasang."),
    ],
    appDetails: {
      name: "Arena Legends MOD APK", description: "Game aksi dengan skin premium dan koin tanpa batas.",
      developer: "Tidak dikenal", category: "Game", rating: "4.9", downloads: "10.000+", badge: "Unlimited",
      source: "Berkas APK dari grup Telegram", sourceType: "unofficial", risk: "Kritis",
      foundVia: "File APK dibagikan di grup game, dengan puluhan balasan \"works!\".",
      claim: "Semua skin dan diamond gratis tanpa batas.", reviews: "Tidak ada ulasan independen.",
      permissions: [
        p("SMS", "Membaca pesan masuk.", true, "Selalu aktif"),
        p("Mikrofon", "Merekam suara.", true, "Di latar belakang"),
        p("Tampil di atas aplikasi lain", "Menutupi layar aplikasi lain.", true, "Selalu aktif"),
        p("Aksesibilitas", "Mengendalikan layar.", true, "Selalu aktif"),
      ],
      details: [d("Ukuran file", "3,1 MB (game aslinya ratusan MB)", true)],
      redFlags: ["APK dari grup, bukan toko resmi.", "Izin SMS, mikrofon, aksesibilitas tidak relevan.", "Ukuran file terlalu kecil."],
      explanation: "APK MOD bisa disisipi kode berbahaya yang mencuri OTP dan merekam suara.",
      saferAction: "Mainkan versi resmi.",
      postInstall: ["Hapus aplikasi.", "Ganti kata sandi akun penting.", "Pantau mutasi."],
    },
  },

  /* 3. ASLI: ojek. Benar: a */
  {
    id: "apps-3", level: 3, difficulty: "Mudah", topic: "Aplikasi sah dengan izin wajar",
    title: "Aplikasi Ojek yang Sedang Populer",
    description: "Temanmu mengajak memakai aplikasi transportasi online. Kamu mencarinya sendiri di toko aplikasi.",
    context: "Pesan ojek, kirim paket, dan bayar dalam satu aplikasi.",
    choices: [
      c("a", "Pasang dari toko resmi, lokasi \"Saat dipakai\", mikrofon dan kamera hanya saat dipakai, kontak ditolak", true, "Tepat.", "Lokasi, panggilan suara, dan pindai QR memang inti fungsinya. Kontak hanya untuk fitur opsional.", "Tinjau izin berkala."),
      c("b", "Batalkan, karena aplikasi yang meminta lokasi, mikrofon, dan kamera sekaligus pasti mengintai", false, "Terlalu waspada.", "Ketiganya sesuai fungsi ojek online. Yang dinilai adalah kecocokan izin dengan fungsi dan kejelasan developernya.", "Cocokkan izin dengan fungsi."),
      c("c", "Pasang dan izinkan lokasi \"Selalu\" agar penjemputan lebih akurat", false, "Lokasi \"Selalu\" tidak diperlukan.", "Titik jemput cukup diambil saat aplikasi dibuka. \"Selalu\" membuatmu terlacak di luar pemakaian.", "Pilih \"Saat dipakai\"."),
      c("d", "Pasang lewat APK dari temanmu karena katanya lebih ringan", false, "APK dari orang lain bisa dimodifikasi.", "Versi yang sudah diubah bisa menyisipkan kode pencuri data walau tampilannya sama.", "Cari di toko resmi."),
    ],
    appDetails: {
      name: "JalanKu: Ojek & Kurir", description: "Transportasi online untuk ojek, paket, dan pembayaran.",
      developer: "PT Jalanku Teknologi Indonesia (terverifikasi)", category: "Transportasi", rating: "4.7", downloads: "10.000.000+", badge: "Populer",
      source: "Toko aplikasi resmi (simulasi)", sourceType: "official", risk: "Rendah",
      foundVia: "Temanmu mengajak. Kamu mencarinya sendiri di toko aplikasi.",
      claim: "Pesan ojek, kirim paket, dan bayar dalam satu aplikasi.", reviews: "Ulasan beragam dan wajar.",
      permissions: [
        p("Lokasi", "Titik jemput dan tujuan.", false, "Saat dipakai"),
        p("Mikrofon", "Panggilan suara dengan driver.", false, "Saat panggilan"),
        p("Kamera", "Memindai QR pembayaran.", false, "Saat dipakai"),
        p("Kontak", "Hanya untuk fitur bagikan perjalanan.", true, "Opsional"),
      ],
      details: [d("Developer", "Tertaut ke situs resmi perusahaan", false), d("Riwayat pembaruan", "Rutin 6 tahun", false)],
      redFlags: ["Developer jelas.", "Izin utama sesuai fungsi.", "Izin kontak opsional dan boleh ditolak."],
      explanation: "Tidak semua izin sensitif berarti bahaya. Yang penting apakah sesuai fungsi dan sumbernya jelas.",
      saferAction: "Pasang dari toko resmi dan batasi izin seperlunya.",
      postInstall: ["Aktifkan PIN akun.", "Tinjau ulang izin berkala."],
    },
  },

  /* 4. Senter. Benar: d */
  {
    id: "apps-4", level: 4, difficulty: "Menengah", topic: "Aplikasi sederhana dengan izin tidak masuk akal",
    title: "Senter Super 4K",
    description: "Pop-up peringatan menyarankan aplikasi senter dengan rating tinggi di toko resmi.",
    context: "Senter paling terang, plus kompas dan alarm.",
    choices: [
      c("a", "Baca ulasan bintang 1 dulu, kalau keluhannya hanya soal iklan, pasang", false, "Iklan bukan satu-satunya masalah.", "Izin mikrofon, lokasi, kontak, dan semua file untuk senter tidak sesuai fungsi, terlepas dari ulasannya.", "Periksa izin dan developer."),
      c("b", "Pasang, lalu cabut izin mikrofon, lokasi, kontak, dan semua file lewat pengaturan", false, "Izin bisa diminta lagi.", "Aplikasi bisa terus memunculkan permintaan izin atau memaksa lewat pop-up. Developernya sendiri tidak jelas dan aplikasinya baru 11 hari.", "Cari alternatif yang tepercaya."),
      c("c", "Pasang versi \"Lite\" dari developer yang sama karena izinnya lebih sedikit", false, "Developernya tetap sama.", "Developer yang memasang izin berlebihan di satu aplikasi tidak otomatis jujur di versi lain.", "Hindari developer ini."),
      c("d", "Nyalakan senter dari panel pengaturan cepat ponsel, lalu laporkan aplikasi ini ke toko aplikasi", true, "Tepat.", "Senter sudah bawaan ponsel. Aplikasi ini baru, unduhannya janggal, dan izinnya tidak masuk akal.", "Ajak teman melapor juga."),
    ],
    appDetails: {
      name: "Senter Super 4K", description: "Senter, kompas, dan alarm dalam satu aplikasi.",
      developer: "Praktis Apps Holdings", category: "Alat", rating: "4.8", downloads: "5.000.000+", badge: "Terang!",
      source: "Toko aplikasi resmi (simulasi)", sourceType: "official", risk: "Tinggi",
      foundVia: "Pop-up peringatan baterai di browser yang mengarah ke toko aplikasi.",
      claim: "Senter paling terang, gratis.", reviews: "Ulasan bintang 5 seragam, ulasan bintang 1 menyebut iklan layar penuh.",
      permissions: [
        p("Kamera/senter", "Menyalakan senter.", false, "Saat dipakai"),
        p("Mikrofon", "\"Untuk fitur alarm suara\".", true, "Selalu aktif"),
        p("Lokasi", "\"Untuk cuaca sekitar\".", true, "Di latar belakang"),
        p("Kontak", "\"Untuk berbagi aplikasi\".", true, "Selalu aktif"),
        p("Semua file", "\"Untuk menyimpan pengaturan\".", true, "Akses penuh"),
      ],
      details: [d("Dirilis", "11 hari lalu", true), d("Kebijakan privasi", "Halaman kosong", true)],
      redFlags: ["Aplikasi sederhana meminta izin besar.", "Baru dirilis tapi unduhan jutaan.", "Rating seragam."],
      explanation: "Aplikasi dengan fungsi sederhana yang meminta banyak izin biasanya mengumpulkan data.",
      saferAction: "Pakai fitur bawaan.",
      postInstall: ["Cabut semua izin.", "Hapus aplikasi."],
    },
  },

  /* 5. ASLI: perekam suara. Benar: c */
  {
    id: "apps-5", level: 5, difficulty: "Menengah", topic: "Aplikasi sah, atur izin dengan benar",
    title: "Perekam Suara untuk Kuliah",
    description: "Kamu butuh merekam kuliah. Kamu menemukan aplikasi perekam dengan ulasan dari mahasiswa.",
    context: "Rekam kuliah, ubah ke teks, simpan di perangkat.",
    choices: [
      c("a", "Pasang, izinkan semua izin termasuk semua file, supaya rekaman otomatis tercadang", false, "Terlalu longgar.", "Akses semua file membuka galeri, dokumen, dan unduhanmu yang tidak berhubungan dengan rekaman.", "Pilih izin terbatas."),
      c("b", "Pasang, mikrofon \"Selalu\" agar bisa mulai merekam dari widget tanpa membuka aplikasi", false, "\"Selalu\" berisiko.", "Izin itu membuatnya bisa mendengar di latar belakang. Kamu cukup membukanya sebelum kuliah mulai.", "Pilih \"Saat dipakai\"."),
      c("c", "Pasang, mikrofon \"Saat dipakai\" dan akses audio terbatas, tolak semua file dan lokasi, sinkron cloud tetap mati", true, "Tepat.", "Mikrofon memang inti fungsinya. Privasi dijaga dengan mode izin tersempit dan data tetap tersimpan lokal.", "Cek izin berkala."),
      c("d", "Jangan pasang. Aplikasi yang merekam suara pasti mengirim rekamannya ke server", false, "Terlalu menggeneralisasi.", "Kebijakan privasinya menyebut audio tersimpan lokal dan cloud opsional. Kamu bisa memeriksa dan memilih.", "Baca kebijakan privasi, lalu atur izin."),
    ],
    appDetails: {
      name: "RekamKuliah: Voice Notes", description: "Perekam suara dengan transkripsi teks.",
      developer: "Notula Studio (terverifikasi)", category: "Produktivitas", rating: "4.6", downloads: "1.000.000+", badge: "Pilihan Mahasiswa",
      source: "Toko aplikasi resmi (simulasi)", sourceType: "official", risk: "Rendah",
      foundVia: "Rekomendasi senior kampus di grup angkatan.",
      claim: "Rekam, transkrip, dan simpan lokal.", reviews: "Ulasan wajar, beberapa menyebut iklan di versi gratis.",
      permissions: [
        p("Mikrofon", "Merekam suara kuliah.", false, "Saat dipakai"),
        p("Audio/media", "Menyimpan hasil rekaman.", false, "Terbatas pada folder aplikasi"),
        p("Semua file", "Membaca seluruh penyimpanan.", true, "Akses penuh (opsional)"),
        p("Lokasi", "Menandai lokasi rekaman.", true, "Opsional"),
      ],
      details: [d("Kebijakan privasi", "Audio tersimpan lokal; cloud opsional", false), d("Riwayat pembaruan", "Rutin 5 tahun", false)],
      redFlags: ["Developer jelas dan privasi transparan.", "Mikrofon memang inti fungsi.", "Akses semua file dan lokasi opsional."],
      explanation: "Izin sensitif boleh diberikan jika sesuai fungsi. Pilih mode yang paling sempit.",
      saferAction: "Pasang, izinkan mikrofon saat dipakai, dan batasi file.",
      postInstall: ["Matikan sinkron cloud jika tidak perlu.", "Cek izin berkala."],
    },
  },

  /* 6. Stalkerware. Benar: b */
  {
    id: "apps-6", level: 6, difficulty: "Menengah", topic: "Aplikasi pengawas dari orang terdekat (stalkerware)",
    title: "\"Biar Aku Tahu Kamu Aman\"",
    description: "Pacarmu meminta kamu memasang aplikasi yang katanya untuk keselamatan kalian berdua.",
    context: "Bagikan lokasi, suara sekitar, dan kamera selama 24 jam agar pasangan tenang.",
    choices: [
      c("a", "Pasang, lalu rutin cek ikon dan izinnya di pengaturan supaya tidak disalahgunakan", false, "Ikonnya disembunyikan.", "Aplikasi ini menyembunyikan ikon dan merekam tanpa notifikasi, jadi pengecekan biasa tidak akan melihatnya.", "Jangan pasang."),
      c("b", "Tolak aplikasi itu, tawarkan berbagi lokasi lewat fitur bawaan yang bisa kamu matikan sendiri, dan cerita ke orang tepercaya kalau ia memaksa", true, "Tepat.", "Berbagi lokasi yang kamu kontrol sendiri berbeda dengan pengawasan diam-diam. Tekanan untuk memasang aplikasi pengintai adalah tanda hubungan tidak sehat.", "Hubungi layanan bantuan bila merasa tertekan."),
      c("c", "Pasang di ponsel lama supaya ponsel utama aman", false, "Kamu tetap diawasi.", "Ponsel lama masih bisa merekam dan melacak, dan bisa dipakai untuk mengakses akunmu.", "Tolak."),
      c("d", "Pasang, dengan syarat pacarmu memasang aplikasi yang sama di ponselnya", false, "Saling mengawasi bukan solusi.", "Hubungan yang aman dibangun atas dasar percaya. Pengawasan dua arah tetap memberi aplikasi akses penuh ke ponselmu.", "Bicarakan batas privasi."),
    ],
    appDetails: {
      name: "KitaSelalu: Pelacak Pasangan", description: "Melacak lokasi, merekam suara sekitar, dan mengambil foto kamera secara berkala.",
      developer: "Tracker Group Ltd.", category: "Gaya Hidup", rating: "4.4", downloads: "100.000+", badge: "Pantau 24 Jam",
      source: "Berkas dari tautan yang dikirim pasangan", sourceType: "unofficial", risk: "Kritis",
      foundVia: "Pacarmu mengirim tautan dan memintamu memasang.",
      claim: "Berbagi lokasi dan suara untuk saling aman.", reviews: "Tidak ada ulasan independen.",
      permissions: [
        p("Lokasi", "Melacak posisimu terus-menerus.", true, "Di latar belakang"),
        p("Mikrofon", "Merekam suara sekitar.", true, "Selalu aktif"),
        p("Kamera", "Mengambil foto berkala.", true, "Selalu aktif"),
        p("Semua file", "Membaca galeri dan pesan.", true, "Akses penuh"),
      ],
      details: [d("Ikon aplikasi", "Disembunyikan setelah dipasang", true), d("Notifikasi ke kamu", "Tidak ada saat merekam", true)],
      redFlags: ["Menyembunyikan ikon aplikasi.", "Merekam suara dan kamera tanpa pemberitahuan.", "Dipasang atas desakan orang lain."],
      explanation: "Aplikasi pengawas diam-diam termasuk stalkerware. Kontrol seperti ini juga tanda hubungan tidak sehat.",
      saferAction: "Tolak dan jaga akses ke ponselmu.",
      postInstall: ["Cabut izin.", "Hapus aplikasi.", "Cerita ke orang tepercaya."],
    },
  },

  /* 7. Bansos palsu. Benar: a */
  {
    id: "apps-7", level: 7, difficulty: "Sulit", topic: "Aplikasi pemerintah palsu",
    title: "Cek Bansos Lewat Aplikasi Baru",
    description: "Pesan berantai di grup RT mengajak memasang aplikasi untuk memeriksa bantuan sosial.",
    context: "Cek penerima bansos, daftar dengan foto KTP dan swafoto.",
    choices: [
      c("a", "Ketik sendiri alamat situs resmi kementerian dan lihat apakah ada tautan unduh aplikasi ini di sana", true, "Tepat.", "Aplikasi pemerintah asli ditautkan dari situs resminya. Kalau tidak ada, aplikasi ini tidak boleh dipercaya walau ada di toko aplikasi.", "Beri tahu grup RT."),
      c("b", "Tanya ketua RT apakah tetangga sudah berhasil mendapat bansos lewat aplikasi ini", false, "Keberhasilan tetangga bukan bukti.", "Mereka mungkin belum sadar jadi korban, dan data KTP yang diunggah baru disalahgunakan belakangan.", "Verifikasi di situs resmi."),
      c("c", "Pasang karena ada di toko aplikasi resmi dan berlabel \"Resmi?\"", false, "Toko aplikasi bukan jaminan.", "Siapa pun bisa mengunggah aplikasi ke toko. Developernya berbeda dari kementerian dan baru dirilis 6 hari lalu.", "Mulai dari situs resmi."),
      c("d", "Pasang, tapi samarkan foto KTP dengan menutup sebagian angka NIK sebelum diunggah", false, "Data wajah dan KTP tetap sensitif.", "Swafoto dan foto KTP sudah cukup untuk membuat pinjaman atas namamu. Aplikasinya juga meminta SMS dan lokasi latar belakang.", "Jangan unggah KTP ke aplikasi yang belum terbukti."),
    ],
    appDetails: {
      name: "CekBansos Nusantara", description: "Aplikasi untuk memeriksa dan mendaftar bantuan sosial.",
      developer: "Layanan Digital Nusantara", category: "Pemerintahan", rating: "4.6", downloads: "100.000+", badge: "Resmi?",
      source: "Toko aplikasi (hasil pencarian)", sourceType: "official", risk: "Tinggi",
      foundVia: "Pesan berantai di grup RT.",
      claim: "Daftar langsung dengan foto KTP dan swafoto.", reviews: "Ulasan baru dan seragam.",
      permissions: [
        p("Kamera", "Swafoto verifikasi wajah.", false, "Saat dipakai"),
        p("Foto/file", "Mengunggah foto KTP.", true, "Akses ke galeri"),
        p("Lokasi", "Menentukan wilayah.", true, "Di latar belakang"),
        p("SMS", "\"Untuk kode verifikasi otomatis\".", true, "Selalu aktif"),
      ],
      details: [d("Developer di situs resmi kementerian", "Berbeda", true), d("Dirilis", "6 hari lalu", true)],
      redFlags: ["Dibagikan lewat grup, bukan situs resmi.", "Developer tidak sama dengan kementerian.", "Meminta SMS dan lokasi latar belakang."],
      explanation: "Penipuan bansos memanfaatkan harapan. Aplikasi resmi selalu ditautkan dari situs resmi pemerintah.",
      saferAction: "Selalu mulai dari situs resmi yang diketik sendiri.",
      postInstall: ["Hapus aplikasi.", "Laporkan ke ketua RT.", "Pantau penggunaan KTP."],
    },
  },

  /* 8. ASLI: bank eKYC. Benar: d */
  {
    id: "apps-8", level: 8, difficulty: "Sulit", topic: "Aplikasi sah yang terlihat mencurigakan",
    title: "Aplikasi Bank Minta Swafoto",
    description: "Kamu membuka rekening digital. Aplikasi bank meminta kamera, lokasi, dan mikrofon.",
    context: "Verifikasi identitas dengan swafoto dan KTP untuk membuka rekening.",
    choices: [
      c("a", "Batalkan. Bank yang meminta foto wajah dan KTP pasti menjual datamu", false, "Terlalu curiga.", "Verifikasi identitas (eKYC) memang wajib bagi bank resmi. Yang perlu dicek adalah sumber dan developer aplikasinya.", "Cocokkan sumbernya dulu."),
      c("b", "Pasang, izinkan semua izin termasuk kontak dan mikrofon supaya proses verifikasi lancar", false, "Terlalu longgar.", "Kontak dan mikrofon bersifat opsional untuk eKYC. Menolaknya tidak menghentikan proses pembukaan rekening.", "Pilih izin seperlunya."),
      c("c", "Kirim foto KTP dan swafoto lewat chat CS bank di media sosial supaya lebih cepat", false, "Jangan kirim lewat chat.", "Akun CS di media sosial sering ditiru. Verifikasi hanya aman di aplikasi bank resmi.", "Gunakan aplikasi dari situs bank."),
      c("d", "Pasang dari tautan di situs bank yang kamu ketik sendiri, izinkan kamera dan lokasi saat dipakai, tolak mikrofon dan kontak", true, "Tepat.", "Kamera dan lokasi wajar untuk eKYC. Mikrofon dan kontak opsional dan tidak diperlukan.", "Hapus berkas swafoto lama dari galeri."),
    ],
    appDetails: {
      name: "NusaBank Digital", description: "Aplikasi rekening digital dengan verifikasi identitas.",
      developer: "PT Bank Nusantara Tbk (terverifikasi)", category: "Keuangan", rating: "4.5", downloads: "2.000.000+", badge: "Resmi",
      source: "Toko aplikasi resmi (simulasi)", sourceType: "official", risk: "Rendah",
      foundVia: "Tautan unduhan ada di situs resmi bank yang kamu ketik sendiri.",
      claim: "Buka rekening dalam 5 menit.", reviews: "Ulasan wajar, beberapa mengeluhkan verifikasi yang lama.",
      permissions: [
        p("Kamera", "Swafoto dan foto KTP.", false, "Saat dipakai"),
        p("Lokasi", "Memastikan transaksi berasal dari wilayahmu.", false, "Saat dipakai"),
        p("Mikrofon", "\"Opsional untuk bantuan suara\".", true, "Opsional"),
        p("Kontak", "\"Untuk transfer cepat\".", true, "Opsional"),
      ],
      details: [d("Ditautkan dari situs bank", "Ya", false), d("Developer sama dengan penerbit resmi", "Ya", false)],
      redFlags: ["Developer sama dengan bank resmi.", "Ditautkan dari situs resmi.", "Izin mikrofon dan kontak opsional."],
      explanation: "Izin kamera dan lokasi wajar untuk eKYC. Pastikan sumber dan developer, lalu tolak yang opsional.",
      saferAction: "Pasang dari sumber resmi, batasi izin.",
      postInstall: ["Aktifkan biometrik.", "Hapus swafoto dari galeri."],
    },
  },

  /* 9. Update dari pemilik baru. Benar: c */
  {
    id: "apps-9", level: 9, difficulty: "Ahli", topic: "Pembaruan dari pemilik baru",
    title: "Catatan Harian Minta Update Besar",
    description: "Aplikasi catatan yang sudah dua tahun kamu pakai meminta pembaruan.",
    context: "Versi 5.0: lebih cepat, fitur baru, perbaikan bug.",
    choices: [
      c("a", "Update karena aplikasinya sudah dua tahun dipakai dan sumbernya toko resmi", false, "Kepercayaan lama tidak berlaku pada pemilik baru.", "Developernya berganti 3 minggu lalu. Aplikasi populer sering dijual lalu disisipi kode.", "Periksa pemilik dan izin baru."),
      c("b", "Update, lalu tolak izin mikrofon, lokasi, dan semua file yang baru muncul", false, "Menolak izin belum cukup.", "Pemilik baru bisa menambahkan komponen lain lewat pembaruan berikutnya, dan ulasan terbaru sudah melaporkan iklan layar penuh.", "Hentikan pemakaian."),
      c("c", "Tahan pembaruan, ekspor catatanmu ke file, lalu pindah ke aplikasi catatan dari developer yang jelas", true, "Tepat.", "Pemilik berganti, izin baru tidak masuk akal untuk catatan, dan ulasan 7 hari terakhir menurun tajam. Mengekspor data dulu menjaga catatanmu.", "Laporkan ke toko aplikasi."),
      c("d", "Update, lalu cek apakah semua catatanmu masih utuh dan notifikasinya normal", false, "Itu tidak cukup.", "Kode berbahaya jarang merusak data. Ia bekerja diam-diam dengan izin baru yang sudah kamu berikan.", "Periksa pemilik, bukan isi catatan."),
    ],
    appDetails: {
      name: "Catatan Harian v5.0", description: "Aplikasi catatan harian dengan pengingat.",
      developer: "Praktis Apps Holdings (berganti 3 minggu lalu)", category: "Produktivitas", rating: "4.8 (lama), 2.1 (7 hari terakhir)", downloads: "5.000.000+", badge: "Versi 5.0",
      source: "Toko aplikasi resmi (simulasi)", sourceType: "official", risk: "Tinggi",
      foundVia: "Notifikasi pembaruan dari aplikasi yang sudah kamu pakai dua tahun.",
      claim: "Lebih cepat, lebih ringan, fitur baru.", reviews: "Ulasan lama bagus. Ulasan 7 hari terakhir melaporkan iklan layar penuh dan notifikasi aneh.",
      permissions: [
        p("Notifikasi", "Pengingat.", false, "Saat dipakai"),
        p("Mikrofon", "\"Catatan suara\".", true, "Selalu aktif (baru)"),
        p("Lokasi", "\"Pengingat berbasis tempat\".", true, "Di latar belakang (baru)"),
        p("Semua file", "\"Cadangan\".", true, "Akses penuh (baru)"),
      ],
      details: [d("Izin pada versi lama", "Hanya notifikasi", false), d("Catatan pembaruan", "Hanya \"perbaikan bug\"", true)],
      redFlags: ["Pemilik developer baru berganti.", "Izin baru tidak sesuai fungsi.", "Rating terbaru turun drastis."],
      explanation: "Pembaruan berbahaya memanfaatkan kepercayaan yang sudah lama terbentuk.",
      saferAction: "Ekspor data lalu hapus.",
      postInstall: ["Cabut izin baru.", "Pantau aktivitas akun penting."],
    },
  },

  /* 10. ASLI: update dompet digital. Benar: b */
  {
    id: "apps-10", level: 10, difficulty: "Ahli", topic: "Pembaruan sah dengan izin baru",
    title: "Dompet Digital Minta Update dan Izin Kamera",
    description: "Aplikasi dompet digital yang kamu pakai meminta pembaruan dan izin kamera baru.",
    context: "Versi 8.2: pindai QR lebih cepat dan perbaikan keamanan.",
    choices: [
      c("a", "Jangan update dan hapus aplikasinya, karena developer yang meminta izin baru pasti disusupi", false, "Menunda pembaruan keamanan berisiko.", "Developernya sama, perubahan dijelaskan rinci, dan izin baru cocok dengan fitur QR. Melewatkan tambalan keamanan justru membuat aplikasi rentan.", "Baca catatan pembaruan."),
      c("b", "Update dari toko resmi, izinkan kamera \"Saat dipakai\", tolak lokasi dan kontak karena opsional", true, "Tepat.", "Kamera dibutuhkan untuk pindai QR. Lokasi dan kontak opsional, jadi boleh ditolak tanpa mengganggu fungsi utama.", "Cek izin berkala."),
      c("c", "Update dan izinkan lokasi \"Selalu\" agar deteksi penipuan transaksi lebih akurat", false, "\"Selalu\" tidak diperlukan.", "Lokasi bersifat opsional. Memberi izin latar belakang hanya menambah jejak lokasimu.", "Pilih \"Tolak\" atau \"Saat dipakai\"."),
      c("d", "Pasang update dari file \"mirror\" karena toko aplikasi sedang lambat", false, "File mirror bisa dimodifikasi.", "Pembaruan sah hanya dari toko resmi. File mirror bisa disisipi kode pencuri saldo.", "Tunggu dan gunakan toko resmi."),
    ],
    appDetails: {
      name: "DompetKu v8.2", description: "Dompet digital untuk bayar, transfer, dan pindai QR.",
      developer: "PT Dompetku Teknologi (sama seperti sebelumnya)", category: "Keuangan", rating: "4.7", downloads: "20.000.000+", badge: "Versi 8.2",
      source: "Toko aplikasi resmi (simulasi)", sourceType: "official", risk: "Rendah",
      foundVia: "Notifikasi pembaruan dari toko aplikasi resmi untuk aplikasi yang sudah kamu pakai.",
      claim: "Pindai QR lebih cepat, perbaikan keamanan.", reviews: "Ulasan wajar. Beberapa pengguna menyambut fitur QR baru.",
      permissions: [
        p("Kamera", "Memindai kode QR pembayaran.", false, "Saat dipakai"),
        p("Lokasi", "Membantu mendeteksi transaksi tidak biasa.", true, "Opsional"),
        p("Kontak", "Transfer ke nomor di kontak.", true, "Opsional"),
      ],
      details: [d("Catatan pembaruan", "Menjelaskan fitur QR dan tambalan keamanan secara rinci", false), d("Developer", "Sama dengan versi sebelumnya", false)],
      redFlags: ["Developer sama dan ditautkan ke situs resmi.", "Perubahan dijelaskan rinci.", "Izin baru sesuai fitur baru."],
      explanation: "Izin baru bisa sah jika sesuai fitur, dijelaskan, dan developer tidak berganti.",
      saferAction: "Perbarui dari toko resmi, batasi izin.",
      postInstall: ["Aktifkan PIN dan biometrik.", "Periksa notifikasi transaksi."],
    },
  },
];