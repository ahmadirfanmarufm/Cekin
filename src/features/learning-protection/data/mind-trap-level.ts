import type { SimulationChoice, SimulationScenario } from "@/types/learning-protection/index";

const c = (
  id: string, label: string, isSafe: boolean,
  feedback: string, explanation: string, saferAction: string, reply?: string,
): SimulationChoice => ({ id, label, isSafe, feedback, explanation, saferAction, reply });

export const mindTrapScenarios: SimulationScenario[] = [
  /* 1. Diskon asli. Benar: d */
  {
    id: "mind-1", level: 1, difficulty: "Mudah", topic: "Curiga berlebihan (diskon yang asli)",
    title: "Flash Sale untuk Barang yang Sudah Kamu Rencanakan",
    description: "Dua bulan kamu menabung untuk earbuds Rp650.000. Hari ini toko resmi menampilkan flash sale.",
    sender: { name: "Toko Elektronik Resmi", status: "centang resmi • flash sale 3 jam" },
    messages: ["⚡ Earbuds seri yang kamu incar: Rp499.000 (harga normal Rp899.000). Sisa 8 unit.", "Cek juga bundel kabel + casing Rp149.000!"],
    context: "",
    choices: [
      c("a", "Lewati saja. Diskon dengan hitung mundur pasti jebakan FOMO", false, "Curiga berlebihan juga bias.", "Tidak semua diskon jebakan. Kamu sudah punya rencana, anggaran, dan tahu harga pasar.", "Cek harga lalu putuskan.", "Yah, nanti harganya naik lagi."),
      c("b", "Beli earbuds dan bundel kabel + casing selagi sisa 8 unit", false, "Bundel tidak masuk rencanamu.", "Diskon besar sering dipakai untuk menambah belanja yang tidak direncanakan.", "Beli sesuai rencana saja.", "Pilihan bagus, bundelnya sisa 2!"),
      c("c", "Tunggu akhir bulan, siapa tahu ada diskon yang lebih besar", false, "Menunda tanpa alasan juga bias.", "Kebutuhanmu nyata dan harga sekarang sudah di bawah anggaranmu.", "Putuskan berdasarkan data.", "Stok tinggal 3 unit!"),
      c("d", "Cek harga di satu atau dua toko resmi lain, lalu beli earbuds saja jika memang paling murah", true, "Tepat.", "Rencana jelas dan pengecekan singkat memotong tekanan waktu tanpa menolak diskon yang memang asli.", "Simpan struk dan cek garansi.", "Harga kami asli kok, silakan cek."),
    ],
  },

  /* 2. Anchoring. Benar: a */
  {
    id: "mind-2", level: 2, difficulty: "Mudah", topic: "Anchoring (angka patokan)",
    title: "Servis HP yang \"Diskon Besar\"",
    description: "Layar HP-mu retak. Teknisi menaksir biaya, lalu \"berbaik hati\" menurunkannya.",
    sender: { name: "Pak Teknisi", status: "konter HP dekat kampus" },
    messages: ["Wah ini parah, harus ganti LCD + frame, Rp1.800.000.", "Tapi buat Kakak saya kasih diskon jadi Rp1.200.000, hari ini saja."],
    context: "",
    choices: [
      c("a", "Minta rincian kerusakannya, lalu tanya harga ganti LCD ke dua konter lain sebelum memutuskan", true, "Tepat.", "Patokan harga dari luar mematahkan efek anchoring. Kamu tahu harga wajar tanpa menuduh siapa pun.", "Minta garansi tertulis.", "Silakan Kak, tapi harga diskon cuma hari ini."),
      c("b", "Tawar sampai Rp900.000 lalu setuju", false, "Patokanmu masih angka dia.", "Tawar-menawar tetap berputar di sekitar angka pertama yang ia sebut.", "Bandingkan dengan harga lain.", "Rp1.000.000 deh, itu sudah pas."),
      c("c", "Tolak karena teknisi pasti sengaja menaikkan harga", false, "Belum tentu menipu.", "Kamu belum punya data harga. Menuduh tanpa bukti sama bias dengan percaya tanpa bukti.", "Cek harga lain dulu.", "Ya sudah Kak."),
      c("d", "Terima Rp1.200.000 karena sudah turun Rp600.000", false, "Penurunan dihitung dari angka yang dipasang sendiri.", "Harga awal yang tinggi membuat harga akhir terasa murah.", "Cari patokan dari luar.", "Pilihan tepat, kami kerjakan sekarang."),
    ],
  },

  /* 3. Otoritas + bukti sosial. Benar: c */
  {
    id: "mind-3", level: 3, difficulty: "Mudah", topic: "Otoritas yang tumpang tindih dengan bukti sosial",
    title: "Koperasi \"Digital\" yang Direkomendasikan Om",
    description: "Omnya yang dihormati keluarga dan ketua pengajian mengajak ikut koperasi simpan pinjam daring.",
    sender: { name: "Om Hendra", status: "ketua RT, jemaah aktif" },
    messages: ["Sudah 200 orang di lingkungan kita ikut. Imbal hasil 2% per bulan, tabungan aman.", "Kamu nggak usah banyak tanya, Om yang jamin."],
    context: "",
    choices: [
      c("a", "Ikut dengan setoran kecil Rp500.000 sebagai uji coba", false, "Uji coba tetap setoran.", "Setoran kecil yang \"lancar\" sering dipakai untuk membuatmu menyetor lebih besar.", "Periksa legalitasnya dulu.", "Bagus, tahun depan naikkan ya."),
      c("b", "Tolak, karena Om tidak paham soal investasi", false, "Menyimpulkan tanpa data.", "Om mungkin tulus. Yang perlu diperiksa adalah produknya, bukan tingkat pemahaman orangnya.", "Periksa izin, bukan niat orangnya.", "Ya sudah."),
      c("c", "Terima kasih pada Om, lalu minta nama badan hukumnya dan cek izinnya sendiri di OJK atau Kemenkop sebelum setor", true, "Tepat.", "Kamu memisahkan rasa hormat pada orang dari penilaian terhadap produk.", "Tanyakan ke Om apakah ia sudah memeriksa izinnya.", "Om sudah jamin, ngapain dicek?"),
      c("d", "Minta Om menunjukkan bukti anggota lain sudah menerima imbal hasil", false, "Bukti dari dalam lingkaran yang sama.", "Pembayaran awal ke anggota lama adalah pola skema ponzi. Itu bukan bukti izin atau keamanan.", "Verifikasi lewat lembaga resmi.", "Ini buktinya, banyak yang sudah cair."),
    ],
  },

  /* 4. Sunk cost. Benar: b */
  {
    id: "mind-4", level: 4, difficulty: "Menengah", topic: "Sunk cost (biaya yang sudah keluar)",
    title: "Kursus Rp3 Juta yang Tidak Cocok",
    description: "Kamu sudah bayar Rp3.000.000 untuk kursus trading online. Dua minggu terakhir isinya menurutmu tidak sesuai janji.",
    sender: { name: "Admin Kursus", status: "grup alumni" },
    messages: ["Kamu sudah sejauh ini! Upgrade ke Mentoring Premium Rp2.000.000 dan kami jamin hasil.", "Sayang kan kalau Rp3 juta pertama sia-sia?"],
    context: "",
    choices: [
      c("a", "Selesaikan kursus tanpa upgrade, supaya uang Rp3 juta terpakai sampai habis", false, "Tetap sunk cost.", "Menghabiskan sesuatu yang tidak bernilai hanya menambah waktu yang hilang.", "Putuskan berdasarkan manfaat ke depan.", "Bagus, tetap semangat."),
      c("b", "Hentikan dan ajukan refund tertulis dengan menyebut janji yang tidak terpenuhi, simpan bukti pembayaran", true, "Tepat.", "Uang yang sudah keluar tidak kembali dengan menambah uang. Refund tertulis memberi dasar jika perlu mengadu.", "Simpan bukti pembayaran.", "Refund tidak tersedia setelah 14 hari."),
      c("c", "Upgrade setengahnya dulu, Rp1.000.000, untuk melihat apakah mentoringnya berbeda", false, "Jumlahnya kecil, jebakannya sama.", "Kamu tetap menambah uang ke keputusan yang sudah terbukti mengecewakan.", "Hentikan.", "Setengah belum cukup, kurang Rp1.000.000."),
      c("d", "Upgrade supaya uang Rp3 juta yang sudah keluar tidak sia-sia", false, "Sunk cost.", "Uang yang sudah keluar tidak kembali dengan menambah uang lagi.", "Nilai keputusan baru dari nol.", "Keputusan tepat, ini rekening mentoring."),
    ],
  },

  /* 5. HOAKS: pesan berantai kesehatan. Benar: c */
  {
    id: "mind-5", level: 5, difficulty: "Menengah", topic: "Hoaks pesan berantai (kepanikan dan kerabat dekat)",
    title: "\"Sebarkan Sebelum Terlambat\"",
    description: "Tante yang kamu sayangi mengirim pesan berantai ke grup keluarga. Ia sangat khawatir, dan kamu tahu ia tidak berniat menipu.",
    sender: { name: "Tante Lina", status: "grup keluarga besar" },
    messages: ["⚠️ BAHAYA! Minuman kemasan merek X ditarik BPOM karena mengandung zat berbahaya. 8 anak masuk RS.", "Sebarkan ke 10 grup supaya tidak ada korban lagi. Dari dokter teman Tante, jadi pasti benar 🙏"],
    context: "",
    choices: [
      c("a", "Teruskan hanya ke grup keluarga inti saja, bukan ke 10 grup", false, "Tetap menyebarkan hoaks.", "Pesan yang belum diperiksa tetap berbahaya walau penerimanya sedikit.", "Periksa dulu sebelum meneruskan.", "Terima kasih ya, bantu sebarkan."),
      c("b", "Hapus pesannya dan bilang ke Tante bahwa semua pesan berantai itu bohong", false, "Menggeneralisasi dan menyinggung.", "Tidak semua peringatan palsu. Tante akan tetap percaya karena kamu tidak menunjukkan buktinya.", "Tunjukkan hasil pemeriksaan.", "Tapi ini dari dokter!"),
      c("c", "Cari nama merek + \"BPOM\" di situs atau akun resmi BPOM dan media arus utama, lalu balas Tante dengan hasilnya", true, "Tepat.", "Klaim penarikan produk selalu diumumkan lembaga resmi. Jika tidak ada, pesan itu hoaks. Membalas dengan bukti lebih meyakinkan daripada menyalahkan.", "Jangan teruskan sebelum ada sumber resmi.", "Oh begitu, nanti Tante hapus."),
      c("d", "Teruskan karena sumbernya dokter, lebih baik berlebihan daripada menyesal", false, "Otoritas yang tidak bisa dicek.", "\"Dokter teman Tante\" tidak bisa diperiksa. Kepanikan dan pesan \"sebarkan\" adalah ciri khas hoaks.", "Cek BPOM dulu.", "Betul, ini penting!"),
    ],
  },

  /* 6. Garansi uang kembali. Benar: d */
  {
    id: "mind-6", level: 6, difficulty: "Menengah", topic: "Garansi uang kembali yang sulit dicairkan",
    title: "Aman karena Ada Jaminan",
    description: "Aplikasi investasi menawarkan jaminan uang kembali 100% jika tidak untung dalam 30 hari.",
    sender: { name: "Aplikasi CuanAman", status: "ulasan 4,8" },
    messages: ["Modal kembali 100% jika dalam 30 hari tidak untung. Tanpa risiko.", "Syarat berlaku. Klaim melalui layanan pelanggan."],
    context: "",
    choices: [
      c("a", "Setor Rp5.000.000 karena ada garansi uang kembali", false, "Garansi menurunkan waspadamu.", "Syarat klaim bisa sangat berat dan penyelenggaranya mungkin tidak berizin.", "Cek izin dan syarat klaim.", "Terima kasih, dana diterima."),
      c("b", "Setor kecil dulu untuk membuktikan garansinya benar-benar cair", false, "Menguji dengan uang tetap taruhan.", "Pembayaran kecil di awal sering dibuat lancar supaya kamu menyetor lebih besar.", "Cek izin dulu.", "Silakan, setoran minimal Rp500.000."),
      c("c", "Tanya di kolom ulasan apakah ada yang pernah berhasil klaim garansi", false, "Ulasan mudah dipalsukan.", "Ulasan seragam dan bintang tinggi tidak membuktikan garansi benar cair.", "Cek izin di sumber resmi.", "Banyak kok yang berhasil!"),
      c("d", "Baca syarat klaim lengkap dan cek izin penyelenggara di situs OJK sebelum setor", true, "Tepat.", "Jaminan yang sah punya syarat tertulis dan penyelenggara berizin. Tanpa itu, janji \"tanpa risiko\" tidak bernilai.", "Jangan setor jika izin tidak ada.", "Syarat bisa dibaca di dalam aplikasi."),
    ],
  },

  /* 7. Framing cicilan. Benar: b */
  {
    id: "mind-7", level: 7, difficulty: "Sulit", topic: "Framing cicilan dan anchoring",
    title: "Cicilan Harian yang Terasa Ringan",
    description: "Kamu ingin membeli ponsel. Penawaran paylater menonjolkan angka kecil.",
    sender: { name: "Iklan Paylater", status: "promo kilat" },
    messages: ["📱 Harga normal Rp12.999.000. HARI INI Rp9.800.000!", "Cukup Rp32.700 per hari selama 12 bulan. Bunga 0% 3 bulan pertama."],
    context: "",
    choices: [
      c("a", "Ambil, karena cicilan harian Rp32.700 sangat ringan", false, "Angka kecil menutupi total.", "Rp32.700 × 360 hari ≈ Rp11,8 juta, lebih mahal dari harga promo Rp9,8 juta.", "Hitung total.", "Disetujui dalam hitungan detik."),
      c("b", "Hitung total bayar penuh, lalu bandingkan dengan harga tunai di dua toko resmi", true, "Tepat.", "Total dan perbandingan memutus efek angka kecil dan patokan \"harga normal\".", "Beli hanya jika total masuk akal.", "Promo tinggal 2 jam."),
      c("c", "Ambil, karena hemat Rp3 juta dari harga normal", false, "\"Harga normal\" hanya patokan penjual.", "Anchoring membuat harga akhir terasa murah. Kamu belum tahu harga pasar sebenarnya.", "Bandingkan dengan toko lain.", "Hemat 3 juta lho!"),
      c("d", "Pilih tenor terpanjang supaya beban bulanan paling kecil", false, "Tenor panjang berarti total lebih mahal.", "Beban bulanan terasa ringan, tapi bunga dan biaya membuat total membengkak.", "Pilih berdasarkan total.", "Tenor 24 bulan tersedia."),
    ],
  },

  /* 8. BUZZER (cukup satu). Benar: a */
  {
    id: "mind-8", level: 8, difficulty: "Sulit", topic: "Buzzer dan opini yang direkayasa",
    title: "Tagar yang Tiba-tiba Ramai",
    description: "Sebuah kebijakan baru, \"Tabungan Wajib Nasional\", tiba-tiba menjadi trending. Kamu belum membaca isinya, tapi balasan di mana-mana sangat yakin.",
    sender: { name: "Utas #DukungTabunganWajib", status: "trending, 1.900 balasan dalam 25 menit" },
    messages: [
      "@bangsa_cerdas88 (akun dibuat 3 minggu lalu): Program ini jenius! Yang kontra cuma yang belum paham ekonomi. #DukungTabunganWajib",
      "@rakyat_peduli_21 (akun dibuat 3 minggu lalu): Program ini jenius! Yang kontra cuma yang nggak paham ekonomi. #DukungTabunganWajib",
      "@anak_negeri_77: Sudah baca naskahnya? Belum? Ya jangan komentar. Dasar tukang nyinyir.",
    ],
    context: "",
    choices: [
      c("a", "Baca naskah kebijakan dari situs resmi, lalu bandingkan dengan analisis beberapa pakar dan media yang berbeda sudut pandang", true, "Tepat.", "Buzzer bisa dari pihak mana pun: pemerintah, partai, perusahaan, atau pihak yang menentangnya. Yang bisa kamu uji adalah isi kebijakannya, bukan jumlah yang ramai.", "Nilai argumen, bukan siapa yang paling ramai.", "Tagar ini sedang trending di seluruh Indonesia."),
      c("b", "Berpihak ke yang kontra, karena yang pro pasti dibayar", false, "Itu pola yang sama.", "Pihak yang kontra juga bisa mengerahkan buzzer. Menilai kebenaran dari siapa yang dibayar tidak menjawab isi kebijakannya.", "Baca kebijakannya sendiri.", "Terima kasih, yang kontra juga ramai."),
      c("c", "Ikuti pendapat mayoritas karena trending berarti banyak orang setuju", false, "Trending bisa direkayasa.", "Akun baru, kalimat hampir sama, dan lonjakan balasan dalam waktu singkat adalah tanda koordinasi, bukan opini spontan.", "Periksa usia akun dan pola kalimatnya.", "Ramai banget, pasti disukai."),
      c("d", "Balas dengan tagar tandingan agar suara yang kontra juga ramai", false, "Ikut memperkeruh.", "Kamu menambah kebisingan, bukan informasi. Tagar tandingan sering memunculkan kubu baru yang sama-sama tidak membaca isinya.", "Bagikan ringkasan dari sumber resmi.", "Perang tagar dimulai!"),
    ],
  },

  /* 9. HOAKS: video lama + bias konfirmasi. Benar: d */
  {
    id: "mind-9", level: 9, difficulty: "Ahli", topic: "Hoaks video lama dan bias konfirmasi",
    title: "Video Banjir yang Cocok dengan Kekesalanmu",
    description: "Kamu memang sedang kesal pada pemerintah daerah karena lambat menangani banjir. Lalu sebuah video viral masuk ke grup alumni, dan isinya persis seperti yang selama ini kamu duga.",
    sender: { name: "Grup Alumni", status: "pesan terusan • 214 kali diteruskan" },
    messages: ["VIRAL! Detik-detik tanggul jebol di kota kita pagi ini. Korban ratusan, media sengaja diam!", "Share sebelum dihapus. Pemerintah menutupi semuanya 😡"],
    context: "",
    choices: [
      c("a", "Teruskan, karena media memang sering menutupi dan video ini cocok dengan yang terjadi", false, "Bias konfirmasi.", "Kamu percaya karena video itu sesuai dengan kekesalanmu, bukan karena ada bukti.", "Cek dulu sebelum meneruskan.", "Yes, orang harus tahu!"),
      c("b", "Tanyakan ke admin grup apakah videonya benar", false, "Admin juga hanya meneruskan.", "Admin biasanya tidak punya sumber primer. Jawabannya hanya menguatkan keyakinan yang sudah ada.", "Cek ke pihak independen.", "Katanya sih benar, banyak yang share."),
      c("c", "Anggap palsu karena semua video viral pasti editan", false, "Generalisasi.", "Video banjir memang bisa asli. Yang harus dilakukan adalah memeriksa, bukan menebak.", "Periksa asal video dan lokasinya.", "Yah, kamu nggak percaya?"),
      c("d", "Cek lewat pencarian gambar terbalik dan akun resmi BPBD, BMKG, serta media tepercaya. Jika video lama, balas di grup dengan sumbernya", true, "Tepat.", "Video lama sering dipakai ulang untuk peristiwa baru. Pencarian gambar terbalik dan sumber resmi bisa menunjukkan kapan dan di mana video itu dibuat.", "Jangan teruskan sebelum asal-usul jelas.", "Ini video tahun lalu di kota lain, kok."),
    ],
  },

  /* 10. Terlalu percaya diri. Benar: c */
  {
    id: "mind-10", level: 10, difficulty: "Ahli", topic: "Terlalu percaya diri setelah menang",
    title: "Kamu Baru Saja Menggagalkan Penipuan",
    description: "Kamu baru melaporkan penipuan dan dipuji karena jeli. Lalu seorang \"konsultan\" menghubungimu dengan sopan.",
    sender: { name: "Konsultan Keamanan Finansial", status: "menghubungimu langsung" },
    messages: ["\"Anda orang yang sangat cermat. Itu sebabnya kami menawarkan program pemulihan dan investasi eksklusif ini.\"", "\"Keputusan hari ini, dan sebaiknya tidak dibahas dulu dengan siapa pun.\""],
    context: "",
    choices: [
      c("a", "Merasa aman karena kamu baru saja berhasil mengenali penipuan", false, "Rasa menang menurunkan kewaspadaan.", "Pelaku sengaja menyasar orang yang yakin tidak mungkin tertipu.", "Anggap dirimu bisa keliru.", "Kami tahu Anda bijak."),
      c("b", "Setuju tapi minta contoh kontrak dulu untuk dibaca", false, "Kontrak bisa dipalsukan.", "Dokumen dari pihak yang sama bukan verifikasi. Larangan membahas dengan orang lain adalah tanda bahaya.", "Verifikasi lewat sumber independen.", "Ini kontraknya, silakan tanda tangan."),
      c("c", "Tunda keputusan uang sampai besok, ceritakan ke orang tepercaya, dan cek lembaganya sendiri di situs OJK", true, "Tepat.", "Aturan yang dibuat sebelumnya bekerja justru saat kamu merasa yakin dan ditekan.", "Tulis aturannya dan sepakati dengan keluarga.", "Kalau menunda, kesempatannya diberikan ke orang lain."),
      c("d", "Minta nomor kantornya, lalu telepon ke nomor itu untuk menanyakan program", false, "Nomor itu dari pihak yang sama.", "Nomor yang diberikan penelepon bisa dipegang rekannya. Cari kontak sendiri dari sumber resmi.", "Verifikasi lewat kanal yang kamu cari sendiri.", "Silakan telepon, kami siap menjelaskan."),
    ],
  },
];