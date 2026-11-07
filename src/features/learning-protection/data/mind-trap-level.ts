import type { SimulationScenario } from "@/types/learning-protection/index";

function defineScenario(
  scenario: Omit<SimulationScenario, "context"> & { context?: string },
): SimulationScenario {
  return {
    ...scenario,
    context: scenario.context ?? scenario.messages?.join("\n\n") ?? "",
  };
}

export const mindTrapScenarios: SimulationScenario[] = [
  /* ===== LEVEL 1 ===== */
  defineScenario({
    id: "mind-1",
    level: 1,
    difficulty: "Mudah",
    topic: "FOMO (takut ketinggalan)",
    title: "Slot Terakhir Hari Ini",
    description: "Kamu baru bergabung di sebuah grup investasi dan melihat pengumuman ini.",
    sender: { name: "Grup “Cuan Bareng Pemula”", status: "412 anggota" },
    messages: [
      "📢 SLOT TERAKHIR! Program trading AI hanya menerima 5 orang lagi hari ini.",
      "Yang gabung sekarang dijamin untung 20% minggu ini. Besok kuota ditutup dan harganya naik dua kali lipat!",
    ],
    choices: [
      {
        id: "a",
        label: "Segera bergabung agar tidak kehilangan kesempatan.",
        isSafe: false,
        feedback: "Kamu sedang terjebak FOMO.",
        explanation:
          "Kuota terbatas dan tenggat sengaja dibuat agar kamu tidak sempat memeriksa. Peluang yang sah tidak memaksamu memutuskan hari ini juga.",
        saferAction:
          "Berhenti sejenak, lalu periksa legalitas dan risikonya sebelum memutuskan.",
        reply: "Mantap! Transfer sekarang ya, slotmu kami tahan 10 menit.",
      },
      {
        id: "b",
        label: "Mengabaikan tekanan waktu dan memverifikasi legalitas penyelenggara lebih dulu.",
        isSafe: true,
        feedback: "Tepat! Kamu tidak membiarkan FOMO mengambil alih.",
        explanation:
          "Keputusan finansial sebaiknya dibuat dari informasi, bukan tenggat buatan.",
        saferAction:
          "Cek izin lewat kanal resmi regulator dan abaikan ajakan yang menekan.",
        reply: "Ya sudah, nanti menyesal lho kalau slotnya habis.",
      },
      {
        id: "c",
        label: "Minta waktu semalam, tetapi transfer sedikit dulu untuk “menahan slot”.",
        isSafe: false,
        feedback: "Uang “penahan slot” tetap bagian dari jebakan.",
        explanation:
          "Uang muka kecil membuatmu merasa sudah berkomitmen, sehingga lebih sulit mundur.",
        saferAction: "Jangan transfer apa pun sebelum legalitas dan risikonya jelas.",
        reply: "Oke, transfer Rp200.000 saja untuk menahan, sisanya besok ya.",
      },
    ],
  }),

  /* ===== LEVEL 2 ===== */
  defineScenario({
    id: "mind-2",
    level: 2,
    difficulty: "Mudah",
    topic: "Bias otoritas",
    title: "“Dokter Finansial” di Video Pendek",
    description:
      "Seorang pembicara berjas dengan gelar “Dr.” di nama akunnya merekomendasikan sebuah aplikasi.",
    sender: { name: "Dr. Reza, Pakar Finansial", status: "video pendek • 1,2 juta pengikut" },
    messages: [
      "“Saya Dr. Reza, praktisi keuangan 15 tahun. Aplikasi ini sudah saya pakai sendiri dan aman 100%.”",
      "“Percayalah pada pengalaman saya. Tidak perlu cek-cek lagi, langsung deposit saja.”",
    ],
    choices: [
      {
        id: "a",
        label: "Langsung percaya karena beliau bergelar doktor dan punya jutaan pengikut.",
        isSafe: false,
        feedback: "Gelar dan pengikut bukan bukti keahlian atau kejujuran.",
        explanation:
          "Bias otoritas membuat kita menurut pada figur yang tampak ahli. Gelar bisa dipakai tanpa dasar, dan akun bisa dibayar atau dibuat dengan bantuan AI.",
        saferAction:
          "Periksa latar belakang dan izin yang bisa diverifikasi secara independen.",
        reply: "Keputusan bijak! Link depositnya ada di bio, ya.",
      },
      {
        id: "b",
        label:
          "Memeriksa apakah gelar, afiliasi, dan izin aplikasinya bisa diverifikasi di sumber independen.",
        isSafe: true,
        feedback: "Tepat! Klaim otoritas perlu dibuktikan.",
        explanation:
          "Ahli sungguhan bisa diperiksa lewat lembaga, publikasi, dan izin resmi. “Tidak perlu cek lagi” adalah tanda bahaya.",
        saferAction:
          "Jangan deposit sampai izin dan identitas penyedia terbukti lewat kanal resmi.",
        reply: "Ngapain cek-cek, ini sudah terbukti. Yang ragu pasti rugi.",
      },
      {
        id: "c",
        label: "Deposit kecil saja sebagai percobaan karena beliau tampak meyakinkan.",
        isSafe: false,
        feedback: "Percaya sebagian tetap berarti percaya tanpa bukti.",
        explanation:
          "Deposit kecil sering menjadi pintu masuk. Setelah kamu merasa sudah terlibat, tekanan untuk menambah setoran meningkat.",
        saferAction: "Verifikasi dulu, baru pertimbangkan apa pun.",
        reply: "Bagus, awal yang baik! Kalau sudah untung, naikkan depositnya ya.",
      },
    ],
  }),

  /* ===== LEVEL 3 ===== */
  defineScenario({
    id: "mind-3",
    level: 3,
    difficulty: "Mudah",
    topic: "Bukti sosial",
    title: "Ribuan Komentar Positif",
    description: "Kamu membuka halaman sebuah platform investasi dan membaca kolom komentarnya.",
    sender: { name: "Kolom komentar", status: "2.300 komentar" },
    messages: [
      "“Alhamdulillah penarikan lancar!” • “Sudah 3 minggu profit terus” • “Makasih kak, modal 2 juta jadi 9 juta 🙏”",
      "Sebagian besar komentar bernada sama dan berasal dari akun yang baru dibuat bulan ini.",
    ],
    choices: [
      {
        id: "a",
        label: "Ikut bergabung karena begitu banyak orang yang terlihat berhasil.",
        isSafe: false,
        feedback: "Banyak komentar bukan jaminan layanan itu aman.",
        explanation:
          "Bukti sosial memanfaatkan kecenderungan kita mengikuti orang lain. Komentar dan akun mudah dibuat massal oleh bot atau pihak berbayar.",
        saferAction:
          "Cari bukti independen dan legalitas yang bisa diverifikasi.",
        reply: "Selamat bergabung! Sudah 3.481 orang bersama kami.",
      },
      {
        id: "b",
        label:
          "Memeriksa akun-akun pemberi komentar dan mencari ulasan independen di luar halaman itu.",
        isSafe: true,
        feedback: "Tepat! Kamu tidak sekadar mengikuti keramaian.",
        explanation:
          "Akun baru dengan kalimat mirip adalah tanda komentar rekayasa. Ulasan yang bisa dipercaya muncul di luar kendali penyedia.",
        saferAction:
          "Jangan memutuskan berdasarkan popularitas. Cek legalitas lewat kanal resmi.",
        reply: "Tidak apa-apa kalau ragu, tetapi jangan sampai ketinggalan ya.",
      },
      {
        id: "c",
        label:
          "Membalas komentar bertanya “beneran aman?” dan percaya jawaban mereka.",
        isSafe: false,
        feedback: "Yang menjawab bisa jadi bagian dari jebakan itu sendiri.",
        explanation:
          "Pertanyaan di kolom itu sering dijawab akun yang sama atau suruhan, bukan sumber yang netral.",
        saferAction: "Cari pendapat dari pihak yang tidak punya kepentingan.",
        reply: "Aman banget kak! Saya sudah 2 bulan di sini, hasilnya nyata.",
      },
    ],
  }),

  /* ===== LEVEL 4 ===== */
  defineScenario({
    id: "mind-4",
    level: 4,
    difficulty: "Menengah",
    topic: "Resiprositas (balas budi)",
    title: "Hadiah Kecil dari Kenalan Baru",
    description:
      "Kenalan baru dari aplikasi pertemanan mengirimmu voucher makan tanpa diminta.",
    sender: { name: "Dimas", status: "kenal 4 hari lewat aplikasi pertemanan" },
    messages: [
      "Tadi aku kirim voucher makan Rp75.000 buat kamu ya, anggap aja hadiah kecil 😊",
      "Oh iya, boleh minta tolong? Rekeningku lagi diblokir. Bisa transferin Rp1.500.000 ke rekening temanku dulu? Besok pasti aku ganti plus bonus.",
    ],
    choices: [
      {
        id: "a",
        label: "Membantu transfer karena merasa tidak enak sudah diberi voucher.",
        isSafe: false,
        feedback: "Rasa tidak enak itulah yang dimanfaatkan.",
        explanation:
          "Resiprositas: pemberian kecil menimbulkan rasa wajib membalas. Pelaku memakainya untuk membuka permintaan yang jauh lebih besar.",
        saferAction:
          "Pisahkan hadiah dari permintaan. Kamu tidak berutang apa pun atas pemberian yang tidak kamu minta.",
        reply: "Makasih banget! Ini rekeningnya ya, aku tunggu bukti transfernya 🙏",
      },
      {
        id: "b",
        label: "Membantu setengahnya saja sebagai jalan tengah.",
        isSafe: false,
        feedback: "Jalan tengah tetap berarti kamu mengikuti permintaannya.",
        explanation:
          "Setelah satu permintaan dikabulkan, permintaan berikutnya terasa lebih mudah dikabulkan.",
        saferAction: "Tolak sopan dan jangan mentransfer apa pun.",
        reply: "Terima kasih! Kurangnya nanti bantu lagi ya, aku jadi tenang.",
      },
      {
        id: "c",
        label:
          "Menolak dengan sopan dan menyadari bahwa voucher itu tidak menciptakan kewajiban apa pun.",
        isSafe: true,
        feedback: "Tepat! Kamu memutus rasa wajib membalas.",
        explanation:
          "Hadiah yang tidak kamu minta tidak menjadi utang budi. Permintaan uang dari orang yang baru kamu kenal perlu dicurigai.",
        saferAction:
          "Berhenti mentransfer dan perhatikan apakah ia makin menekan setelah ditolak.",
        reply: "Kok gitu sih, aku kan udah baik sama kamu...",
      },
      {
        id: "d",
        label: "Membalas dengan hadiah yang lebih besar agar tidak merasa berutang.",
        isSafe: false,
        feedback: "Kamu justru memperdalam siklus balas budi.",
        explanation:
          "Saling memberi membuat hubungan terasa akrab dan makin sulit menolak permintaan berikutnya.",
        saferAction: "Tidak perlu membalas apa pun. Jaga jarak sampai identitasnya terbukti.",
        reply: "Wah baik banget kamu! Sekalian, soal bantuan tadi ya...",
      },
    ],
  }),

  /* ===== LEVEL 5 ===== */
  defineScenario({
    id: "mind-5",
    level: 5,
    difficulty: "Menengah",
    topic: "Komitmen bertahap",
    title: "Dari Survei 1 Menit ke Deposit",
    description: "Permintaan datang bertahap, dan setiap langkah terasa kecil.",
    sender: { name: "Tim Survei Hadiah", status: "akun bisnis" },
    messages: [
      "Langkah 1: Isi survei 1 menit, dapat saldo Rp5.000 ✅",
      "Langkah 2: Pasang aplikasi pembayar hadiah dan masukkan nomor teleponmu.",
      "Langkah 3: Verifikasi identitas dengan foto KTP agar hadiah Rp300.000 bisa dicairkan.",
      "Langkah 4: Setor Rp50.000 sebagai deposit aktivasi. Kamu sudah sejauh ini, sayang kalau berhenti!",
    ],
    choices: [
      {
        id: "a",
        label: "Lanjut sampai selesai karena sudah terlanjur menyelesaikan tiga langkah.",
        isSafe: false,
        feedback: "Kamu terjebak dorongan untuk tetap konsisten.",
        explanation:
          "Setiap langkah kecil membuatmu merasa harus melanjutkan. Permintaan paling berbahaya sengaja ditaruh di akhir.",
        saferAction:
          "Nilai permintaan terakhir secara terpisah, seolah itu permintaan pertama.",
        reply: "Bagus! Tinggal setor, hadiahmu langsung kami proses.",
      },
      {
        id: "b",
        label:
          "Berhenti sekarang, menilai permintaan terakhir terpisah dari langkah sebelumnya, dan tidak menyetor atau memberi KTP.",
        isSafe: true,
        feedback: "Tepat! Kamu memutus rantai komitmen.",
        explanation:
          "Hadiah yang meminta setoran dan data identitas adalah tanda bahaya, berapa pun langkah sebelumnya yang sudah kamu lalui.",
        saferAction:
          "Hapus aplikasinya, cabut izin yang diberikan, dan jangan kirim data apa pun lagi.",
        reply: "Sayang sekali, padahal tinggal satu langkah lagi!",
      },
      {
        id: "c",
        label: "Menyetor Rp50.000 saja karena nominalnya kecil dibanding hadiahnya.",
        isSafe: false,
        feedback: "Nominal kecil membuatmu lengah.",
        explanation:
          "Setoran kecil dipilih agar tidak terasa berisiko. Setelah itu biasanya muncul biaya atau syarat lain.",
        saferAction: "Jangan menyetor. Hadiah asli tidak memerlukan deposit.",
        reply: "Setoran diterima. Untuk mencairkan, ada biaya admin Rp75.000 lagi ya.",
      },
      {
        id: "d",
        label: "Memberikan KTP tetapi menolak setor deposit.",
        isSafe: false,
        feedback: "KTP tetap data yang sangat sensitif.",
        explanation:
          "Identitasmu sudah cukup berharga bagi pelaku untuk dipakai membuat pinjaman atau akun palsu.",
        saferAction: "Jangan kirim KTP kepada pihak yang tidak terverifikasi.",
        reply: "KTP kami terima. Mohon selfie sambil memegang KTP juga ya.",
      },
    ],
  }),

  /* ===== LEVEL 6 ===== */
  defineScenario({
    id: "mind-6",
    level: 6,
    difficulty: "Menengah",
    topic: "Sunk cost (biaya yang sudah hilang)",
    title: "Sudah Terlanjur Setor",
    description:
      "Kamu sudah menyetor Rp3.000.000 dan saldo di aplikasi tampak Rp4.200.000, tetapi penarikan “tertahan”.",
    sender: { name: "Admin Platform Investasi", status: "online" },
    messages: [
      "Untuk menarik dana, selesaikan “verifikasi akun” dengan setoran Rp750.000.",
      "Sayang sekali kalau modal Rp3.000.000 Anda hangus. Tinggal selangkah lagi!",
    ],
    choices: [
      {
        id: "a",
        label: "Menyetor lagi karena sudah terlanjur menaruh banyak uang.",
        isSafe: false,
        feedback: "Kamu terkena jebakan sunk cost.",
        explanation:
          "Uang yang sudah masuk tidak akan kembali dengan menyetor lagi. Setiap setoran baru hanya menambah kerugian, dan biasanya muncul biaya baru lagi.",
        saferAction:
          "Berhenti menyetor. Pertimbangkan keputusan baru berdasarkan keadaan sekarang, bukan uang yang sudah keluar.",
        reply: "Pembayaran diterima. Ada biaya pajak Rp1.100.000 sebelum dana cair ya.",
      },
      {
        id: "b",
        label: "Meminjam uang untuk menyetor supaya modal awal tidak hangus.",
        isSafe: false,
        feedback: "Berutang demi mengejar uang yang hilang memperparah masalah.",
        explanation:
          "Kerugian awal kini ditambah utang. Saldo di aplikasi hanyalah angka yang bisa diatur penyedia.",
        saferAction: "Jangan berutang. Hentikan semua transfer dan cari bantuan resmi.",
        reply: "Cepat ya, slot penarikan hari ini tinggal dua orang!",
      },
      {
        id: "c",
        label:
          "Berhenti menyetor, menerima kerugian yang sudah terjadi, menyimpan bukti, dan melaporkannya.",
        isSafe: true,
        feedback: "Keputusan yang sulit tetapi tepat.",
        explanation:
          "Menerima kerugian yang sudah terjadi mencegah kerugian yang lebih besar. Bukti dan laporan membantu pencegahan korban lain.",
        saferAction:
          "Hubungi bank, simpan bukti, dan laporkan lewat layanan pengaduan resmi seperti Indonesia Anti-Scam Centre (IASC).",
        reply: "Kalau berhenti sekarang, uang Anda hilang selamanya!",
      },
      {
        id: "d",
        label: "Menyetor separuhnya (Rp375.000) supaya risikonya lebih kecil.",
        isSafe: false,
        feedback: "Mengurangi jumlah tidak mengubah jebakannya.",
        explanation:
          "Setoran sebagian tetap uang yang hilang, dan membuatmu makin terikat pada harapan bahwa dana akan cair.",
        saferAction: "Jangan menyetor sama sekali.",
        reply: "Setoran sebagian belum cukup. Kurangnya Rp375.000 lagi ya.",
      },
    ],
  }),

  /* ===== LEVEL 7 ===== */
  defineScenario({
    id: "mind-7",
    level: 7,
    difficulty: "Sulit",
    topic: "Framing cicilan dan anchoring",
    title: "Cicilan yang Terasa Ringan",
    description:
      "Kamu ingin membeli ponsel. Penawaran paylater menonjolkan angka-angka yang kecil.",
    sender: { name: "Iklan Paylater", status: "promo kilat • berakhir 3 jam lagi" },
    messages: [
      "📱 Harga normal Rp12.999.000. HARI INI Rp9.800.000! Hemat lebih dari 3 juta.",
      "Cukup Rp32.700 per hari selama 12 bulan. Bunga 0% untuk 3 bulan pertama. Klik “Ambil Sekarang” sebelum promo berakhir.",
    ],
    choices: [
      {
        id: "a",
        label: "Ambil sekarang karena cicilan harian terasa sangat ringan.",
        isSafe: false,
        feedback: "Angka kecil per hari menutupi total yang besar.",
        explanation:
          "Rp32.700 × 365 hari ≈ Rp11,9 juta, lebih mahal daripada harga tunai Rp9,8 juta. Memecah biaya menjadi angka harian membuat beban terasa kecil.",
        saferAction:
          "Hitung total pembayaran, bukan angka cicilan per hari atau per bulan.",
        reply: "Pilihan tepat! Pengajuanmu disetujui dalam hitungan detik.",
      },
      {
        id: "b",
        label: "Ambil karena “hemat 3 juta” dari harga normal.",
        isSafe: false,
        feedback: "Harga “normal” itu hanyalah patokan yang dipasang penjual.",
        explanation:
          "Anchoring: angka awal yang tinggi membuat harga akhir terasa murah. Harga pasar sebenarnya mungkin sudah jauh di bawah “harga normal” tersebut.",
        saferAction:
          "Bandingkan harga di beberapa toko resmi, bukan dengan angka coret di iklan.",
        reply: "Hemat 3 juta lho! Promo ini tidak akan terulang.",
      },
      {
        id: "c",
        label:
          "Menghitung total pembayaran termasuk bunga setelah 3 bulan, membandingkan harga di toko lain, dan menunda keputusan.",
        isSafe: true,
        feedback: "Tepat! Kamu melawan jebakan angka dan tenggat.",
        explanation:
          "Menghitung total dan membandingkan harga memutus efek anchoring. Menunda keputusan menghilangkan tekanan promo kilat.",
        saferAction:
          "Beli hanya jika totalnya masuk akal dan masih terjangkau tanpa mengganggu kebutuhan pokok.",
        reply: "Promo tinggal 2 jam lagi lho, nanti menyesal!",
      },
      {
        id: "d",
        label: "Ambil tenor terpanjang supaya cicilannya paling kecil.",
        isSafe: false,
        feedback: "Tenor panjang biasanya berarti total yang lebih mahal.",
        explanation:
          "Cicilan yang lebih kecil terasa nyaman sekarang, tetapi bunga dan lamanya utang menambah biaya keseluruhan.",
        saferAction: "Pilih berdasarkan total biaya dan kemampuan bayar, bukan angka cicilan terkecil.",
        reply: "Tenor 24 bulan tersedia, cicilan hanya Rp18.900 per hari!",
      },
    ],
  }),

  /* ===== LEVEL 8 ===== */
  defineScenario({
    id: "mind-8",
    level: 8,
    difficulty: "Sulit",
    topic: "Love bombing dan keterikatan emosional",
    title: "Orang yang Tiba-tiba Sangat Perhatian",
    description:
      "Seseorang yang selalu menyapa pagi dan malam, memujimu, dan kini membutuhkan bantuan.",
    sender: { name: "Amanda", status: "kenal 3 minggu lewat aplikasi kencan" },
    messages: [
      "Kamu tuh satu-satunya orang yang bikin aku ngerasa dimengerti. Aku belum pernah ngerasain ini sebelumnya ❤️",
      "Aku lagi kena masalah di bandara luar negeri, kartuku diblokir. Cuma kamu yang bisa kupercaya. Tolong transfer Rp6.500.000, nanti kuganti begitu pulang. Jangan kasih tahu siapa-siapa dulu ya, malu.",
    ],
    choices: [
      {
        id: "a",
        label: "Mentransfer karena kamu merasa dia benar-benar peduli dan hanya mengandalkanmu.",
        isSafe: false,
        feedback: "Kedekatan yang cepat dipakai untuk membuka permintaan uang.",
        explanation:
          "Love bombing: perhatian dan pujian berlebihan membangun keterikatan secepat kilat, lalu muncul keadaan darurat dan permintaan uang. Permintaan untuk merahasiakan membuatmu terisolasi.",
        saferAction:
          "Jangan mentransfer. Ceritakan situasinya kepada orang yang kamu percaya.",
        reply: "Terima kasih sayang, kamu penyelamatku. Ini rekening temanku ya.",
      },
      {
        id: "b",
        label: "Meminta video call dulu, lalu mentransfer jika orangnya terlihat sesuai.",
        isSafe: false,
        feedback: "Tampilan di video bukan jaminan.",
        explanation:
          "Video call bisa dimanipulasi, dan pelaku sering sudah menyiapkan alasan. Yang menjadi masalah adalah pola permintaan uangnya, bukan hanya identitasnya.",
        saferAction:
          "Jangan mentransfer uang kepada orang yang belum pernah kamu temui langsung.",
        reply: "Sinyalnya jelek di sini, videonya putus-putus. Tolong percaya aku dulu ya.",
      },
      {
        id: "c",
        label:
          "Menunda, tidak mentransfer, menceritakan situasi ini kepada teman atau keluarga tepercaya, dan menyadari pola kedekatan cepat lalu permintaan uang.",
        isSafe: true,
        feedback: "Tepat! Kamu memutus isolasi dan mengenali polanya.",
        explanation:
          "Menceritakan ke orang lain adalah antidot terkuat. Pola kedekatan cepat, keadaan darurat, dan permintaan merahasiakan adalah ciri khas.",
        saferAction:
          "Hentikan transfer, simpan bukti percakapan, dan pertimbangkan melapor lewat layanan pengaduan resmi.",
        reply: "Aku kecewa kamu tidak percaya sama aku. Aku kira kamu beda.",
      },
      {
        id: "d",
        label: "Menawarkan transfer lebih kecil (Rp1.000.000) sebagai tanda peduli.",
        isSafe: false,
        feedback: "Jumlah kecil tidak mengubah pola manipulasinya.",
        explanation:
          "Setelah satu transfer berhasil, permintaan berikutnya hampir pasti datang dengan alasan baru.",
        saferAction: "Jangan mentransfer berapa pun, dan bicarakan dengan orang tepercaya.",
        reply: "Terima kasih, tapi kurang. Sisanya Rp5.500.000 lagi ya, tolong banget.",
      },
    ],
  }),

  /* ===== LEVEL 9 ===== */
  defineScenario({
    id: "mind-9",
    level: 9,
    difficulty: "Ahli",
    topic: "Bias konfirmasi",
    title: "Hanya Membaca yang Mendukung",
    description:
      "Kamu sudah mulai yakin pada sebuah platform investasi. Kini kamu mencari “bukti” bahwa keputusanmu benar.",
    sender: { name: "Grup anggota platform", status: "diawasi admin" },
    messages: [
      "Semua anggota membagikan tangkapan layar profit. Pesan yang mempertanyakan keamanan dihapus admin dalam hitungan menit.",
      "Admin: “Yang bilang ini penipuan itu orang iri yang gagal. Jangan dengarkan mereka, fokus ke yang berhasil.”",
    ],
    choices: [
      {
        id: "a",
        label: "Fokus ke kisah sukses di grup karena sesuai dengan keyakinanmu.",
        isSafe: false,
        feedback: "Kamu hanya melihat bukti yang mendukung pendapatmu.",
        explanation:
          "Bias konfirmasi membuat kita mencari dan memercayai informasi yang cocok dengan keyakinan, serta mengabaikan yang bertentangan. Grup yang menghapus kritik memperkuat bias ini.",
        saferAction:
          "Cari informasi dari luar grup, terutama dari pihak yang tidak punya kepentingan.",
        reply: "Betul, yang penting positif! Jangan sampai terpengaruh orang negatif.",
      },
      {
        id: "b",
        label: "Menganggap kritik pasti berasal dari orang iri, lalu mengabaikannya.",
        isSafe: false,
        feedback: "Menuduh pengkritik iri adalah cara menghindari pemeriksaan.",
        explanation:
          "Kritik yang kredibel layak diperiksa isinya, bukan niat penyampainya. Label “iri” membuat kita berhenti menimbang.",
        saferAction: "Periksa isi kritik dan buktinya, bukan siapa yang mengatakannya.",
        reply: "Mantap, jangan dengarkan haters. Sukses itu untuk yang yakin!",
      },
      {
        id: "c",
        label:
          "Sengaja mencari kritik dan laporan korban dari sumber independen di luar grup, lalu menimbang bukti dari dua sisi.",
        isSafe: true,
        feedback: "Tepat! Kamu menguji keyakinanmu sendiri.",
        explanation:
          "Mencari bukti yang menentang keyakinan adalah penawar bias konfirmasi. Grup yang menghapus semua keraguan patut dicurigai.",
        saferAction:
          "Jangan menyetor dana sebelum kritik yang kredibel terjawab dengan bukti yang bisa diverifikasi.",
        reply: "Kamu mulai terpengaruh orang luar ya? Hati-hati salah langkah.",
      },
      {
        id: "d",
        label: "Meminta anggota lain di grup memastikan bahwa platform ini aman.",
        isSafe: false,
        feedback: "Yang kamu tanya adalah orang-orang di dalam ruang gema yang sama.",
        explanation:
          "Jawaban dari kelompok yang sudah yakin hanya akan menguatkan keyakinanmu, bukan mengujinya.",
        saferAction: "Tanyakan kepada pihak yang independen dan bisa diverifikasi.",
        reply: "Aman banget! Semua anggota di sini sudah merasakannya.",
      },
    ],
  }),

  /* ===== LEVEL 10 ===== */
  defineScenario({
    id: "mind-10",
    level: 10,
    difficulty: "Ahli",
    topic: "Terlalu percaya diri (overconfidence)",
    title: "“Aku Tidak Mungkin Tertipu”",
    description:
      "Kamu dikenal paling melek digital di keluargamu dan sering mengingatkan orang lain soal penipuan. Lalu sebuah tawaran yang sangat profesional muncul.",
    sender: { name: "Konsultan Investasi Eksklusif", status: "menghubungimu langsung" },
    messages: [
      "“Bapak/Ibu tentu orang yang cerdas dan tidak mudah ditipu. Itu sebabnya kami menawarkan ini khusus kepada Anda.”",
      "“Keputusan harus hari ini, dan sebaiknya tidak dibicarakan dulu dengan siapa pun karena ini program tertutup. 12.000 klien sudah bergabung.”",
    ],
    choices: [
      {
        id: "a",
        label: "Merasa aman karena kamu tahu banyak soal penipuan dan pasti bisa menilai sendiri.",
        isSafe: false,
        feedback: "Merasa kebal adalah celah terbesar.",
        explanation:
          "Overconfidence membuat kita menurunkan kewaspadaan. Penipu justru menyasar orang yang yakin dirinya tidak bisa tertipu, lalu memakai pujian, tenggat, dan larangan membicarakan dengan orang lain secara bersamaan.",
        saferAction:
          "Anggap dirimu bisa keliru, dan andalkan aturan pribadi, bukan perasaan yakin.",
        reply: "Kami tahu Bapak/Ibu bijak. Silakan tanda tangani kontraknya sekarang.",
      },
      {
        id: "b",
        label: "Menganggap penipuan hanya menimpa orang yang kurang paham teknologi, jadi tawaran ini aman.",
        isSafe: false,
        feedback: "Korban penipuan datang dari semua tingkat pengetahuan.",
        explanation:
          "Penipuan canggih menyasar emosi dan kebiasaan berpikir, bukan sekadar kurangnya pengetahuan teknologi.",
        saferAction: "Terapkan verifikasi yang sama untuk semua tawaran, siapa pun yang menawarkan.",
        reply: "Tepat sekali. Orang seperti Anda memang memahami peluang ini.",
      },
      {
        id: "c",
        label:
          "Menerapkan aturan pribadi: tidak ada keputusan keuangan di hari yang sama, selalu bicara dengan orang tepercaya, dan verifikasi independen, bahkan saat merasa yakin.",
        isSafe: true,
        feedback: "Level tertinggi, dan kamu menjawab dengan benar!",
        explanation:
          "Aturan yang dibuat sebelum situasi muncul melindungimu justru saat perasaan yakin dan tekanan sedang tinggi. Pujian, tenggat, kerahasiaan, dan jumlah klien adalah empat pemicu sekaligus.",
        saferAction:
          "Tulis aturan pribadimu dan sepakati dengan keluarga. Tawaran sah tetap bertahan setelah ditunda dan diperiksa.",
        reply: "Kalau menunda, kesempatan ini akan diberikan ke orang lain.",
      },
      {
        id: "d",
        label: "Memutuskan cepat sendiri supaya tidak terlihat ragu di depan konsultan.",
        isSafe: false,
        feedback: "Gengsi tidak boleh menggantikan pemeriksaan.",
        explanation:
          "Ingin tampak percaya diri dan cerdas adalah pintu masuk. Keputusan cepat adalah tujuan utama tekanan dalam pesan tadi.",
        saferAction: "Bersikap ragu dan meminta waktu adalah tanda kecerdasan, bukan kelemahan.",
        reply: "Keputusan yang tegas! Kami kirim kontrak dan nomor rekeningnya.",
      },
    ],
  }),
];