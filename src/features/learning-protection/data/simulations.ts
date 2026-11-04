import type {
  SimulationConfig,
  SimulationId,
} from "@/types/learning-protection/index";

export const simulations: SimulationConfig[] = [
  {
    id: "trust",
    title: "Trust Lab",
    subtitle: "Experience the Trap",
    description:
      "Hadapi lowongan kerja, top-up, dan investasi palsu.",
    difficulty: "Pemula",
    duration: "4 menit",
    icon: "message-circle",
    color: "emerald",
    scenarios: [
      {
        id: "trust-1",
        title: "Lowongan Kerja Online",
        description: "Seseorang menghubungimu melalui WhatsApp.",
        context:
          "Halo! Selamat kamu terpilih menjadi kandidat pekerjaan remote kami. Gaji Rp500.000–Rp1.000.000 per hari. Untuk mengaktifkan akun pekerja, kamu hanya perlu membayar biaya administrasi Rp75.000. Apakah kamu bersedia?",
        choices: [
          {
            id: "a",
            label: "Membayar biaya administrasi agar bisa mulai bekerja.",
            isSafe: false,
            feedback:
              "Hati-hati! Ini merupakan salah satu pola penipuan lowongan kerja.",
            explanation:
              "Pelaku menggunakan iming-iming gaji tinggi dan proses rekrutmen mudah untuk meminta uang dari korban.",
            saferAction:
              "Periksa perusahaan melalui situs dan kanal resminya. Jangan membayar biaya untuk mendapatkan pekerjaan tanpa verifikasi yang jelas.",
          },
          {
            id: "b",
            label: "Memeriksa identitas perusahaan dan lowongan.",
            isSafe: true,
            feedback:
              "Keputusan bagus! Kamu tidak langsung mempercayai tawaran tersebut.",
            explanation:
              "Verifikasi perusahaan merupakan langkah penting sebelum memberikan informasi atau melakukan pembayaran.",
            saferAction:
              "Cari informasi perusahaan melalui situs resmi dan hubungi kontak yang tercantum di kanal resmi.",
          },
          {
            id: "c",
            label: "Mengirimkan data pribadi terlebih dahulu.",
            isSafe: false,
            feedback:
              "Jangan terburu-buru memberikan data pribadi.",
            explanation:
              "Data seperti KTP, nomor rekening, dan informasi pribadi dapat disalahgunakan untuk penipuan.",
            saferAction:
              "Pastikan perusahaan dan proses rekrutmennya benar-benar valid sebelum memberikan data.",
          },
        ],
      },
      {
        id: "trust-2",
        title: "Permintaan Top-up",
        description: "Kamu menerima pesan dari seseorang yang mengaku admin.",
        context:
          "Akun kamu mendapatkan bonus Rp2.000.000! Silakan lakukan top-up Rp100.000 untuk mengaktifkan bonus. Bonus akan hangus dalam 10 menit jika tidak segera diklaim.",
        choices: [
          {
            id: "a",
            label: "Segera melakukan top-up sebelum bonus hangus.",
            isSafe: false,
            feedback: "Waspada! Kamu sedang didesak untuk mengambil keputusan.",
            explanation:
              "Batas waktu singkat dan iming-iming bonus merupakan teknik tekanan psikologis yang sering digunakan penipu.",
            saferAction:
              "Jangan melakukan pembayaran. Periksa informasi bonus melalui aplikasi atau layanan resmi.",
          },
          {
            id: "b",
            label: "Memeriksa informasi bonus melalui aplikasi resmi.",
            isSafe: true,
            feedback: "Tepat! Kamu melakukan verifikasi terlebih dahulu.",
            explanation:
              "Informasi promosi seharusnya dapat diperiksa melalui kanal resmi penyedia layanan.",
            saferAction:
              "Abaikan pesan mencurigakan dan hubungi layanan pelanggan resmi jika diperlukan.",
          },
        ],
      },
      {
        id: "trust-3",
        title: "Investasi dengan Keuntungan Pasti",
        description: "Seorang kenalan menawarkan investasi.",
        context:
          "Investasi ini dijamin menghasilkan keuntungan 30% setiap minggu. Tidak ada risiko kerugian. Kamu cukup transfer modal awal Rp500.000 dan uang akan berkembang otomatis.",
        choices: [
          {
            id: "a",
            label: "Ikut investasi karena keuntungan terlihat besar.",
            isSafe: false,
            feedback: "Jangan mudah tergiur keuntungan yang tidak masuk akal.",
            explanation:
              "Janji keuntungan tinggi dan pasti tanpa risiko merupakan tanda bahaya investasi.",
            saferAction:
              "Periksa legalitas penyedia investasi melalui sumber resmi dan pahami risikonya.",
          },
          {
            id: "b",
            label: "Memeriksa legalitas dan model bisnis investasi.",
            isSafe: true,
            feedback: "Bagus! Kamu tidak hanya melihat potensi keuntungan.",
            explanation:
              "Legalitas, transparansi, dan risiko harus diperiksa sebelum mengambil keputusan investasi.",
            saferAction:
              "Jangan mentransfer uang sebelum seluruh informasi dapat diverifikasi.",
          },
        ],
      },
    ],
  },

  {
    id: "apps",
    title: "Apps Scam",
    subtitle: "Is This App Safe?",
    description:
      "Periksa aplikasi, sumber unduhan, dan izin yang diminta.",
    difficulty: "Menengah",
    duration: "3 menit",
    icon: "gamepad-2",
    color: "blue",
    scenarios: [
      {
        id: "apps-1",
        title: "Battle Arena MOD",
        description:
          "Game MOD yang menawarkan skin premium dan unlimited coins secara gratis.",
        context:
          "Nikmati semua skin premium dan unlimited coins secara gratis. Download APK MOD sekarang!",
        choices: [],
        appDetails: {
          name: "Battle Arena MOD",
          description: "Game MOD yang menawarkan skin premium dan unlimited coins secara gratis.",
          developer: "Unknown Studio",
          category: "Game Action",
          rating: "4.9",
          downloads: "10.000+",
          badge: "Unlimited Coins & Skin",
          source: "Website pihak ketiga",
          sourceType: "unofficial",
          risk: "Kritis",
          claim:
            "Nikmati semua skin premium dan unlimited coins secara gratis. Download APK MOD sekarang!",
          reviews:
            "Beberapa ulasan menyebutkan aplikasi meminta izin yang tidak relevan dan menampilkan iklan secara berlebihan.",
          permissions: [
            {
              name: "Akses SMS",
              reason: "Dapat membaca pesan masuk pada perangkat.",
              suspicious: true,
            },
            {
              name: "Akses kontak",
              reason: "Dapat membaca daftar kontak pengguna.",
              suspicious: true,
            },
            {
              name: "Akses notifikasi",
              reason: "Dapat melihat konten notifikasi yang masuk.",
              suspicious: true,
            },
            {
              name: "Akses penyimpanan",
              reason: "Dapat membaca atau mengelola file tertentu.",
              suspicious: true,
            },
          ],
          redFlags: [
            "APK dibagikan melalui website pihak ketiga.",
            "Menawarkan fitur premium yang tidak resmi.",
            "Meminta izin SMS dan kontak yang tidak relevan dengan game.",
            "Identitas developer tidak dapat diverifikasi.",
          ],
          explanation:
            "Aplikasi MOD dari sumber tidak resmi dapat dimodifikasi dan disisipi kode berbahaya. Izin SMS, kontak, dan notifikasi juga berpotensi membuka akses ke informasi pribadi.",
          saferAction:
            "Jangan instal APK tersebut. Cari game melalui toko aplikasi resmi dan periksa nama developer serta identitas penerbitnya.",
          postInstall: [
            "Jangan buka aplikasi atau berikan izin tambahan.",
            "Hapus instalasi aplikasi melalui pengaturan perangkat.",
            "Jalankan pemindaian menggunakan Google Play Protect atau fitur keamanan bawaan perangkat.",
            "Jika pernah memasukkan password atau data akun, ubah dari perangkat lain yang tepercaya.",
          ],
        },
      },
      {
        id: "apps-2",
        title: "Super Phone Cleaner",
        description:
          "Aplikasi utilitas yang mengklaim dapat mempercepat dan membersihkan perangkat.",
        context:
          "Bersihkan seluruh virus, percepat ponsel 10x lipat, dan optimalkan baterai hanya dengan satu sentuhan.",
        choices: [],
        appDetails: {
          name: "Super Phone Cleaner",
          description: "Aplikasi utilitas yang mengklaim dapat mempercepat dan membersihkan perangkat.",
          developer: "Fast Utility Team",
          category: "Tools & Utility",
          rating: "4.7",
          downloads: "50.000+",
          badge: "Ponsel 10x Lebih Cepat",
          source: "Toko aplikasi resmi (simulasi)",
          sourceType: "official",
          risk: "Tinggi",
          claim:
            "Bersihkan seluruh virus, percepat ponsel 10x lipat, dan optimalkan baterai hanya dengan satu sentuhan.",
          reviews:
            "Ulasan pengguna tidak konsisten. Beberapa mengeluhkan iklan yang terus muncul dan notifikasi yang mengganggu.",
          permissions: [
            {
              name: "Akses notifikasi",
              reason: "Dapat membaca konten notifikasi perangkat.",
              suspicious: true,
            },
            {
              name: "Tampil di atas aplikasi lain",
              reason: "Dapat menampilkan jendela di atas aplikasi lain.",
              suspicious: true,
            },
            {
              name: "Akses penyimpanan",
              reason: "Dapat mengelola file tertentu pada perangkat.",
              suspicious: false,
            },
          ],
          redFlags: [
            "Mengklaim mampu membersihkan semua virus secara instan.",
            "Menjanjikan peningkatan performa yang tidak realistis.",
            "Meminta akses notifikasi dan tampil di atas aplikasi lain.",
            "Ulasan pengguna menunjukkan perilaku aplikasi yang mengganggu.",
          ],
          explanation:
            "Toko aplikasi resmi tidak otomatis menjamin setiap aplikasi aman. Klaim yang berlebihan dan permintaan izin yang tidak sesuai fungsi tetap perlu diperiksa.",
          saferAction:
            "Periksa identitas developer, kebijakan privasi, ulasan terbaru, dan alasan setiap izin diminta. Jangan instal jika informasinya tidak meyakinkan.",
          postInstall: [
            "Periksa dan cabut izin yang tidak diperlukan.",
            "Hapus aplikasi jika menunjukkan iklan atau perilaku mencurigakan.",
            "Jalankan pemindaian keamanan perangkat.",
            "Pantau apakah muncul aplikasi lain atau aktivitas yang tidak kamu kenali.",
          ],
        },
      },
      {
        id: "apps-3",
        title: "Daily Notes",
        description:
          "Aplikasi pencatat sederhana untuk menulis dan mengatur catatan harian.",
        context:
          "Simpan ide, buat daftar kegiatan, dan atur catatan harianmu dengan mudah menggunakan Daily Notes.",
        choices: [],
        appDetails: {
          name: "Daily Notes",
          description:
            "Aplikasi pencatat sederhana yang membantu pengguna menyimpan ide, membuat daftar kegiatan, dan mengatur catatan harian.",
          developer: "Simple Productivity Studio",
          category: "Productivity",
          rating: "4.6",
          downloads: "100.000+",
          badge: "Simple Notes & Daily Planner",
          source: "Toko aplikasi resmi (simulasi)",
          sourceType: "official",
          risk: "Rendah",
          claim:
            "Catat ide, atur kegiatan, dan simpan daftar harianmu dalam satu aplikasi sederhana.",
          reviews:
            "Sebagian besar ulasan memberikan tanggapan positif. Pengguna menyukai antarmuka sederhana dan fungsi pencatatan yang mudah digunakan.",
          permissions: [
            {
              name: "Akses penyimpanan",
              reason:
                "Digunakan untuk menyimpan dan membuka file catatan yang diekspor.",
              suspicious: false,
            },
            {
              name: "Akses notifikasi",
              reason:
                "Digunakan untuk mengirim pengingat catatan yang dijadwalkan.",
              suspicious: false,
            },
          ],
          redFlags: [
            "Tidak ditemukan permintaan izin yang tidak relevan dengan fungsi utama.",
            "Identitas developer dan informasi aplikasi tersedia.",
            "Aplikasi tersedia melalui toko aplikasi resmi dalam simulasi.",
          ],
          explanation:
            "Daily Notes memiliki fungsi yang sesuai dengan izin yang diminta. Akses penyimpanan dapat digunakan untuk mengelola file catatan, sedangkan notifikasi dapat digunakan untuk pengingat. Namun, sumber, developer, ulasan, dan kebijakan privasi tetap perlu diperiksa.",
          saferAction:
            "Aplikasi ini dapat dipertimbangkan untuk dipasang setelah kamu memastikan identitas developer, membaca kebijakan privasi, dan memeriksa izin yang diminta.",
          postInstall: [
            "Periksa kembali izin aplikasi melalui pengaturan perangkat.",
            "Pastikan aplikasi hanya digunakan sesuai fungsi yang dijelaskan.",
            "Perbarui aplikasi melalui toko aplikasi resmi.",
          ],
        },
      },
    ],
  },

  {
    id: "phishing",
    title: "Phishing Attack",
    subtitle: "Spot the Fake",
    description:
      "Selidiki email palsu sebelum tautan menjebakmu.",
    difficulty: "Menengah",
    duration: "4 menit",
    icon: "mail",
    color: "violet",
    scenarios: [
      {
        id: "phishing-1",
        title: "Email Verifikasi Akun",
        description: "Kamu menerima email yang mengatasnamakan layanan digital.",
        context:
          "Subject: Akun Anda Akan Dinonaktifkan!\n\nKami mendeteksi aktivitas mencurigakan. Segera verifikasi akun melalui tautan berikut dalam waktu 30 menit atau akun Anda akan diblokir.\n\nLink: http://secure-account-verification.example",
        choices: [
          {
            id: "a",
            label: "Membuka tautan dan memasukkan informasi akun.",
            isSafe: false,
            feedback: "Waspada! Kamu hampir masuk ke perangkap phishing.",
            explanation:
              "Pelaku menciptakan rasa panik dan menggunakan tautan palsu untuk mencuri informasi akun.",
            saferAction:
              "Jangan membuka tautan. Periksa akun melalui aplikasi atau situs resmi yang kamu akses sendiri.",
          },
          {
            id: "b",
            label: "Memeriksa alamat pengirim dan alamat tautan.",
            isSafe: true,
            feedback: "Bagus! Kamu memeriksa tanda-tanda phishing.",
            explanation:
              "Alamat pengirim dan domain yang tidak sesuai merupakan indikator penting untuk diperiksa.",
            saferAction:
              "Laporkan email mencurigakan dan gunakan kanal resmi untuk memeriksa status akun.",
          },
          {
            id: "c",
            label: "Membalas email untuk menanyakan kebenarannya.",
            isSafe: false,
            feedback: "Sebaiknya jangan membalas email mencurigakan.",
            explanation:
              "Membalas dapat mengonfirmasi bahwa alamat email kamu aktif dan dapat memancing interaksi lebih lanjut.",
            saferAction:
              "Hubungi penyedia layanan melalui kontak resmi, bukan melalui email tersebut.",
          },
        ],
      },
      {
        id: "phishing-2",
        title: "Hadiah Tidak Terduga",
        description: "Kamu mendapatkan email pemberitahuan hadiah.",
        context:
          "SELAMAT! Email kamu memenangkan hadiah smartphone terbaru. Klik tombol CLAIM NOW dan isi data diri untuk pengiriman hadiah.",
        choices: [
          {
            id: "a",
            label: "Mengisi formulir untuk mengklaim hadiah.",
            isSafe: false,
            feedback: "Jangan terburu-buru mengklaim hadiah yang tidak pernah diikuti.",
            explanation:
              "Hadiah palsu sering digunakan untuk mengumpulkan informasi pribadi korban.",
            saferAction:
              "Periksa apakah program hadiah benar-benar diselenggarakan oleh pihak resmi.",
          },
          {
            id: "b",
            label: "Memverifikasi pengumuman melalui situs resmi.",
            isSafe: true,
            feedback: "Tepat! Kamu memverifikasi sumber informasi.",
            explanation:
              "Pengumuman resmi dapat diperiksa tanpa perlu mengikuti tautan dari email yang mencurigakan.",
            saferAction:
              "Jangan mengisi formulir atau memberikan data sebelum memastikan keabsahan hadiah.",
          },
        ],
      },
    ],
  },

  {
    id: "calls",
    title: "Scam Call",
    subtitle: "Don't Trust the Caller",
    description:
      "Terima telepon fiksi dan pilih responsmu.",
    difficulty: "Menengah",
    duration: "3 menit",
    icon: "phone",
    color: "orange",
    scenarios: [
      {
        id: "calls-1",
        title: "Telepon Mengaku Bank",
        description: "Seseorang mengaku sebagai petugas bank.",
        context:
          "Selamat siang. Saya petugas keamanan bank. Kami mendeteksi transaksi mencurigakan pada rekening Anda. Untuk membatalkannya, mohon sebutkan kode OTP yang baru saja dikirimkan.",
        choices: [
          {
            id: "a",
            label: "Memberikan kode OTP agar transaksi dibatalkan.",
            isSafe: false,
            feedback: "Jangan pernah membagikan kode OTP kepada siapa pun.",
            explanation:
              "OTP merupakan kode autentikasi rahasia yang dapat digunakan untuk mengakses atau mengonfirmasi transaksi.",
            saferAction:
              "Akhiri panggilan dan hubungi nomor resmi bank yang tertera pada kartu atau situs resminya.",
          },
          {
            id: "b",
            label: "Menolak memberikan OTP dan mengakhiri panggilan.",
            isSafe: true,
            feedback: "Bagus! Kamu melindungi informasi autentikasi.",
            explanation:
              "Petugas resmi tidak seharusnya meminta OTP, PIN, atau kata sandi melalui telepon.",
            saferAction:
              "Hubungi bank melalui nomor resmi untuk memeriksa transaksi mencurigakan.",
          },
          {
            id: "c",
            label: "Meminta penelepon mengirimkan tautan verifikasi.",
            isSafe: false,
            feedback: "Jangan mengikuti tautan dari penelepon yang belum terverifikasi.",
            explanation:
              "Tautan dapat mengarah ke situs palsu yang dirancang untuk mencuri kredensial.",
            saferAction:
              "Gunakan aplikasi atau situs resmi bank yang kamu akses secara mandiri.",
          },
        ],
      },
      {
        id: "calls-2",
        title: "Mengaku dari Instansi Pemerintah",
        description: "Penelepon mengklaim ada masalah administrasi.",
        context:
          "Kami dari pihak instansi pemerintah. Anda memiliki tunggakan administrasi. Jika tidak membayar sekarang, identitas Anda akan diblokir. Silakan transfer ke rekening berikut.",
        choices: [
          {
            id: "a",
            label: "Langsung mentransfer uang karena takut diblokir.",
            isSafe: false,
            feedback: "Jangan mengambil keputusan karena ancaman melalui telepon.",
            explanation:
              "Ancaman dan tekanan waktu dapat digunakan untuk memaksa korban melakukan pembayaran.",
            saferAction:
              "Verifikasi informasi melalui situs dan kontak resmi instansi terkait.",
          },
          {
            id: "b",
            label: "Mengakhiri panggilan dan memeriksa informasi resmi.",
            isSafe: true,
            feedback: "Keputusan tepat! Kamu tidak mengikuti tekanan pelaku.",
            explanation:
              "Informasi administratif perlu diperiksa melalui kanal resmi, bukan nomor yang tidak dikenal.",
            saferAction:
              "Jangan mentransfer uang ke rekening pribadi atau rekening yang belum diverifikasi.",
          },
        ],
      },
    ],
  },

  {
    id: "gambling",
    title: "Online Gambling Awareness",
    subtitle: "Don't Get Trapped",
    description:
      "Kenali promosi, near-miss, dan loss chasing.",
    difficulty: "Penting",
    duration: "5 menit",
    icon: "dice-5",
    color: "red",
    scenarios: [
      {
        id: "gambling-1",
        title: "Bonus Deposit",
        description: "Kamu melihat promosi bonus dari platform judi online.",
        context:
          "BONUS 100%! Deposit sekarang dan dapatkan saldo tambahan. Kesempatan terbatas! Menang besar menantimu hari ini.",
        choices: [
          {
            id: "a",
            label: "Tergiur dengan bonus dan mengikuti promosi.",
            isSafe: false,
            feedback: "Promosi dapat menjadi pintu masuk ke perilaku berjudi.",
            explanation:
              "Bonus dan klaim kemenangan besar digunakan untuk mendorong orang melakukan deposit.",
            saferAction:
              "Jangan melakukan deposit. Tinggalkan platform dan hindari interaksi dengan promosi tersebut.",
          },
          {
            id: "b",
            label: "Mengabaikan promosi dan mengenali risikonya.",
            isSafe: true,
            feedback: "Tepat! Kamu tidak terpancing oleh iming-iming bonus.",
            explanation:
              "Promosi tidak menghilangkan risiko kerugian finansial maupun dampak psikologis perjudian.",
            saferAction:
              "Blokir kanal promosi dan cari dukungan jika merasa sulit berhenti.",
          },
        ],
      },
      {
        id: "gambling-2",
        title: "Near-Miss Effect",
        description: "Kamu melihat hasil permainan yang hampir menang.",
        context:
          "Hasil permainan menunjukkan kamu hampir mendapatkan hadiah utama. Pesan muncul: 'Sedikit lagi! Coba sekali lagi untuk kesempatan menang lebih besar.'",
        choices: [
          {
            id: "a",
            label: "Mencoba lagi karena merasa hampir menang.",
            isSafe: false,
            feedback: "Hampir menang bukan berarti peluang menang berikutnya meningkat.",
            explanation:
              "Near-miss effect membuat seseorang merasa kemenangan sudah dekat, padahal hasil berikutnya tidak dijamin.",
            saferAction:
              "Hentikan permainan dan jangan menganggap hasil sebelumnya sebagai petunjuk hasil selanjutnya.",
          },
          {
            id: "b",
            label: "Mengenali manipulasi psikologis dan berhenti.",
            isSafe: true,
            feedback: "Bagus! Kamu mengenali efek near-miss.",
            explanation:
              "Perasaan hampir menang dapat mendorong seseorang terus bermain meskipun mengalami kerugian.",
            saferAction:
              "Jauhi platform dan cari aktivitas lain yang tidak melibatkan perjudian.",
          },
        ],
      },
      {
        id: "gambling-3",
        title: "Loss Chasing",
        description: "Kamu telah mengalami kerugian.",
        context:
          "Kamu kehilangan uang sebesar Rp200.000. Muncul pikiran: 'Kalau tambah Rp100.000 lagi, mungkin uang yang hilang bisa kembali.'",
        choices: [
          {
            id: "a",
            label: "Menambah uang untuk mengejar kerugian.",
            isSafe: false,
            feedback: "Ini adalah pola loss chasing yang berbahaya.",
            explanation:
              "Mengejar kerugian dapat membuat kerugian semakin besar dan sulit dikendalikan.",
            saferAction:
              "Berhenti, jangan menambah deposit, dan cari dukungan dari orang yang dipercaya.",
          },
          {
            id: "b",
            label: "Berhenti dan menerima bahwa uang tersebut sudah hilang.",
            isSafe: true,
            feedback: "Keputusan yang lebih aman.",
            explanation:
              "Berhenti mencegah kerugian semakin bertambah akibat keputusan impulsif.",
            saferAction:
              "Batasi akses ke platform dan minta bantuan jika sulit mengendalikan dorongan berjudi.",
          },
        ],
      },
    ],
  },

  {
    id: "mind",
    title: "Mind Trap",
    subtitle: "Understand the Psychology",
    description:
      "Kenali pola pikir yang dimanfaatkan pelaku.",
    difficulty: "Pemula",
    duration: "4 menit",
    icon: "brain",
    color: "amber",
    scenarios: [
      {
        id: "mind-1",
        title: "Fear of Missing Out",
        description: "Kamu menerima tawaran dengan batas waktu singkat.",
        context:
          "Promo investasi ini hanya berlaku untuk 5 orang pertama! Jika kamu tidak bergabung sekarang, kesempatan mendapatkan keuntungan besar akan hilang selamanya.",
        choices: [
          {
            id: "a",
            label: "Segera bergabung agar tidak kehilangan kesempatan.",
            isSafe: false,
            feedback: "Kamu sedang menghadapi FOMO (Fear of Missing Out).",
            explanation:
              "Pelaku memanfaatkan rasa takut kehilangan kesempatan agar korban tidak sempat memeriksa informasi.",
            saferAction:
              "Berhenti sejenak dan periksa kebenaran penawaran sebelum membuat keputusan.",
          },
          {
            id: "b",
            label: "Mengabaikan tekanan waktu dan melakukan verifikasi.",
            isSafe: true,
            feedback: "Bagus! Kamu tidak membiarkan FOMO mengendalikan keputusan.",
            explanation:
              "Keputusan finansial dan keamanan digital sebaiknya dibuat berdasarkan informasi, bukan tekanan.",
            saferAction:
              "Periksa legalitas, sumber informasi, dan risiko penawaran.",
          },
        ],
      },
      {
        id: "mind-2",
        title: "Authority Bias",
        description: "Seseorang mengaku sebagai pejabat atau ahli.",
        context:
          "Saya adalah pejabat dari lembaga resmi. Kamu harus segera mengirimkan data pribadi dan kode verifikasi karena ini merupakan prosedur wajib.",
        choices: [
          {
            id: "a",
            label: "Mempercayai karena orang tersebut mengaku pejabat.",
            isSafe: false,
            feedback: "Jangan langsung percaya hanya karena seseorang mengaku memiliki jabatan.",
            explanation:
              "Authority bias membuat seseorang cenderung memercayai figur yang dianggap memiliki kekuasaan.",
            saferAction:
              "Verifikasi identitas melalui kanal resmi dan jangan memberikan kode autentikasi.",
          },
          {
            id: "b",
            label: "Memeriksa identitas melalui saluran resmi.",
            isSafe: true,
            feedback: "Tepat! Identitas tetap perlu diverifikasi.",
            explanation:
              "Klaim jabatan atau identitas tidak otomatis membuktikan bahwa seseorang benar-benar berwenang.",
            saferAction:
              "Hubungi lembaga terkait melalui informasi kontak yang tersedia di situs resminya.",
          },
        ],
      },
      {
        id: "mind-3",
        title: "Social Proof",
        description: "Kamu melihat banyak testimoni keberhasilan.",
        context:
          "Ribuan orang sudah bergabung dan berhasil mendapatkan keuntungan! Lihat testimoni mereka. Jangan sampai kamu menjadi satu-satunya orang yang melewatkan kesempatan ini.",
        choices: [
          {
            id: "a",
            label: "Ikut karena banyak orang terlihat berhasil.",
            isSafe: false,
            feedback: "Banyak testimoni bukan jaminan sebuah layanan aman.",
            explanation:
              "Social proof memanfaatkan kecenderungan manusia mengikuti tindakan orang lain.",
            saferAction:
              "Periksa bukti independen, legalitas, dan informasi yang dapat diverifikasi.",
          },
          {
            id: "b",
            label: "Memeriksa bukti dan sumber testimoni secara independen.",
            isSafe: true,
            feedback: "Bagus! Kamu tidak hanya mengikuti keramaian.",
            explanation:
              "Testimoni dapat dimanipulasi atau dibuat untuk membangun kepercayaan palsu.",
            saferAction:
              "Jangan mengambil keputusan hanya berdasarkan popularitas atau klaim orang lain.",
          },
        ],
      },
    ],
  },
];

export function getSimulation(id: SimulationId) {
  return simulations.find((simulation) => simulation.id === id);
}