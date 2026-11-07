import type { SimulationScenario } from "@/types/learning-protection/index";

export const appsScamScenarios: SimulationScenario[] = [
  /* ===== LEVEL 1 ===== */
  {
    id: "apps-1",
    level: 1,
    difficulty: "Mudah",
    topic: "APK MOD game",
    title: "Skin Gratis dari Video Viral",
    description: "Video TikTok menjanjikan skin dan diamond gratis lewat file APK.",
    context: "Download APK MOD sekarang dan nikmati semua skin premium secara gratis.",
    choices: [
      {
        id: "a",
        label: "Mengunduh dan memasang APK karena banyak komentar bilang berhasil.",
        isSafe: false,
        feedback: "Komentar di video bisa dibuat siapa saja, termasuk oleh pembuat video.",
        explanation:
          "APK MOD dari situs pihak ketiga dimodifikasi oleh orang tak dikenal. Kode berbahaya mudah disisipkan, dan komentar positif sering dibuat akun palsu.",
        saferAction:
          "Jangan pasang. Unduh game hanya dari toko resmi dan beli item lewat menu dalam game.",
      },
      {
        id: "b",
        label: "Memasang APK, tetapi menolak semua izin yang diminta.",
        isSafe: false,
        feedback: "Memasang saja sudah berisiko.",
        explanation:
          "Aplikasi berbahaya bisa terus meminta izin, memaksa lewat fitur aksesibilitas, atau menjalankan kode saat pertama dibuka.",
        saferAction: "Jangan memasang APK dari sumber tak resmi, apa pun izinnya.",
      },
      {
        id: "c",
        label:
          "Tidak memasang. Cari game resmi di toko aplikasi dan beli item lewat menu resmi.",
        isSafe: true,
        feedback: "Tepat! Kamu menghindari sumber yang tidak bisa dipercaya.",
        explanation:
          "Toko resmi memang tidak sempurna, tetapi punya pemeriksaan dasar dan jalur pelaporan. File APK dari tautan video tidak punya keduanya.",
        saferAction:
          "Laporkan video ke platform. Ingatkan teman yang mungkin tergoda dengan tawaran yang sama.",
      },
      {
        id: "d",
        label: "Memasang di ponsel, tetapi login pakai akun game cadangan.",
        isSafe: false,
        feedback: "Yang berisiko bukan hanya akun game, tetapi seluruh ponselmu.",
        explanation:
          "Izin SMS, kontak, dan notifikasi memberi akses ke data di luar game, termasuk OTP dan aplikasi lain.",
        saferAction: "Jangan memasang APK MOD sama sekali.",
      },
    ],
    appDetails: {
      name: "Arena Legends MOD APK",
      description: "Game aksi dengan skin premium dan koin tanpa batas, dibagikan lewat tautan di bio video.",
      developer: "Unknown Studio",
      category: "Game Action",
      rating: "4.9",
      downloads: "10.000+",
      badge: "Diamond & Skin Unlimited",
      source: "Situs pihak ketiga (arena-mod-apk.example)",
      sourceType: "unofficial",
      risk: "Kritis",
      foundVia: "Video TikTok “cara dapat skin gratis”. Tautan unduhan ada di bio akun.",
      claim: "Semua skin premium dan unlimited diamond gratis. Download APK MOD sekarang!",
      reviews: "Ulasan di situs tersebut hampir semuanya bintang 5 dengan kalimat mirip. Tidak ada ulasan independen.",
      permissions: [
        { name: "Akses SMS", reason: "Dapat membaca pesan masuk, termasuk kode OTP.", suspicious: true },
        { name: "Akses kontak", reason: "Dapat membaca daftar kontak.", suspicious: true },
        { name: "Akses notifikasi", reason: "Dapat melihat isi notifikasi aplikasi lain.", suspicious: true },
        { name: "Tampil di atas aplikasi lain", reason: "Dapat menutupi layar aplikasi lain.", suspicious: true },
      ],
      details: [
        { label: "Ukuran file", value: "3,1 MB (game aslinya ratusan MB)", suspicious: true },
        { label: "Identitas developer", value: "Tidak ada informasi yang bisa diverifikasi", suspicious: true },
      ],
      redFlags: [
        "APK dibagikan lewat tautan di media sosial, bukan toko resmi.",
        "Menjanjikan fitur premium gratis yang tidak resmi.",
        "Game meminta izin SMS dan kontak yang tidak relevan.",
        "Ukuran file terlalu kecil untuk game sungguhan.",
      ],
      explanation:
        "APK MOD dari sumber tak resmi dapat disisipi kode berbahaya, dan izin SMS serta notifikasi bisa dipakai untuk mencuri OTP.",
      saferAction: "Unduh game resmi dari toko aplikasi dan hindari tawaran fitur premium gratis.",
      postInstall: [
        "Jangan buka aplikasi atau beri izin tambahan.",
        "Uninstall lewat pengaturan, lalu jalankan pemindaian keamanan.",
        "Ganti kata sandi akun penting dari perangkat lain yang tepercaya.",
        "Pantau mutasi rekening dan e-wallet beberapa hari ke depan.",
      ],
    },
  },

  /* ===== LEVEL 2 ===== */
  {
    id: "apps-2",
    level: 2,
    difficulty: "Mudah",
    topic: "APK undangan digital",
    title: "Undangan Pernikahan Berbentuk APK",
    description: "Kontak yang kamu kenal mengirim “undangan digital” lewat WhatsApp.",
    context: "Anda diundang! Buka aplikasi undangan untuk melihat lokasi dan jadwal acara.",
    choices: [
      {
        id: "a",
        label: "Memasang file itu karena pengirimnya temanmu sendiri.",
        isSafe: false,
        feedback: "Akun temanmu bisa saja sudah diambil alih.",
        explanation:
          "Pelaku menyebar APK lewat akun korban sebelumnya, sehingga pesan tampak datang dari orang yang kamu percaya.",
        saferAction: "Jangan pasang. Konfirmasi lewat telepon ke temanmu.",
      },
      {
        id: "b",
        label: "Membalas “ini file apa?” dan memasangnya jika dijawab “undangan”.",
        isSafe: false,
        feedback: "Jawaban lewat chat tidak membuktikan siapa yang menulis.",
        explanation:
          "Jika akun diretas, pelaku yang membalas. Mereka akan menjawab seolah-olah itu teman aslinya.",
        saferAction: "Verifikasi lewat panggilan suara atau orang lain yang mengenal temanmu.",
      },
      {
        id: "c",
        label:
          "Tidak memasang. Telepon temanmu, dan minta undangan dalam bentuk gambar atau tautan web.",
        isSafe: true,
        feedback: "Tepat! Kamu memakai jalur lain untuk memverifikasi.",
        explanation:
          "Undangan sungguhan umumnya berupa gambar, PDF, atau halaman web, bukan aplikasi yang harus dipasang.",
        saferAction: "Beri tahu temanmu bahwa akunnya mungkin diretas supaya ia segera memulihkannya.",
      },
      {
        id: "d",
        label: "Meneruskan file ke grup keluarga agar ada yang mengeceknya.",
        isSafe: false,
        feedback: "Kamu justru membantu menyebarkan aplikasi berbahaya.",
        explanation: "Anggota grup yang kurang waspada bisa langsung memasangnya.",
        saferAction: "Jangan teruskan. Peringatkan grup agar tidak membuka file itu.",
      },
    ],
    appDetails: {
      name: "Undangan_Pernikahan.apk",
      description: "File aplikasi yang diklaim berisi undangan digital pernikahan.",
      developer: "Tidak tercantum",
      category: "Lainnya",
      rating: "-",
      downloads: "-",
      badge: "File dari chat",
      source: "File APK dari chat WhatsApp",
      sourceType: "unofficial",
      risk: "Kritis",
      foundVia: "Pesan WhatsApp dari kontak yang kamu kenal, tanpa kamu minta.",
      claim: "Anda diundang! Buka aplikasi undangan untuk melihat lokasi dan jadwal acara.",
      reviews: "Tidak ada ulasan karena aplikasi tidak berasal dari toko aplikasi.",
      permissions: [
        { name: "Pasang aplikasi dari sumber tak dikenal", reason: "Perlu diaktifkan agar APK bisa terpasang.", suspicious: true },
        { name: "Akses SMS", reason: "Dapat membaca OTP yang masuk.", suspicious: true },
        { name: "Aksesibilitas", reason: "Dapat melihat dan mengendalikan layar.", suspicious: true },
      ],
      details: [
        { label: "Format undangan", value: ".apk (undangan asli berupa gambar, PDF, atau tautan web)", suspicious: true },
        { label: "Cara dikirim", value: "Tanpa kata pengantar pribadi, mendadak", suspicious: true },
      ],
      redFlags: [
        "Undangan berupa file aplikasi, bukan gambar atau tautan.",
        "Dikirim mendadak tanpa percakapan sebelumnya.",
        "Perlu mengaktifkan pemasangan dari sumber tak dikenal.",
        "Meminta izin SMS dan aksesibilitas.",
      ],
      explanation:
        "Modus ini marak: akun korban diambil alih, lalu APK disebar ke seluruh kontaknya agar korban berantai.",
      saferAction: "Jangan pasang, konfirmasi lewat telepon, dan laporkan nomor pengirim.",
      postInstall: [
        "Aktifkan mode pesawat, lalu uninstall aplikasi.",
        "Hubungi bank dan e-wallet untuk memblokir akses sementara.",
        "Ganti kata sandi dan PIN dari perangkat lain.",
        "Beri tahu kontakmu agar tidak membuka file serupa dari nomormu.",
      ],
    },
  },

  /* ===== LEVEL 3 ===== */
  {
    id: "apps-3",
    level: 3,
    difficulty: "Mudah",
    topic: "Pinjol ilegal",
    title: "Pinjaman Cair 5 Menit",
    description: "Iklan di media sosial menawarkan pinjaman tanpa slip gaji.",
    context: "Pinjaman Rp1.000.000 cair 5 menit, tanpa jaminan, tanpa slip gaji.",
    choices: [
      {
        id: "a",
        label: "Memasang dan mengajukan pinjaman karena butuh dana cepat.",
        isSafe: false,
        feedback: "Kamu menyerahkan data pribadimu ke pihak yang tidak jelas.",
        explanation:
          "Pinjol ilegal memakai akses kontak dan galeri untuk meneror peminjam dan orang di kontaknya, dan bunganya bisa jauh di atas batas wajar.",
        saferAction: "Jangan pasang. Cek legalitas penyedia pinjaman lebih dulu.",
      },
      {
        id: "b",
        label: "Mengajukan dengan data seadanya atau nomor cadangan.",
        isSafe: false,
        feedback: "Data palsu tidak menghilangkan risiko dari izin aplikasinya.",
        explanation:
          "Aplikasi tetap membaca kontak dan foto di ponselmu, dan akunmu bisa terkunci atau ditagih berlebihan.",
        saferAction: "Jangan pasang aplikasi pinjaman yang tidak terdaftar resmi.",
      },
      {
        id: "c",
        label:
          "Tidak memasang. Cek daftar penyelenggara berizin di situs resmi OJK, dan pakai layanan berizin bila butuh dana.",
        isSafe: true,
        feedback: "Tepat! Kamu memeriksa legalitas lebih dulu.",
        explanation:
          "Penyelenggara pinjaman berizin terdaftar dan diawasi. Iklan yang menjanjikan cair instan tanpa syarat patut dicurigai.",
        saferAction:
          "Laporkan iklan pinjol ilegal ke platform dan layanan pengaduan resmi.",
      },
      {
        id: "d",
        label: "Membagikan iklan ke teman yang sedang butuh uang.",
        isSafe: false,
        feedback: "Kamu bisa menyeret temanmu ke masalah yang sama.",
        explanation: "Teman yang terjerat bisa mengalami teror penagihan dan kebocoran data.",
        saferAction: "Jangan sebarkan. Arahkan teman ke layanan berizin.",
      },
    ],
    appDetails: {
      name: "DanaKilat Pinjaman 5 Menit",
      description: "Aplikasi pinjaman online dengan proses pengajuan super cepat.",
      developer: "KilatFin Tech",
      category: "Keuangan",
      rating: "4.8",
      downloads: "500.000+",
      badge: "Cair 5 Menit",
      source: "Unduhan langsung dari iklan (bukan toko resmi)",
      sourceType: "unofficial",
      risk: "Kritis",
      foundVia: "Iklan Instagram “cair 5 menit tanpa slip gaji”. Tombolnya mengunduh APK langsung.",
      claim: "Pinjaman Rp1.000.000 cair 5 menit, tanpa jaminan, tanpa slip gaji.",
      reviews: "Ulasan bintang 5 banyak yang seragam. Beberapa ulasan bintang 1 menyebut kontak teman diteror.",
      permissions: [
        { name: "Akses kontak", reason: "Dapat menyalin seluruh daftar kontak.", suspicious: true },
        { name: "Akses semua foto", reason: "Dapat melihat galeri foto.", suspicious: true },
        { name: "Akses SMS", reason: "Dapat membaca pesan masuk.", suspicious: true },
        { name: "Lokasi", reason: "Dapat melacak posisi perangkat.", suspicious: true },
      ],
      details: [
        { label: "Izin OJK", value: "Tidak ditemukan", suspicious: true },
        { label: "Bunga & denda", value: "Tidak dicantumkan sebelum pengajuan", suspicious: true },
      ],
      redFlags: [
        "Tidak terdaftar sebagai penyelenggara berizin.",
        "Meminta akses kontak, galeri, dan SMS.",
        "Bunga dan denda tidak transparan.",
        "Diunduh langsung dari iklan, bukan toko resmi.",
      ],
      explanation:
        "Pinjol ilegal meminjamkan uang sekaligus mengumpulkan data pribadi sebagai alat tekanan.",
      saferAction: "Pakai penyelenggara pinjaman berizin dan baca biaya serta bunganya sebelum mengajukan.",
      postInstall: [
        "Uninstall aplikasi dan cabut semua izinnya.",
        "Jangan membayar tagihan ke rekening pribadi yang tidak jelas.",
        "Simpan bukti teror penagihan untuk dilaporkan.",
        "Beri tahu keluarga dan kontak agar waspada terhadap pesan penagihan.",
      ],
    },
  },

  /* ===== LEVEL 4 ===== */
  {
    id: "apps-4",
    level: 4,
    difficulty: "Menengah",
    topic: "Antivirus palsu",
    title: "Pop-up “Ponselmu Terinfeksi”",
    description: "Peringatan virus di browser mengarahkanmu ke aplikasi keamanan di toko resmi.",
    context: "PERINGATAN! 5 virus terdeteksi. Pasang antivirus sekarang.",
    choices: [
      {
        id: "a",
        label: "Memasang karena aplikasinya ada di toko resmi dan ratingnya tinggi.",
        isSafe: false,
        feedback: "Toko resmi bukan jaminan mutlak.",
        explanation:
          "Aplikasi menyesatkan kadang lolos ke toko resmi. Rating tinggi bisa dibuat dengan ulasan palsu.",
        saferAction: "Periksa developer, umur rilis, dan ulasan terbaru sebelum memasang.",
      },
      {
        id: "b",
        label: "Memasang dan mengaktifkan aksesibilitas agar “antivirus” bekerja maksimal.",
        isSafe: false,
        feedback: "Aksesibilitas memberi kendali besar atas layarmu.",
        explanation:
          "Izin ini dipakai untuk membaca layar, mengklik tombol sendiri, dan menyetujui izin lain tanpa sepengetahuanmu.",
        saferAction: "Tolak. Antivirus yang sah jarang butuh kendali penuh seperti itu.",
      },
      {
        id: "c",
        label:
          "Mengabaikan pop-up, memakai pemindaian bawaan ponsel, dan memeriksa developer serta ulasan terbaru sebelum memasang aplikasi keamanan apa pun.",
        isSafe: true,
        feedback: "Tepat! Pop-up peringatan di browser adalah umpan klasik.",
        explanation:
          "Browser tidak bisa mendeteksi virus di ponselmu. Peringatan seperti ini dibuat untuk menakutimu agar mengunduh sesuatu.",
        saferAction: "Tutup tab browser dan jalankan pemindaian dari fitur keamanan bawaan.",
      },
      {
        id: "d",
        label: "Menekan tombol “Bersihkan Sekarang” di pop-up untuk melihat hasilnya.",
        isSafe: false,
        feedback: "Mengklik tombol di pop-up sudah membuka jalan masalah.",
        explanation: "Tombol itu bisa memicu unduhan, langganan berbayar, atau halaman phishing.",
        saferAction: "Tutup tab tanpa menekan apa pun di dalamnya.",
      },
    ],
    appDetails: {
      name: "SafeGuard Antivirus Pro",
      description: "Aplikasi keamanan yang mengklaim membersihkan virus dan mempercepat ponsel.",
      developer: "SafeGuard Labs",
      category: "Alat & Utilitas",
      rating: "4.7",
      downloads: "500.000+",
      badge: "Hapus Virus 1 Sentuhan",
      source: "Toko aplikasi resmi (simulasi)",
      sourceType: "official",
      risk: "Tinggi",
      foundVia: "Pop-up di browser: “Ponselmu terinfeksi 5 virus!” dengan tombol menuju toko aplikasi.",
      claim: "Hapus semua virus dan percepat ponsel 10x lipat hanya dengan satu sentuhan.",
      reviews: "Ulasan bintang 5 sangat banyak dan bernada mirip. Ulasan bintang 1 menyebut iklan layar penuh yang tidak bisa ditutup.",
      permissions: [
        { name: "Aksesibilitas", reason: "Dapat membaca dan mengendalikan layar.", suspicious: true },
        { name: "Tampil di atas aplikasi lain", reason: "Dapat menutupi aplikasi lain, misalnya halaman login.", suspicious: true },
        { name: "Akses notifikasi", reason: "Dapat membaca isi notifikasi.", suspicious: true },
        { name: "Akses penyimpanan", reason: "Untuk memindai file.", suspicious: false },
      ],
      details: [
        { label: "Dirilis", value: "9 hari lalu", suspicious: true },
        { label: "Kebijakan privasi", value: "Halaman kosong", suspicious: true },
      ],
      redFlags: [
        "Datang dari pop-up peringatan palsu di browser.",
        "Aplikasi baru dirilis dengan unduhan banyak.",
        "Meminta aksesibilitas dan tampil di atas aplikasi lain.",
        "Klaim performa dan pembersihan yang tidak realistis.",
      ],
      explanation:
        "Aplikasi di toko resmi tetap perlu diperiksa. Klaim berlebihan dan izin yang tidak sesuai fungsi adalah tanda bahaya.",
      saferAction: "Gunakan fitur keamanan bawaan dan periksa reputasi developer sebelum memasang aplikasi baru.",
      postInstall: [
        "Cabut izin aksesibilitas dan overlay lewat pengaturan.",
        "Uninstall aplikasi lalu jalankan pemindaian bawaan.",
        "Periksa aplikasi lain yang muncul tanpa kamu pasang.",
        "Pantau notifikasi dan iklan yang tidak wajar.",
      ],
    },
  },

  /* ===== LEVEL 5 ===== */
  {
    id: "apps-5",
    level: 5,
    difficulty: "Menengah",
    topic: "Aplikasi AI & langganan terselubung",
    title: "Efek AI Viral yang “Gratis”",
    description: "Iklan video menunjukkan efek AI wajah yang sedang viral.",
    context: "Lihat dirimu 20 tahun lagi atau jadi karakter film. Gratis, coba sekarang!",
    choices: [
      {
        id: "a",
        label: "Memasang, memberi semua izin, dan memulai uji coba gratis.",
        isSafe: false,
        feedback: "Biaya dan data wajahmu sudah diserahkan sebelum kamu menyadarinya.",
        explanation:
          "Uji coba gratis yang berlanjut ke langganan mahal sering tersembunyi di halaman pembayaran, dan data wajah bernilai tinggi.",
        saferAction: "Baca biaya dan kebijakan privasi sebelum memasang atau memulai uji coba.",
      },
      {
        id: "b",
        label: "Memasang dan berniat membatalkan langganan sebelum uji coba habis.",
        isSafe: false,
        feedback: "Rencana membatalkan sering gagal karena lupa atau sulit dilakukan.",
        explanation:
          "Menu pembatalan bisa disembunyikan, dan data wajahmu sudah terkumpul sejak foto pertama diunggah.",
        saferAction: "Periksa ketentuan langganan dan privasi dulu, baru putuskan.",
      },
      {
        id: "c",
        label:
          "Membaca ketentuan langganan dan kebijakan privasi dulu. Jika data wajah dibagikan ke pihak ketiga, tidak memasang atau memilih alternatif dari developer terverifikasi dengan izin foto terpilih.",
        isSafe: true,
        feedback: "Tepat! Kamu memeriksa biaya dan nasib data wajahmu.",
        explanation:
          "Data wajah dapat dipakai untuk memalsukan identitas atau melatih sistem tanpa izin. Biaya mingguan yang mahal juga sering disembunyikan.",
        saferAction: "Batasi izin ke foto yang dipilih saja, bukan seluruh galeri.",
      },
      {
        id: "d",
        label: "Mengunggah foto wajah orang lain saja, supaya wajahmu aman.",
        isSafe: false,
        feedback: "Kamu menyerahkan data pribadi orang lain tanpa izinnya.",
        explanation: "Foto temanmu bisa disimpan dan dipakai pihak lain tanpa sepengetahuannya.",
        saferAction: "Jangan mengunggah wajah siapa pun sebelum yakin kebijakan datanya aman.",
      },
    ],
    appDetails: {
      name: "FaceMagic AI Studio",
      description: "Aplikasi efek wajah berbasis AI dengan template yang sedang viral.",
      developer: "Magic Pixel Media",
      category: "Foto & Video",
      rating: "4.6",
      downloads: "1.000.000+",
      badge: "Efek AI Viral",
      source: "Toko aplikasi resmi (simulasi)",
      sourceType: "official",
      risk: "Sedang",
      foundVia: "Iklan video di media sosial yang sedang ramai dibagikan.",
      claim: "Gratis! Coba efek AI viral sekarang.",
      reviews: "Banyak pujian untuk efeknya. Beberapa ulasan menyebut tagihan mingguan yang tak disadari.",
      permissions: [
        { name: "Kamera", reason: "Untuk mengambil foto wajah.", suspicious: false },
        { name: "Akses semua foto dan video", reason: "Membaca seluruh galeri, bukan hanya foto yang dipilih.", suspicious: true },
        { name: "Akses kontak", reason: "Tidak diperlukan untuk efek foto.", suspicious: true },
      ],
      details: [
        { label: "Biaya setelah uji coba", value: "Rp189.000/minggu, tertulis kecil di halaman pembayaran", suspicious: true },
        { label: "Kebijakan privasi", value: "Data wajah dapat dibagikan ke “mitra”", suspicious: true },
      ],
      redFlags: [
        "Langganan mingguan mahal setelah uji coba.",
        "Data wajah boleh dibagikan ke pihak ketiga.",
        "Meminta seluruh galeri dan kontak.",
        "Iklan menonjolkan “gratis” tanpa menyebut biaya.",
      ],
      explanation:
        "Aplikasi AI populer sering memakai uji coba gratis dan pengumpulan data wajah sebagai sumber keuntungan.",
      saferAction: "Baca biaya dan privasi, serta batasi izin ke foto yang dipilih saja.",
      postInstall: [
        "Batalkan langganan lewat pengaturan toko aplikasi.",
        "Cabut izin galeri dan kontak.",
        "Minta penghapusan data wajah lewat kontak privasi aplikasi.",
        "Periksa tagihan di akun toko aplikasi dan metode pembayaranmu.",
      ],
    },
  },

  /* ===== LEVEL 6 ===== */
  {
    id: "apps-6",
    level: 6,
    difficulty: "Menengah",
    topic: "Aplikasi trading palsu",
    title: "Bot Trading dari Grup Sinyal",
    description: "Admin grup Telegram mengajak memakai bot trading AI yang katanya terbukti untung.",
    context: "AI trading otomatis, profit harian 3-8%, modal kembali terjamin.",
    choices: [
      {
        id: "a",
        label: "Deposit kecil Rp500.000 dulu sebagai uji coba.",
        isSafe: false,
        feedback: "Deposit kecil tetap pintu masuk.",
        explanation:
          "Pelaku sengaja menampilkan saldo naik di awal agar kamu menambah setoran, lalu menahan penarikan dengan biaya tambahan.",
        saferAction: "Jangan deposit sebelum legalitas jelas.",
      },
      {
        id: "b",
        label: "Percaya karena ada di toko resmi dan banyak anggota grup memamerkan profit.",
        isSafe: false,
        feedback: "Pamer profit di grup mudah direkayasa.",
        explanation:
          "Anggota yang memamerkan keuntungan sering akun suruhan. Keberadaan di toko resmi juga bukan bukti legalitas investasi.",
        saferAction: "Verifikasi legalitas lewat regulator, bukan lewat testimoni grup.",
      },
      {
        id: "c",
        label:
          "Tidak mendeposit. Periksa izin perusahaan dan aplikasinya di situs resmi OJK atau Bappebti serta daftar entitas investasi ilegal.",
        isSafe: true,
        feedback: "Tepat! Legalitas diperiksa dari sumber otoritas.",
        explanation:
          "Janji profit harian tinggi dengan “modal terjamin” tidak masuk akal. Entitas resmi tidak menjanjikan hasil pasti.",
        saferAction: "Laporkan grup dan aplikasi ke layanan pengaduan resmi.",
      },
      {
        id: "d",
        label: "Bertanya ke admin grup apakah aplikasinya aman.",
        isSafe: false,
        feedback: "Admin adalah pihak yang diuntungkan jika kamu ikut.",
        explanation: "Jawaban dari pihak yang menawarkan bukan verifikasi independen.",
        saferAction: "Periksa legalitas lewat kanal regulator yang kamu buka sendiri.",
      },
    ],
    appDetails: {
      name: "CuanBot Pro: Auto Trading",
      description: "Aplikasi bot trading otomatis berbasis AI dengan dashboard saldo.",
      developer: "CuanBot Global Ltd.",
      category: "Keuangan",
      rating: "4.8",
      downloads: "100.000+",
      badge: "AI Profit Harian",
      source: "Toko aplikasi resmi (simulasi)",
      sourceType: "official",
      risk: "Tinggi",
      foundVia: "Grup Telegram “sinyal profit” yang menyertakan tautan ke halaman aplikasi.",
      claim: "AI trading otomatis, profit harian 3-8%, modal kembali terjamin.",
      reviews: "Ulasan positif banyak berasal dari akun baru. Ulasan negatif menyebut penarikan dana ditahan.",
      permissions: [
        { name: "Akses kontak", reason: "Dipakai untuk fitur ajak teman.", suspicious: true },
        { name: "Akses notifikasi", reason: "Mengirim info saldo.", suspicious: false },
        { name: "Akses penyimpanan", reason: "Menyimpan bukti transaksi.", suspicious: false },
      ],
      details: [
        { label: "Izin OJK/Bappebti", value: "Tidak terdaftar", suspicious: true },
        { label: "Penarikan dana", value: "Harus deposit “verifikasi VIP” lebih dulu", suspicious: true },
        { label: "Alamat perusahaan", value: "Luar negeri, tanpa alamat jelas", suspicious: true },
      ],
      redFlags: [
        "Menjanjikan profit harian pasti dan modal terjamin.",
        "Tidak terdaftar di regulator.",
        "Penarikan dana ditahan dengan biaya tambahan.",
        "Terdapat dorongan mengajak teman bergabung.",
      ],
      explanation:
        "Tidak ada investasi yang menjamin profit harian tinggi. Saldo di aplikasi hanyalah angka yang bisa diatur penyedia.",
      saferAction: "Pastikan izin lewat regulator resmi dan jangan mendeposit ke entitas yang tidak terdaftar.",
      postInstall: [
        "Berhenti mendeposit dan jangan bayar biaya penarikan baru.",
        "Simpan bukti chat, transaksi, dan tangkapan layar.",
        "Hubungi bank untuk melaporkan transfer yang sudah terjadi.",
        "Laporkan lewat layanan pengaduan resmi.",
      ],
    },
  },

  /* ===== LEVEL 7 ===== */
  {
    id: "apps-7",
    level: 7,
    difficulty: "Sulit",
    topic: "Aplikasi remote access",
    title: "“CS Marketplace” Minta Pasang Aplikasi Bantuan",
    description: "Penelepon yang tahu namamu dan pesananmu minta kamu memasang aplikasi bantuan.",
    context: "Untuk memproses refund, silakan pasang aplikasi bantuan jarak jauh dari toko resmi.",
    choices: [
      {
        id: "a",
        label: "Memasang dan mengikuti arahan karena aplikasinya resmi dari toko.",
        isSafe: false,
        feedback: "Aplikasinya sah, tetapi penggunanya yang berbahaya.",
        explanation:
          "Aplikasi remote bisa sah, namun penipu memakainya untuk melihat layar, membaca OTP, dan memindahkan uang dari m-banking milikmu.",
        saferAction: "Jangan pasang atas permintaan penelepon mana pun.",
      },
      {
        id: "b",
        label: "Memasang tetapi tidak membagikan kode sesi; hanya biarkan dia “melihat” layar.",
        isSafe: false,
        feedback: "Melihat layar saja sudah cukup berbahaya.",
        explanation:
          "OTP, saldo, dan isi pesanmu bisa terlihat. Pelaku juga bisa membimbingmu mengklik langkah yang merugikan.",
        saferAction: "Jangan memberi akses layar kepada penelepon.",
      },
      {
        id: "c",
        label:
          "Mengakhiri telepon, tidak memasang apa pun, dan memeriksa refund lewat pusat bantuan di aplikasi marketplace yang kamu buka sendiri.",
        isSafe: true,
        feedback: "Tepat! Kamu memutus kendali penelepon.",
        explanation:
          "CS resmi tidak meminta pelanggan memasang aplikasi kendali jarak jauh untuk urusan refund.",
        saferAction: "Laporkan nomor penelepon ke platform dan beri tahu orang terdekat.",
      },
      {
        id: "d",
        label: "Memasang, tetapi menutup aplikasi m-banking dulu agar aman.",
        isSafe: false,
        feedback: "Menutup aplikasi tidak cukup.",
        explanation:
          "Pelaku masih bisa membaca SMS dan notifikasi, lalu memandumu membukanya lagi dengan alasan lain.",
        saferAction: "Jangan memasang aplikasinya sama sekali.",
      },
    ],
    appDetails: {
      name: "QuickAssist Support",
      description: "Aplikasi bantuan jarak jauh yang memungkinkan orang lain melihat dan mengendalikan layar.",
      developer: "RemoteTools Inc.",
      category: "Alat & Utilitas",
      rating: "4.5",
      downloads: "10.000.000+",
      badge: "Dukungan Jarak Jauh",
      source: "Toko aplikasi resmi (simulasi)",
      sourceType: "official",
      risk: "Tinggi",
      foundVia: "Telepon dari “CS marketplace” yang tahu namamu, nomor pesanan, dan alamat.",
      claim: "Dukungan teknis cepat dengan berbagi layar.",
      reviews: "Ulasan cukup baik untuk penggunaan teknis resmi. Beberapa ulasan memperingatkan penyalahgunaan oleh penipu.",
      permissions: [
        { name: "Perekaman dan berbagi layar", reason: "Mengirim isi layarmu ke orang lain.", suspicious: true },
        { name: "Aksesibilitas", reason: "Memungkinkan kendali jarak jauh.", suspicious: true },
        { name: "Tampil di atas aplikasi lain", reason: "Dapat menutupi layar aplikasi lain.", suspicious: true },
      ],
      details: [
        { label: "Kode sesi", value: "9 digit yang akan diminta penelepon", suspicious: true },
        { label: "Siapa yang meminta", value: "Penelepon yang menghubungimu lebih dulu", suspicious: true },
      ],
      redFlags: [
        "Penelepon yang menghubungimu duluan meminta memasang aplikasi.",
        "Meminta kode sesi dan akses layar penuh.",
        "Dalih refund atau bantuan teknis yang mendesak.",
        "Data pribadimu yang benar dipakai agar tampak meyakinkan.",
      ],
      explanation:
        "Aplikasi remote bisa sah, tetapi dalam modus ini ia menjadi alat untuk menguasai ponsel korban.",
      saferAction: "Akhiri telepon dan hubungi layanan resmi lewat aplikasi atau situs yang kamu buka sendiri.",
      postInstall: [
        "Putus internet, lalu uninstall aplikasi remote.",
        "Hubungi bank segera untuk memblokir kartu dan akses m-banking.",
        "Ganti kata sandi dan PIN dari perangkat lain.",
        "Laporkan kejadian ke bank dan layanan pengaduan resmi.",
      ],
    },
  },

  /* ===== LEVEL 8 ===== */
  {
    id: "apps-8",
    level: 8,
    difficulty: "Sulit",
    topic: "Aplikasi tiruan di toko resmi",
    title: "Aplikasi M-Banking di Urutan Teratas",
    description: "Kamu mencari aplikasi bankmu dan menemukan hasil berlabel “Sponsor” di urutan pertama.",
    context: "Versi baru lebih cepat, bebas biaya transfer. Pasang sekarang.",
    choices: [
      {
        id: "a",
        label: "Memasang karena nama dan logonya sama dengan banknya.",
        isSafe: false,
        feedback: "Nama dan logo mudah ditiru.",
        explanation:
          "Pelaku memakai nama mirip dan ikon yang hampir identik. Perbedaannya sering ada di nama developer.",
        saferAction: "Cocokkan nama developer dengan penerbit resmi bank.",
      },
      {
        id: "b",
        label: "Memasang karena berlabel “Sponsor”, jadi dianggap sudah diverifikasi.",
        isSafe: false,
        feedback: "Iklan berbayar bukan jaminan keamanan.",
        explanation: "Label sponsor hanya berarti ada yang membayar agar tampil di atas.",
        saferAction: "Jangan menilai keamanan dari posisi atau label iklan.",
      },
      {
        id: "c",
        label:
          "Membuka situs resmi bank yang diketik sendiri atau aplikasi bank yang sudah ada, mengikuti tautan unduhan resmi, dan mencocokkan nama developer.",
        isSafe: true,
        feedback: "Tepat! Kamu mulai dari sumber yang kamu pastikan sendiri.",
        explanation:
          "Bank resmi mencantumkan tautan unduhan di situsnya. Aplikasi yang tidak ada di sana patut dicurigai.",
        saferAction: "Laporkan aplikasi tiruan ke toko aplikasi dan ke bank.",
      },
      {
        id: "d",
        label: "Memasang untuk dibandingkan dengan aplikasi lama, tanpa login.",
        isSafe: false,
        feedback: "Memasang saja sudah memberi aplikasi itu kesempatan bekerja.",
        explanation: "Izin SMS dan aksesibilitas bisa dipakai bahkan sebelum kamu login.",
        saferAction: "Jangan memasang aplikasi yang tidak terverifikasi, bahkan sekadar mencoba.",
      },
    ],
    appDetails: {
      name: "Nusantara Mobile+ (Banking)",
      description: "Aplikasi perbankan yang meniru nama dan tampilan layanan bank besar.",
      developer: "NusaMobile Tech Ltd.",
      category: "Keuangan",
      rating: "4.4",
      downloads: "50.000+",
      badge: "Versi Baru, Bebas Biaya",
      source: "Toko aplikasi resmi (simulasi)",
      sourceType: "official",
      risk: "Tinggi",
      foundVia: "Iklan berlabel “Sponsor” di urutan teratas saat mencari “m-banking nusantara”.",
      claim: "Versi baru lebih cepat, bebas biaya transfer.",
      reviews: "Ulasan baru dan seragam. Beberapa pengguna melaporkan saldo berkurang setelah login.",
      permissions: [
        { name: "Akses SMS", reason: "Dapat membaca OTP.", suspicious: true },
        { name: "Aksesibilitas", reason: "Dapat mengendalikan layar.", suspicious: true },
        { name: "Akses kontak", reason: "Tidak diperlukan untuk transaksi dasar.", suspicious: true },
        { name: "Lokasi", reason: "Untuk deteksi cabang terdekat.", suspicious: false },
      ],
      details: [
        { label: "Penerbit resmi bank", value: "PT Bank Nusantara Tbk", suspicious: false },
        { label: "Developer aplikasi ini", value: "NusaMobile Tech Ltd. (bukan penerbit resmi)", suspicious: true },
        { label: "Dirilis", value: "12 hari lalu", suspicious: true },
        { label: "Ada di situs resmi bank?", value: "Tidak ada tautannya", suspicious: true },
      ],
      redFlags: [
        "Developer berbeda dari penerbit resmi bank.",
        "Aplikasi baru dirilis, tetapi mengklaim “versi baru”.",
        "Tidak ditautkan dari situs resmi bank.",
        "Meminta SMS dan aksesibilitas.",
      ],
      explanation:
        "Penipu mendaftarkan aplikasi dengan nama mirip, lalu mengiklankannya agar muncul di atas aplikasi asli.",
      saferAction: "Selalu mulai dari situs resmi bank atau aplikasi yang sudah kamu percaya, bukan dari hasil pencarian.",
      postInstall: [
        "Jangan login. Jika sudah login, hubungi bank untuk memblokir akses.",
        "Uninstall aplikasi dan jalankan pemindaian keamanan.",
        "Ganti PIN dan kata sandi dari perangkat lain.",
        "Laporkan aplikasi tiruan ke toko aplikasi.",
      ],
    },
  },

  /* ===== LEVEL 9 ===== */
  {
    id: "apps-9",
    level: 9,
    difficulty: "Ahli",
    topic: "Aplikasi sah dengan izin sensitif",
    title: "Aplikasi Resmi yang Meminta Banyak Izin",
    description: "Temanmu mengajak memakai aplikasi transportasi online. Kali ini aplikasinya mungkin sah.",
    context: "Pesan ojek, kirim paket, dan bayar dalam satu aplikasi.",
    choices: [
      {
        id: "a",
        label: "Membatalkan karena meminta lokasi, mikrofon, dan kontak; semua izin berarti berbahaya.",
        isSafe: false,
        feedback: "Terlalu waspada juga bukan keputusan yang tepat.",
        explanation:
          "Aplikasi transportasi memang butuh lokasi untuk menjemput dan mikrofon untuk panggilan suara. Yang perlu dipilah adalah izin mana yang sesuai fungsi.",
        saferAction: "Pasang dari toko resmi, lalu pilih izin yang memang diperlukan.",
      },
      {
        id: "b",
        label: "Memasang dan mengizinkan semua izin tanpa membaca.",
        isSafe: false,
        feedback: "Aplikasi yang sah pun tidak perlu semua izin.",
        explanation:
          "Izin kontak bersifat opsional untuk fitur bagikan perjalanan. Memberi semua izin menambah data yang bisa bocor.",
        saferAction: "Izinkan seperlunya dan tolak yang opsional.",
      },
      {
        id: "c",
        label:
          "Memasang dari toko resmi, mengizinkan lokasi hanya saat aplikasi dipakai, menolak kontak karena opsional, dan mengaktifkan PIN akun.",
        isSafe: true,
        feedback: "Tepat! Kamu bisa membedakan izin yang sesuai fungsi.",
        explanation:
          "Developer terverifikasi, riwayat pembaruan rutin, dan kebijakan privasi yang jelas adalah sinyal positif. Izin tetap dibatasi seperlunya.",
        saferAction: "Tinjau ulang izin aplikasi secara berkala di pengaturan perangkat.",
      },
      {
        id: "d",
        label: "Memasang lewat file APK dari temanmu karena katanya lebih ringan.",
        isSafe: false,
        feedback: "Aplikasi yang sah pun berbahaya jika filenya sudah diubah.",
        explanation: "File APK dari orang lain bisa dimodifikasi. Selalu unduh dari toko resmi.",
        saferAction: "Cari aplikasi di toko resmi dan cocokkan nama developer.",
      },
    ],
    appDetails: {
      name: "JalanKu: Ojek & Kurir",
      description: "Aplikasi transportasi online untuk ojek, pengiriman paket, dan pembayaran.",
      developer: "PT Jalanku Teknologi Indonesia",
      category: "Transportasi",
      rating: "4.7",
      downloads: "10.000.000+",
      badge: "Aplikasi Populer",
      source: "Toko aplikasi resmi (simulasi)",
      sourceType: "official",
      risk: "Rendah",
      foundVia: "Temanmu mengajak memakai aplikasi ini. Kamu mencarinya sendiri di toko aplikasi.",
      claim: "Pesan ojek, kirim paket, dan bayar dalam satu aplikasi.",
      reviews: "Ulasan beragam dan wajar, termasuk keluhan soal tarif dan pujian untuk kemudahan penggunaan.",
      permissions: [
        { name: "Lokasi (saat aplikasi dipakai)", reason: "Menentukan titik jemput dan tujuan.", suspicious: false },
        { name: "Mikrofon", reason: "Panggilan suara dengan pengemudi.", suspicious: false },
        { name: "Kamera", reason: "Memindai kode QR pembayaran.", suspicious: false },
        { name: "Akses kontak (opsional)", reason: "Hanya untuk fitur bagikan perjalanan. Boleh ditolak.", suspicious: true },
      ],
      details: [
        { label: "Developer terverifikasi", value: "Ya, tertaut ke situs resmi perusahaan", suspicious: false },
        { label: "Riwayat pembaruan", value: "Rutin selama lebih dari 6 tahun", suspicious: false },
        { label: "Kebijakan privasi", value: "Jelas, merinci penggunaan data lokasi", suspicious: false },
      ],
      redFlags: [
        "Developer jelas dan tertaut ke situs resmi.",
        "Izin utama sesuai fungsi aplikasi.",
        "Izin kontak bersifat opsional dan boleh ditolak.",
        "Riwayat pembaruan dan ulasan tampak wajar.",
      ],
      explanation:
        "Tidak semua izin sensitif berarti bahaya. Yang penting adalah apakah izin sesuai fungsi, dan apakah sumber serta developernya bisa diverifikasi.",
      saferAction: "Pasang dari toko resmi, batasi izin seperlunya, dan aktifkan PIN akun.",
      postInstall: [
        "Tinjau kembali izin di pengaturan dan cabut yang tidak perlu.",
        "Aktifkan PIN atau verifikasi tambahan untuk akun.",
        "Gunakan jalur pembayaran di dalam aplikasi, bukan transfer di luar.",
      ],
    },
  },

  /* ===== LEVEL 10 ===== */
  {
    id: "apps-10",
    level: 10,
    difficulty: "Ahli",
    topic: "Pembaruan aplikasi berbahaya",
    title: "Update dari Aplikasi yang Sudah 2 Tahun Kamu Pakai",
    description: "Aplikasi senter kesayanganmu tiba-tiba meminta pembaruan besar.",
    context: "Pembaruan versi 5.0 tersedia. Perbarui sekarang.",
    choices: [
      {
        id: "a",
        label: "Memperbarui karena aplikasinya sudah lama dan terpercaya.",
        isSafe: false,
        feedback: "Kepercayaan masa lalu tidak otomatis berlaku pada versi baru.",
        explanation:
          "Aplikasi populer bisa dijual ke pemilik baru yang menyisipkan kode berbahaya lewat pembaruan. Ini sulit dikenali karena aplikasinya sudah dipercaya.",
        saferAction: "Periksa siapa pemilik terbaru dan apa yang berubah di versi baru.",
      },
      {
        id: "b",
        label: "Memperbarui, tetapi menolak izin SMS dan aksesibilitas.",
        isSafe: false,
        feedback: "Menolak izin belum cukup jika pemiliknya sudah berganti.",
        explanation:
          "Kode yang disisipkan bisa terus meminta izin atau mengunduh komponen tambahan nanti. Aplikasi senter sederhana juga tidak butuh akses sebesar ini.",
        saferAction: "Lebih aman tidak memperbarui dan mencari alternatif tepercaya.",
      },
      {
        id: "c",
        label:
          "Tidak memperbarui. Hapus aplikasinya (fitur senter dan kompas sudah ada di ponsel), lalu laporkan ke toko aplikasi.",
        isSafe: true,
        feedback: "Tepat! Kamu mengenali pergantian pemilik dan izin yang tidak masuk akal.",
        explanation:
          "Pemilik developer berganti, ulasan terbaru memburuk, dan izin baru tidak sesuai fungsi adalah kombinasi tanda bahaya. Fungsi senter sudah tersedia bawaan.",
        saferAction: "Periksa aplikasi lain yang pengembangnya sama, dan hapus yang tidak benar-benar kamu perlukan.",
      },
      {
        id: "d",
        label: "Membiarkan terpasang dan mengabaikan notifikasi pembaruan.",
        isSafe: false,
        feedback: "Membiarkannya berarti aplikasi masih ada di ponselmu.",
        explanation:
          "Pembaruan otomatis atau notifikasi lain bisa tetap memasang versi baru. Aplikasi dari pemilik baru tetap perlu ditinjau.",
        saferAction: "Hapus jika tidak diperlukan, dan matikan pembaruan otomatis untuk aplikasi ini.",
      },
    ],
    appDetails: {
      name: "Senter & Kompas Praktis v5.0",
      description: "Aplikasi senter dan kompas yang sudah lama kamu pakai, kini menawarkan pembaruan besar.",
      developer: "Praktis Apps Holdings",
      category: "Alat & Utilitas",
      rating: "4.8 (lama), 2.1 (7 hari terakhir)",
      downloads: "5.000.000+",
      badge: "Versi 5.0",
      source: "Toko aplikasi resmi (simulasi)",
      sourceType: "official",
      risk: "Tinggi",
      foundVia: "Notifikasi pembaruan dari aplikasi yang sudah kamu pakai selama 2 tahun.",
      claim: "Versi 5.0: lebih cepat, lebih ringan, dan fitur baru.",
      reviews: "Ulasan lama sangat baik. Ulasan 7 hari terakhir melaporkan iklan layar penuh dan notifikasi aneh.",
      permissions: [
        { name: "Senter/kamera", reason: "Untuk menyalakan senter.", suspicious: false },
        { name: "Akses SMS", reason: "Tidak diperlukan oleh aplikasi senter.", suspicious: true },
        { name: "Aksesibilitas", reason: "Tidak diperlukan oleh aplikasi senter.", suspicious: true },
        { name: "Akses kontak", reason: "Tidak diperlukan oleh aplikasi senter.", suspicious: true },
      ],
      details: [
        { label: "Pemilik developer", value: "Berganti 3 minggu lalu", suspicious: true },
        { label: "Catatan pembaruan", value: "Hanya tertulis “perbaikan bug”", suspicious: true },
        { label: "Izin pada versi lama", value: "Hanya senter dan kamera", suspicious: false },
      ],
      redFlags: [
        "Pemilik developer baru berganti.",
        "Izin baru tidak sesuai fungsi senter.",
        "Rating terbaru turun drastis.",
        "Catatan pembaruan tidak menjelaskan perubahan besar.",
      ],
      explanation:
        "Pembaruan berbahaya memanfaatkan kepercayaan yang sudah lama terbentuk. Perubahan izin dan pemilik adalah petunjuk paling penting.",
      saferAction: "Hapus aplikasi sederhana yang fungsinya sudah ada bawaan, dan laporkan ke toko aplikasi.",
      postInstall: [
        "Cabut izin SMS, kontak, dan aksesibilitas.",
        "Uninstall aplikasi lalu jalankan pemindaian keamanan.",
        "Periksa aplikasi lain yang terpasang bersamaan.",
        "Pantau aktivitas rekening dan akun penting.",
      ],
    },
  },
];