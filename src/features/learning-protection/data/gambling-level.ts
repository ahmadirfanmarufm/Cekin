import type { SimulationScenario } from "@/types/learning-protection/index";

export const gamblingScenarios: SimulationScenario[] = [
  /* ===== LEVEL 1 ===== */
  {
    id: "gambling-1",
    level: 1,
    difficulty: "Mudah",
    topic: "Bonus deposit sebagai umpan",
    title: "Banner Bonus di Situs Nonton Film",
    description: "Pop-up bonus muncul saat kamu membuka situs streaming film.",
    context: "Sebuah banner menawarkan bonus 200% untuk member baru.",
    gamblingDetails: {
      channel: "Banner pop-up di situs streaming film tidak resmi",
      sender: "Iklan pihak ketiga",
      headline: "BONUS NEW MEMBER 200%!",
      body: [
        "Daftar sekarang, deposit mulai Rp10.000 langsung dapat saldo tambahan.",
        "Gacor hari ini, banyak member menang berkali-kali!",
      ],
      cta: "DAFTAR & KLAIM BONUS",
      signals: [
        { label: "Sumber iklan", value: "Pop-up di situs film bajakan", suspicious: true },
        { label: "Legalitas", value: "Judi online dilarang di Indonesia, tidak ada izin resmi", suspicious: true },
        { label: "Syarat bonus", value: "Harus diputar berkali-kali (turnover) sebelum bisa ditarik, ditulis sangat kecil", suspicious: true },
      ],
    },
    choices: [
      {
        id: "a",
        label: "Daftar dan deposit Rp10.000 saja, murah dan cuma coba-coba.",
        isSafe: false,
        feedback: "Deposit kecil tetap pintu masuk.",
        explanation:
          "Nominal kecil dipakai agar terasa tidak berisiko. Setelah punya akun dan saldo, bonus serta syarat turnover mendorongmu menambah deposit.",
        saferAction: "Jangan mendaftar. Tutup banner dan laporkan iklannya.",
      },
      {
        id: "b",
        label: "Klik banner hanya untuk melihat-lihat situsnya.",
        isSafe: false,
        feedback: "Mengklik sudah memberi mereka kesempatan menjangkaumu.",
        explanation:
          "Halaman itu bisa melacak perangkatmu, memunculkan pop-up berikutnya, atau memancing unduhan aplikasi berbahaya.",
        saferAction: "Tutup banner tanpa mengklik apa pun.",
      },
      {
        id: "c",
        label:
          "Menutup banner tanpa mengklik, lalu melaporkan iklannya ke platform atau layanan aduan konten resmi.",
        isSafe: true,
        feedback: "Tepat! Kamu memutus jalur promosinya.",
        explanation:
          "Bonus besar adalah umpan. Keuntungan platform judi datang dari kekalahan pemain, jadi bonus hanya alat untuk menarik deposit.",
        saferAction: "Tinggalkan situs film bajakan karena iklan judi biasanya ikut menyusup di sana.",
      },
      {
        id: "d",
        label: "Ambil bonusnya saja, lalu berniat tidak deposit lagi.",
        isSafe: false,
        feedback: "Bonus biasanya terkunci syarat permainan.",
        explanation:
          "Saldo bonus baru bisa ditarik setelah diputar berkali-kali, sehingga kamu terdorong bermain atau menambah deposit.",
        saferAction: "Jangan mengambil bonus apa pun dari platform judi.",
      },
    ],
  },

  /* ===== LEVEL 2 ===== */
  {
    id: "gambling-2",
    level: 2,
    difficulty: "Mudah",
    topic: "Komentar bot 'slot gacor'",
    title: "Komentar “Slot Gacor” di Postingan Kampus",
    description: "Akun asing meninggalkan komentar pamer kemenangan di postinganmu.",
    context: "Komentar yang sama muncul berulang di banyak postingan.",
    gamblingDetails: {
      channel: "Kolom komentar media sosial",
      sender: "@rina.cuan88",
      headline: "Kak, aku WD 14 juta kemarin! 🔥",
      body: ["Modal 50 ribu jadi 14 juta. Mau tahu caranya? Link ada di bio ya."],
      cta: "Lihat link di bio",
      signals: [
        { label: "Umur akun", value: "Dibuat 3 hari lalu, tanpa foto asli", suspicious: true },
        { label: "Komentar serupa", value: "Ratusan komentar identik dari akun berbeda", suspicious: true },
        { label: "Tautan di bio", value: "Mengarah ke situs judi online", suspicious: true },
      ],
    },
    choices: [
      {
        id: "a",
        label: "Membuka profilnya dan mengklik link di bio karena penasaran.",
        isSafe: false,
        feedback: "Rasa penasaran memang tujuan komentarnya.",
        explanation:
          "Akun bot dibuat untuk memancing klik. Tautannya mengarah ke situs judi yang akan meminta data dan deposit.",
        saferAction: "Jangan buka profil atau tautannya.",
      },
      {
        id: "b",
        label: "Membalas “beneran?” supaya akun itu menjelaskan buktinya.",
        isSafe: false,
        feedback: "Membalas justru memperluas jangkauan komentar itu.",
        explanation:
          "Interaksi membuat algoritma menampilkan komentarnya ke lebih banyak orang, dan bot akan membalas dengan bukti rekayasa.",
        saferAction: "Jangan berinteraksi dengan akun bot.",
      },
      {
        id: "c",
        label: "Tidak berinteraksi, melaporkan komentarnya sebagai spam atau judi online, lalu memblokir akunnya.",
        isSafe: true,
        feedback: "Tepat! Melapor dan memblokir adalah langkah paling bersih.",
        explanation:
          "Pamer kemenangan di komentar adalah taktik social proof: terlihat banyak orang menang, padahal akunnya palsu.",
        saferAction: "Aktifkan filter komentar agar kata-kata judi disembunyikan otomatis.",
      },
      {
        id: "d",
        label: "Mengirim tangkapan layarnya ke grup teman sambil bercanda “ini beneran nggak sih?”",
        isSafe: false,
        feedback: "Candaanmu bisa membuat temanmu penasaran lalu mencoba.",
        explanation:
          "Menyebarkan promosi, bahkan sebagai bahan bercanda, ikut memperluas paparannya ke orang lain.",
        saferAction: "Laporkan, lalu peringatkan temanmu bahwa itu bot judi, bukan bahan candaan.",
      },
    ],
  },

  /* ===== LEVEL 3 ===== */
  {
    id: "gambling-3",
    level: 3,
    difficulty: "Mudah",
    topic: "Teman pamer kemenangan & referral",
    title: "Kakak Tingkat Pamer Kemenangan",
    description: "Seseorang yang kamu kenal mengirim pesan soal kemenangan besar.",
    context: "Ia mengajakmu mendaftar lewat tautan referral miliknya.",
    gamblingDetails: {
      channel: "Pesan langsung (DM)",
      sender: "Dika (kakak tingkat)",
      headline: "Bro, kemarin aku menang 8 juta!",
      body: [
        "Modal 50 ribu jadi 8 juta, ini bukti penarikannya 📸",
        "Daftar lewat link aku ya, nanti kita sama-sama dapat bonus referral. Cuma hari ini!",
      ],
      cta: "Daftar lewat tautan referral",
      signals: [
        { label: "Bukti kemenangan", value: "Tangkapan layar yang mudah diedit", suspicious: true },
        { label: "Keuntungan pengirim", value: "Dapat komisi tiap kamu mendaftar dan deposit", suspicious: true },
        { label: "Tekanan waktu", value: "“Cuma hari ini”", suspicious: true },
        { label: "Keaslian akun", value: "Bisa saja akun Dika sudah diretas", suspicious: true },
      ],
    },
    choices: [
      {
        id: "a",
        label: "Mendaftar lewat tautan karena temanmu terbukti menang.",
        isSafe: false,
        feedback: "Orang yang menang jarang disebut, yang kalah tidak memamerkan.",
        explanation:
          "Kita hanya melihat kemenangan yang dipamerkan (survivorship bias). Referral juga membuat temanmu mendapat komisi dari kekalahanmu.",
        saferAction: "Jangan mendaftar. Tolak dengan sopan.",
      },
      {
        id: "b",
        label: "Meminta rekaman layar penarikan dana sebagai bukti.",
        isSafe: false,
        feedback: "Bukti semacam itu mudah direkayasa.",
        explanation:
          "Rekaman layar bisa diedit atau dibuat dari akun demo. Selain itu, bukti satu kali menang tidak mengubah kenyataan bahwa mayoritas pemain kalah.",
        saferAction: "Jangan menilai dari bukti kemenangan. Fokus pada risikonya.",
      },
      {
        id: "c",
        label:
          "Menolak dan menjelaskan kamu tidak ikut judi. Telepon Dika untuk memastikan akunnya tidak diretas, dan laporkan bila ternyata bukan dia.",
        isSafe: true,
        feedback: "Tepat! Kamu menolak sekaligus memeriksa jalurnya.",
        explanation:
          "Ajakan judi dari orang dekat terasa lebih meyakinkan, padahal pengirimnya bisa terjebak sistem referral atau akunnya diambil alih.",
        saferAction: "Bila Dika memang bermain, ajak bicara baik-baik dan arahkan ke bantuan.",
      },
      {
        id: "d",
        label: "Mendaftar tanpa deposit, hanya supaya Dika mendapat referral.",
        isSafe: false,
        feedback: "Data dan akunmu tetap masuk ke platform judi.",
        explanation:
          "Pendaftaran membuat platform menyimpan kontakmu dan terus mengirim promosi, sambil membuka jalan ke deposit pertama.",
        saferAction: "Jangan mendaftar, sekecil apa pun alasannya.",
      },
    ],
  },

  /* ===== LEVEL 4 ===== */
  {
    id: "gambling-4",
    level: 4,
    difficulty: "Menengah",
    topic: "Promosi terselubung oleh influencer",
    title: "Streamer Favorit Main “Game Hadiah Saldo”",
    description: "Streamer yang kamu ikuti memainkan game yang katanya bisa mencairkan saldo e-wallet.",
    context: "Ia menegaskan bahwa ini “bukan judi, cuma game”.",
    gamblingDetails: {
      channel: "Siaran langsung (livestream)",
      sender: "Streamer favoritmu",
      headline: "Ini game biasa kok, saldo DANA langsung cair!",
      body: [
        "Aku main tiap malam dan terus untung. Pakai kode referral aku di deskripsi biar dapat bonus awal.",
      ],
      cta: "Kode referral di deskripsi",
      signals: [
        { label: "Label iklan", value: "Tidak ada keterangan iklan atau kerja sama", suspicious: true },
        { label: "Mekanisme game", value: "Hasil acak, taruhan memakai uang asli, ada setoran dan penarikan", suspicious: true },
        { label: "Keuntungan streamer", value: "Komisi dari setoran pengikut yang memakai kodenya", suspicious: true },
        { label: "Klaim “bukan judi”", value: "Sebutan tidak mengubah cara kerjanya", suspicious: true },
      ],
    },
    choices: [
      {
        id: "a",
        label: "Percaya karena streamernya kamu kagumi dan ia tampak menang terus.",
        isSafe: false,
        feedback: "Kamu dipengaruhi kedekatan, bukan fakta.",
        explanation:
          "Siaran bisa menampilkan akun demo atau hanya potongan saat menang. Kedekatan dengan figur yang disukai (parasocial) membuat promosi terasa jujur.",
        saferAction: "Nilai mekanismenya, bukan siapa yang mempromosikan.",
      },
      {
        id: "b",
        label: "Mencoba versi gratisnya dulu tanpa deposit, sekadar melihat-lihat.",
        isSafe: false,
        feedback: "Versi gratis dirancang untuk menarikmu ke versi berbayar.",
        explanation:
          "Mode gratis sering dibuat lebih sering menang agar kamu yakin lalu beralih ke uang asli.",
        saferAction: "Jangan memasang atau mencoba game yang punya setoran dan penarikan uang.",
      },
      {
        id: "c",
        label:
          "Mengenali bahwa itu mesin slot berbayar karena hasilnya acak dan melibatkan setoran, tidak memakai kodenya, melaporkan siarannya, dan berhenti mengikuti bila ia terus mempromosikannya.",
        isSafe: true,
        feedback: "Tepat! Kamu menilai cara kerjanya, bukan ucapannya.",
        explanation:
          "Judi ditentukan oleh mekanisme: taruhan uang, hasil acak, dan peluang menang yang lebih kecil dari kalah. Menyebutnya “game” tidak mengubah itu.",
        saferAction: "Ikuti kreator yang transparan soal iklan dan tidak mempromosikan permainan berhadiah uang.",
      },
      {
        id: "d",
        label: "Ikut mencoba, tetapi membatasi hanya main saat akhir pekan.",
        isSafe: false,
        feedback: "Batas waktu tidak mengubah peluang kalahnya.",
        explanation:
          "Judi dirancang agar batas pribadi mudah jebol: kalah sedikit memicu ingin balas, menang sedikit memicu ingin lebih.",
        saferAction: "Cara paling aman adalah tidak memulai sama sekali.",
      },
    ],
  },

  /* ===== LEVEL 5 ===== */
  {
    id: "gambling-5",
    level: 5,
    difficulty: "Menengah",
    topic: "Akun demo, near-miss & 'jam gacor'",
    title: "Akun Demo yang Menang Terus",
    description: "Kamu mencoba mode demo, dan hasilnya terasa luar biasa bagus.",
    context: "Muncul pesan bahwa “jam gacor” sedang berlangsung dan kamu hampir jackpot.",
    gamblingDetails: {
      channel: "Mode demo sebuah platform",
      sender: "Pesan otomatis platform",
      headline: "Jam gacor! Sedikit lagi jackpot!",
      body: [
        "Kamu menang 9 dari 10 putaran demo. Pola 3 kali kalah lalu naikkan taruhan sudah terbukti membuat menang.",
        "Beralih ke akun asli sekarang sebelum jam gacor berakhir.",
      ],
      cta: "Main dengan uang asli",
      signals: [
        { label: "Hasil akun demo", value: "Diatur lebih sering menang daripada akun asli", suspicious: true },
        { label: "“Jam gacor” dan “pola”", value: "Hasil acak, tidak mengenal jam atau pola", suspicious: true },
        { label: "“Sedikit lagi jackpot”", value: "Efek near-miss: hampir menang sengaja sering ditampilkan", suspicious: true },
        { label: "Tekanan beralih", value: "“Sebelum jam gacor berakhir”", suspicious: true },
      ],
    },
    choices: [
      {
        id: "a",
        label: "Beralih ke uang asli karena hasil demo bagus dan sedang jam gacor.",
        isSafe: false,
        feedback: "Hasil demo bukan gambaran peluang sebenarnya.",
        explanation:
          "Demo dirancang untuk membangun rasa percaya diri. Begitu memakai uang asli, peluang menang jauh lebih kecil.",
        saferAction: "Jangan beralih. Tutup halamannya.",
      },
      {
        id: "b",
        label: "Deposit kecil untuk menguji apakah “pola” itu benar.",
        isSafe: false,
        feedback: "Menguji “pola” berarti bertaruh pada sesuatu yang tidak ada.",
        explanation:
          "Setiap putaran independen. Hasil sebelumnya tidak memengaruhi hasil berikutnya, jadi tidak ada pola yang bisa dipelajari.",
        saferAction: "Berhenti. Tidak ada pola yang bisa diuji.",
      },
      {
        id: "c",
        label:
          "Berhenti dan menutup halamannya. Hasil demo bukan peluang asli, “jam gacor” dan “pola” tidak ada, dan “sedikit lagi” hanyalah efek near-miss.",
        isSafe: true,
        feedback: "Tepat! Kamu menembus tiga trik sekaligus.",
        explanation:
          "Near-miss memicu bagian otak yang sama seperti kemenangan, sehingga terasa seperti “hampir berhasil” padahal kalah.",
        saferAction: "Hapus akun demo dan blokir situsnya agar tidak mengirim pesan lagi.",
      },
      {
        id: "d",
        label: "Mencatat hasil putaran dulu, lalu bermain bila “polanya” terlihat.",
        isSafe: false,
        feedback: "Ini mengira masa lalu memengaruhi masa depan.",
        explanation:
          "Ini yang disebut gambler's fallacy. Mencatat hasil hanya memberi rasa kendali palsu yang membuatmu bermain lebih lama.",
        saferAction: "Jangan mencoba membaca pola dari permainan yang hasilnya acak.",
      },
    ],
  },

  /* ===== LEVEL 6 ===== */
  {
    id: "gambling-6",
    level: 6,
    difficulty: "Menengah",
    topic: "Loss chasing & martingale",
    title: "Sudah Kalah Rp500.000, Tinggal Balik Modal",
    description: "Dua jam lalu kamu hanya berniat mencoba. Sekarang saldomu tinggal sedikit.",
    context: "Pikiranmu terus bilang: “Sedikit lagi, tinggal balik modal.”",
    gamblingDetails: {
      channel: "Pikiranmu sendiri dan chat teman",
      sender: "Teman sesama pemain",
      headline: "Gandakan taruhan tiap kalah, pasti balik modal!",
      body: [
        "Namanya martingale: kalah, taruhan dikali dua. Sekali menang, semua balik plus untung.",
        "Jangan berhenti sekarang, nanggung banget!",
      ],
      signals: [
        { label: "Kekalahan dan peluang", value: "Kalah berkali-kali tidak membuat menang makin dekat", suspicious: true },
        { label: "Martingale", value: "Butuh modal tak terbatas dan terhenti oleh batas taruhan", suspicious: true },
        { label: "Keunggulan bandar", value: "Dalam jangka panjang pemain pasti merugi", suspicious: true },
        { label: "Anggaran awal", value: "Sudah lewat dari niat “cuma coba-coba”", suspicious: true },
      ],
    },
    choices: [
      {
        id: "a",
        label: "Gandakan taruhan terus sampai balik modal.",
        isSafe: false,
        feedback: "Kerugian bisa membesar sangat cepat.",
        explanation:
          "Taruhan yang digandakan tiap kalah bisa menghabiskan seluruh saldo hanya dalam beberapa putaran kalah berturut-turut.",
        saferAction: "Hentikan sekarang, jangan menaikkan taruhan.",
      },
      {
        id: "b",
        label: "Deposit Rp200.000 lagi hanya untuk balik modal, setelah itu berhenti.",
        isSafe: false,
        feedback: "“Setelah itu berhenti” hampir selalu tidak terjadi.",
        explanation:
          "Inilah loss chasing: mengejar kerugian dengan uang baru. Tujuan “balik modal” terus bergeser setiap kalah lagi.",
        saferAction: "Terima kerugian yang sudah terjadi dan berhenti.",
      },
      {
        id: "c",
        label:
          "Berhenti sekarang, anggap uang yang hilang sudah hilang, tutup aplikasinya, dan ceritakan ke orang tepercaya.",
        isSafe: true,
        feedback: "Keputusan tersulit, dan yang paling tepat.",
        explanation:
          "Berhenti saat sedang kalah terasa pahit, tetapi itulah satu-satunya cara memutus kerugian. Bercerita membantu mencegah mengulang.",
        saferAction: "Hapus aplikasi dan batasi akses ke platformnya.",
      },
      {
        id: "d",
        label: "Pindah ke permainan lain yang katanya lebih gampang menang.",
        isSafe: false,
        feedback: "Mengganti permainan tidak mengubah keunggulan bandar.",
        explanation:
          "Semua permainan judi dirancang menguntungkan penyelenggara. Pindah permainan hanya memperpanjang waktu bermain.",
        saferAction: "Berhenti dari semua permainan, bukan berganti.",
      },
    ],
  },

  /* ===== LEVEL 7 ===== */
  {
    id: "gambling-7",
    level: 7,
    difficulty: "Sulit",
    topic: "Berutang untuk berjudi",
    title: "Gajian Masih 10 Hari Lagi",
    description: "Kamu kalah Rp2.000.000 dan muncul tawaran pinjaman instan.",
    context: "Notifikasi paylater dan pinjaman online muncul tepat saat kamu kehabisan saldo.",
    gamblingDetails: {
      channel: "Notifikasi aplikasi paylater dan pinjaman",
      sender: "Aplikasi pinjaman",
      headline: "Limit naik! Cair Rp3.000.000 dalam 5 menit",
      body: [
        "Butuh dana cepat? Ambil sekarang, bayar nanti.",
        "Cicilan ringan, tanpa jaminan.",
      ],
      cta: "Ajukan sekarang",
      signals: [
        { label: "Waktu tawaran", value: "Muncul tepat saat kamu kehabisan uang", suspicious: true },
        { label: "Bunga dan denda", value: "Berlipat bila telat bayar", suspicious: true },
        { label: "Tujuan pinjaman", value: "Untuk balik modal judi, bukan kebutuhan", suspicious: true },
        { label: "Pinjol ilegal", value: "Bisa meneror kontak dan menyebar data pribadi", suspicious: true },
      ],
    },
    choices: [
      {
        id: "a",
        label: "Memakai limit paylater untuk balik modal, nanti dibayar dari kemenangan.",
        isSafe: false,
        feedback: "Kamu menjadikan kemenangan yang belum tentu terjadi sebagai sumber pembayaran.",
        explanation:
          "Berutang untuk berjudi membuat kerugian berlipat: uang hilang ditambah bunga. Pola gali lubang tutup lubang berawal dari sini.",
        saferAction: "Jangan berutang untuk berjudi.",
      },
      {
        id: "b",
        label: "Meminjam ke teman dengan alasan membayar kos, lalu dipakai bermain.",
        isSafe: false,
        feedback: "Kamu merusak kepercayaan dan memperbesar masalah.",
        explanation:
          "Berbohong untuk mendapat uang adalah tanda pola judi yang makin dalam, dan hubunganmu dengan orang terdekat ikut rusak.",
        saferAction: "Jujur kepada orang tepercaya soal situasimu.",
      },
      {
        id: "c",
        label:
          "Tidak berutang. Hentikan permainan, susun rencana menutup kekalahan dari penghasilanmu sendiri, dan bicara dengan orang tepercaya atau layanan konsultasi bila terasa sulit.",
        isSafe: true,
        feedback: "Tepat! Kamu menghentikan lingkaran utangnya.",
        explanation:
          "Kekalahan yang ditutup dengan utang baru hampir selalu membesar. Menerima kerugian dan menyusun rencana membayar jauh lebih aman.",
        saferAction: "Jika sudah punya utang, hubungi layanan keuangan resmi atau konselor soal cara menyelesaikannya.",
      },
      {
        id: "d",
        label: "Menjual barang berharga demi modal main lagi.",
        isSafe: false,
        feedback: "Kamu mengorbankan hal yang berharga demi mengejar kerugian.",
        explanation:
          "Menjual barang untuk modal berjudi adalah tanda kehilangan kendali. Peluang menangnya tetap tidak berubah.",
        saferAction: "Jangan menjual apa pun untuk berjudi.",
      },
    ],
  },

  /* ===== LEVEL 8 ===== */
  {
    id: "gambling-8",
    level: 8,
    difficulty: "Sulit",
    topic: "Sewa rekening untuk judi online",
    title: "Tawaran Sewa Rekening Rp1.500.000 per Bulan",
    description: "Pesan dari akun asing menawarkan uang karena rekeningmu jarang dipakai.",
    context: "Kamu butuh uang tambahan, dan tawarannya terdengar mudah.",
    gamblingDetails: {
      channel: "Chat Telegram dari akun asing",
      sender: "Admin “Mitra Usaha”",
      headline: "Sewa rekening nganggur, Rp1.500.000 per bulan!",
      body: [
        "Rekening dipakai untuk transaksi usaha kami, aman dan legal. Cukup serahkan kartu ATM, PIN, dan akses m-banking.",
        "Tidak perlu ngapa-ngapain, tinggal terima uang tiap bulan.",
      ],
      cta: "Hubungi admin",
      signals: [
        { label: "Penggunaan rekening", value: "Menampung uang hasil judi online atau penipuan", suspicious: true },
        { label: "Tanggung jawab hukum", value: "Pemilik rekening bisa diperiksa dan rekeningnya dibekukan", suspicious: true },
        { label: "Penyerahan PIN dan m-banking", value: "Sama dengan menyerahkan seluruh uangmu", suspicious: true },
        { label: "Kata “legal dan aman”", value: "Klaim tanpa bukti", suspicious: true },
      ],
    },
    choices: [
      {
        id: "a",
        label: "Menyerahkan rekening yang jarang dipakai dengan saldo kecil.",
        isSafe: false,
        feedback: "Saldo kecil tidak mengurangi tanggung jawabmu.",
        explanation:
          "Rekening atas namamu dipakai menampung dana judi. Kamu bisa diperiksa aparat dan rekeningmu diblokir, meski kamu tidak ikut berjudi.",
        saferAction: "Jangan menyerahkan rekening kepada siapa pun.",
      },
      {
        id: "b",
        label: "Membuka rekening baru khusus untuk disewakan agar rekening utama aman.",
        isSafe: false,
        feedback: "Rekening baru atas namamu tetap menjadi tanggung jawabmu.",
        explanation:
          "Identitasmu tetap tercatat sebagai pemilik, jadi tanggung jawab hukum dan risiko pembekuan tidak berpindah.",
        saferAction: "Jangan membuka atau menyewakan rekening untuk pihak lain.",
      },
      {
        id: "c",
        label:
          "Menolak, memblokir dan melaporkan akun penawarnya. Bila pernah menyerahkan rekening, segera hubungi bank untuk memblokir akses.",
        isSafe: true,
        feedback: "Tepat! Kamu menghindari jebakan hukum yang serius.",
        explanation:
          "Menyewakan rekening membuatmu menjadi bagian dari rantai pencucian uang judi. Uang mudah ini bisa berujung masalah pidana.",
        saferAction: "Cari tambahan penghasilan dari pekerjaan yang jelas dan bisa diverifikasi.",
      },
      {
        id: "d",
        label: "Meminta perjanjian tertulis dan jaminan hukum sebelum menyerahkan rekening.",
        isSafe: false,
        feedback: "Dokumen dari pihak yang tidak jelas tidak melindungimu.",
        explanation:
          "Perjanjian dengan pihak anonim tidak punya kekuatan, dan tidak membebaskanmu dari tanggung jawab sebagai pemilik rekening.",
        saferAction: "Tolak. Tidak ada jaminan yang membuat penyewaan rekening aman.",
      },
    ],
  },

  /* ===== LEVEL 9 ===== */
  {
    id: "gambling-9",
    level: 9,
    difficulty: "Ahli",
    topic: "Membantu teman yang kecanduan",
    title: "Sahabatmu Meminjam Uang (Lagi)",
    description: "Rafi meminjam uang dengan alasan yang terasa janggal, dan kamu tahu ia belakangan sering bermain judi online.",
    context: "Ini bukan lagi soal kamu, tetapi tentang cara membantu orang yang kamu sayangi.",
    gamblingDetails: {
      channel: "Chat pribadi",
      sender: "Rafi (sahabatmu)",
      headline: "Bro, boleh pinjam Rp1.500.000? Buat bayar kos.",
      body: [
        "Besok kuganti, janji. Jangan bilang siapa-siapa ya.",
        "Soalnya aku sudah pinjam ke beberapa orang lain.",
      ],
      signals: [
        { label: "Pola pinjaman", value: "Sudah meminjam ke banyak orang dalam waktu dekat", suspicious: true },
        { label: "Permintaan merahasiakan", value: "“Jangan bilang siapa-siapa”", suspicious: true },
        { label: "Perubahan perilaku", value: "Sering membahas “menang besar”, tampak cemas dan tertutup", suspicious: true },
        { label: "Tanda kecanduan", value: "Sulit berhenti bukan tanda lemah, tetapi tanda butuh dukungan", suspicious: false },
      ],
    },
    choices: [
      {
        id: "a",
        label: "Meminjamkan uangnya karena kasihan dan ia sahabatmu.",
        isSafe: false,
        feedback: "Niatmu baik, tetapi uangmu bisa ikut dipakai berjudi.",
        explanation:
          "Memberi uang tunai pada orang yang sedang kecanduan biasanya memperpanjang masalahnya, dan hubungan kalian pun bisa rusak bila tidak kembali.",
        saferAction: "Bantu dengan cara lain, bukan uang tunai.",
      },
      {
        id: "b",
        label: "Menolak dan menegurnya keras di depan teman-teman agar malu dan sadar.",
        isSafe: false,
        feedback: "Mempermalukan jarang membuat orang berhenti.",
        explanation:
          "Rasa malu justru membuat orang menyembunyikan masalahnya dan makin menjauh dari bantuan.",
        saferAction: "Bicara empat mata, dengan empati dan tanpa menghakimi.",
      },
      {
        id: "c",
        label:
          "Bicara empat mata dengan empati: mengatakan kamu khawatir, tidak memberi uang tunai, menawarkan menemaninya mencari bantuan profesional atau konselor, dan melibatkan keluarga bila ia setuju.",
        isSafe: true,
        feedback: "Tepat! Kamu menjaga persahabatan sambil menolak memberi uang.",
        explanation:
          "Kecanduan judi diakui sebagai masalah kesehatan jiwa. Dukungan tanpa menghakimi dan akses ke bantuan profesional jauh lebih efektif daripada uang atau amarah.",
        saferAction: "Jaga dirimu juga: tetapkan batas yang jelas dan jangan menutupi kebohongannya.",
      },
      {
        id: "d",
        label: "Pura-pura tidak membaca pesannya agar tidak canggung.",
        isSafe: false,
        feedback: "Menghindar membuat Rafi makin sendirian.",
        explanation:
          "Orang yang terjerat judi sering semakin terisolasi. Diam darimu bisa berarti satu lagi pintu bantuan yang tertutup.",
        saferAction: "Tanggapi dengan jujur dan peduli, meski terasa tidak nyaman.",
      },
    ],
  },

  /* ===== LEVEL 10 ===== */
  {
    id: "gambling-10",
    level: 10,
    difficulty: "Ahli",
    topic: "Dorongan kambuh",
    title: "Notifikasi “Kami Rindu Kamu” di Hari Gajian",
    description: "Sudah 3 bulan kamu berhenti. Hari ini gajian, dan sebuah notifikasi dari platform lama masuk.",
    context: "Dorongan untuk “main sekali saja” terasa sangat kuat.",
    gamblingDetails: {
      channel: "Notifikasi dari platform yang pernah kamu pakai",
      sender: "Platform judi lama",
      headline: "Kami rindu kamu! Free spin 50x + bonus comeback 300%",
      body: [
        "Akunmu masih aktif. Klaim hadiah kembalimu sebelum tengah malam.",
        "Banyak member lama sudah kembali dan menang!",
      ],
      cta: "Klaim hadiah kembali",
      signals: [
        { label: "Data kamu", value: "Platform masih menyimpan kontakmu dan terus menargetkan ulang", suspicious: true },
        { label: "Bonus comeback", value: "Terkunci syarat turnover seperti bonus lain", suspicious: true },
        { label: "Waktu pengiriman", value: "Tepat di hari gajian", suspicious: true },
        { label: "Dorongan", value: "Dorongan kuat biasanya naik lalu mereda bila tidak dituruti", suspicious: false },
      ],
    },
    choices: [
      {
        id: "a",
        label: "Klaim free spin saja, tanpa deposit, sekadar nostalgia.",
        isSafe: false,
        feedback: "Satu kali “nostalgia” sering menjadi awal kambuh.",
        explanation:
          "Free spin dirancang agar kamu merasakan menang kecil lalu tergoda deposit. Bagi mantan pemain, satu kali main saja bisa memicu kembali.",
        saferAction: "Jangan klaim apa pun. Hapus notifikasinya.",
      },
      {
        id: "b",
        label: "Main sekali dengan nominal kecil sebagai hadiah karena sudah 3 bulan bertahan.",
        isSafe: false,
        feedback: "Hadiah untuk keberhasilanmu tidak seharusnya berupa pemicu.",
        explanation:
          "Menghadiahi diri dengan judi menghubungkan kembali kemenangan dan permainan. Itu pola yang sering mendahului kambuh.",
        saferAction: "Rayakan dengan hal lain: makan enak, jalan-jalan, atau menabung.",
      },
      {
        id: "c",
        label:
          "Tidak membuka notifikasinya. Hubungi orang tepercaya atau konselor saat dorongan datang, hapus akun dan blokir situsnya, matikan notifikasi, lalu sisihkan sebagian gaji ke tabungan hari itu juga.",
        isSafe: true,
        feedback: "Level tertinggi, dan kamu melewatinya dengan benar!",
        explanation:
          "Kambuh paling sering terjadi saat ada uang, dorongan, dan pemicu bersamaan. Menjauhkan pemicu, menyalurkan uang lebih dulu, dan tidak sendirian memperbesar peluangmu bertahan.",
        saferAction: "Bila dorongan sering datang, cari dukungan profesional kesehatan jiwa. Kambuh bukan kegagalan permanen.",
      },
      {
        id: "d",
        label: "Mengandalkan tekad sendiri sepenuhnya dan memendam perasaan itu tanpa memberi tahu siapa pun.",
        isSafe: false,
        feedback: "Bertahan sendirian dan diam justru melemahkan.",
        explanation:
          "Kecanduan jarang bisa dilawan hanya dengan tekad. Berbagi dengan orang lain menjaga kamu tetap bertanggung jawab dan terdukung.",
        saferAction: "Ceritakan ke seseorang yang kamu percaya, hari ini.",
      },
    ],
  },
];