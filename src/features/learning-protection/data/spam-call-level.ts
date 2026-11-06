import type { SimulationScenario } from "@/types/learning-protection/index";
import { defineLevel, exit, fatal, good, slip, turn } from "./dialogue-builders";

export const spamCallScenarios: SimulationScenario[] = [
  /* ===== LEVEL 1 ===== */
  defineLevel({
    id: "calls-1",
    level: 1,
    difficulty: "Mudah",
    topic: "Rekaman otomatis (robocall)",
    title: "Listrik Akan Diputus",
    description: "Telepon berisi suara rekaman soal tunggakan listrik.",
    sender: { name: "+62 21 5090 1188", status: "Rekaman otomatis" },
    takeaway: "Tagihan resmi dicek di aplikasi sendiri, bukan lewat telepon yang menghubungimu.",
    t1: turn(
      [
        "🔊 [Rekaman] Pelanggan yang terhormat, listrik Anda akan diputus hari ini karena tunggakan.",
        "Tekan 1 untuk bicara dengan petugas.",
      ],
      [
        fatal(
          "a",
          "Tekan 1 lalu sebut nomor ID pelanggan saya",
          "ID pelanggan dan data pribadi dipakai untuk penipuan lanjutan.",
          "Terima kasih. Sebutkan juga nomor KTP Bapak/Ibu.",
        ),
        slip(
          "b",
          "Tekan 1, tanya saja tagihannya berapa",
          "Selamat siang, tagihan Anda Rp1.870.000 dan harus dibayar sekarang.",
          "t2",
        ),
        good(
          "c",
          "Tekan 1, lalu minta nama dan nomor pegawainya",
          "Saya petugas pusat, tidak perlu nomor pegawai. Bayar sekarang ya.",
          "t2",
          "Tidak mau menyebut identitas",
        ),
      ],
    ),
    t2: turn(
      ["Listrik padam 15 menit lagi. Transfer ke rekening dinas ini, lalu kirim bukti bayarnya."],
      [
        fatal(
          "a",
          "Oke, saya transfer sekarang",
          "Tagihan asli tidak dibayar ke rekening pribadi lewat telepon.",
          "Terima kasih. Jangan tutup telepon ya.",
        ),
        slip(
          "b",
          "Saya bayar lewat dompet digital saja",
          "Boleh, kirimkan kode pembayarannya ke saya.",
          "t3",
        ),
        good(
          "c",
          "Saya cek dulu di aplikasi PLN resmi",
          "Aplikasinya sedang gangguan, bayar di sini saja!",
          "t3",
          "Menyuruh tidak cek aplikasi resmi",
        ),
      ],
    ),
    t3: turn(["Terakhir! Kalau tidak bayar sekarang, petugas kami datang memutus listriknya."], [
      fatal(
        "a",
        "Ya sudah, saya bayar",
        "Ancaman pemutusan dipakai agar kamu tidak sempat mengecek.",
        "Bagus, ini rekeningnya.",
      ),
      fatal(
        "b",
        "Saya berikan nomor kartu kredit saja",
        "Data kartu yang diberikan lewat telepon bisa langsung dipakai belanja.",
        "Sebutkan juga tiga angka di belakang kartu.",
      ),
      exit(
        "c",
        "Silakan. Saya cek di aplikasi resmi dan matikan telepon",
        "Kamu mengecek lewat kanal resmi dan tidak terpancing ancaman.",
      ),
    ]),
  }),

  /* ===== LEVEL 2 ===== */
  defineLevel({
    id: "calls-2",
    level: 2,
    difficulty: "Mudah",
    topic: "Undian palsu",
    title: "Selamat, Kamu Menang Mobil!",
    description: "Penelepon mengaku dari operator seluler dan bilang nomormu terpilih.",
    sender: { name: "0812 7700 4521", status: "Mengaku “Operator SelulerKu”" },
    takeaway: "Hadiah asli tidak meminta biaya lebih dulu.",
    t1: turn(
      [
        "Selamat siang! Nomor Anda terpilih sebagai pemenang undian tahunan SelulerKu 🎉",
        "Hadiahnya 1 unit mobil. Boleh konfirmasi nama lengkap Anda?",
      ],
      [
        fatal(
          "a",
          "Nama saya sesuai KTP, nomor KTP saya ...",
          "Nama dan KTP lengkap cukup untuk membuka pinjaman atas namamu.",
          "Terima kasih, data lengkap. Sekarang soal pajaknya ya.",
        ),
        slip(
          "b",
          "Wah, saya ikut undian apa ya?",
          "Semua pelanggan otomatis ikut, Kak. Beruntung sekali!",
          "t2",
        ),
        good(
          "c",
          "Saya tidak pernah ikut undian. Undian apa ini?",
          "Undian khusus pelanggan setia, tidak perlu daftar.",
          "t2",
          "Hadiah tanpa pernah ikut",
        ),
      ],
    ),
    t2: turn(["Untuk pencairan, bayar pajak hadiah Rp2.500.000 ke rekening ini hari ini juga."], [
      fatal(
        "a",
        "Baik, saya transfer pajaknya",
        "Pajak hadiah asli tidak dibayar ke rekening pribadi lewat telepon.",
        "Terima kasih, tunggu konfirmasinya.",
      ),
      slip(
        "b",
        "Potong saja dari hadiahnya",
        "Tidak bisa Kak, sistemnya mengharuskan bayar di muka.",
        "t3",
      ),
      good(
        "c",
        "Hadiah asli tidak minta bayar dulu",
        "Ini aturan pajak negara, Kak. Jangan membantah.",
        "t3",
        "Minta bayar untuk menerima hadiah",
      ),
    ]),
    t3: turn(["Hadiah hangus dalam 30 menit. Mau diberikan ke orang lain?"], [
      fatal(
        "a",
        "Jangan, saya bayar sekarang",
        "Batas waktu dipakai agar kamu tidak berpikir.",
        "Ini nomor rekeningnya.",
      ),
      fatal(
        "b",
        "Saya pinjam uang dulu untuk bayar",
        "Berutang demi hadiah palsu hanya menambah kerugian.",
        "Cepat ya, waktunya habis.",
      ),
      exit(
        "c",
        "Berikan saja. Saya tutup dan laporkan nomor ini",
        "Kamu tidak mau membayar demi hadiah yang tidak pernah kamu ikuti.",
      ),
    ]),
  }),

  /* ===== LEVEL 3 ===== */
  defineLevel({
    id: "calls-3",
    level: 3,
    difficulty: "Mudah",
    topic: "Kurir COD palsu",
    title: "Paket COD di Depan Rumah",
    description: "Kurir bilang paket bayar di tempat sudah sampai, padahal kamu tidak memesan.",
    sender: { name: "0857 3310 9022", status: "Mengaku kurir" },
    takeaway: "Tidak memesan? Tolak paketnya. Jangan beri OTP untuk “membatalkan”.",
    t1: turn(
      [
        "Selamat siang, saya kurir. Paket COD Rp487.000 atas nama Anda sudah di depan rumah.",
        "Mohon siapkan uangnya ya.",
      ],
      [
        fatal(
          "a",
          "Oke, saya bayar Rp487.000 lewat transfer",
          "Kamu membayar paket yang tidak pernah kamu pesan.",
          "Terima kasih, transfer ke rekening ini ya.",
        ),
        slip(
          "b",
          "Paketnya dari siapa ya?",
          "Dari toko online, Kak. Pokoknya atas nama Anda.",
          "t2",
        ),
        good(
          "c",
          "Saya tidak merasa pesan apa pun",
          "Mungkin dipesankan keluarga. Pokoknya harus dibayar.",
          "t2",
          "Tidak bisa menyebut pengirim",
        ),
      ],
    ),
    t2: turn(["Kalau mau dibatalkan, sebutkan kode OTP yang barusan masuk ke SMS Anda."], [
      fatal(
        "a",
        "Kodenya 5 2 8 1 9 3",
        "OTP adalah kunci akunmu. Tidak ada pembatalan paket yang butuh OTP.",
        "Kode diterima, mohon tunggu.",
      ),
      slip(
        "b",
        "Aku foto saja SMS-nya ya",
        "Boleh, kirim ke nomor ini.",
        "t3",
      ),
      good(
        "c",
        "Kurir tidak pernah minta OTP",
        "Ini prosedur terbaru, Kak!",
        "t3",
        "Meminta kode OTP",
      ),
    ]),
    t3: turn(["Kalau ditolak, Anda kena denda penolakan dan datanya kami laporkan."], [
      fatal(
        "a",
        "Aduh, ya sudah kubayar saja",
        "Ancaman denda dipakai agar kamu menyerah.",
        "Bagus, transfer sekarang.",
      ),
      fatal(
        "b",
        "Kuberikan kodenya biar dibatalkan",
        "OTP tidak boleh dibagikan, apa pun alasannya.",
        "Kode diterima.",
      ),
      exit(
        "c",
        "Saya tolak paketnya, tutup telepon, dan cek di aplikasi belanja",
        "Menolak paket yang tidak dipesan adalah langkah paling aman.",
      ),
    ]),
  }),

  /* ===== LEVEL 4 ===== */
  defineLevel({
    id: "calls-4",
    level: 4,
    difficulty: "Menengah",
    topic: "Penyamaran petugas bank",
    title: "Transaksi Mencurigakan di Rekeningmu",
    description: "Penelepon mengaku dari keamanan bank dan tahu nama lengkapmu.",
    sender: { name: "021 5088 7000", status: "Nomor mirip layanan bank" },
    takeaway: "Bank tidak pernah meminta OTP, PIN, atau memindahkan uangmu ke “rekening aman”.",
    t1: turn(
      [
        "Selamat pagi Bapak/Ibu. Saya Reza dari keamanan Bank Nusantara.",
        "Ada transaksi Rp12.500.000 ke luar negeri di rekening Anda. Apakah itu Anda?",
      ],
      [
        fatal(
          "a",
          "Bukan! Tolong batalkan sekarang, ini kode OTP saya",
          "OTP yang kamu berikan justru yang mereka butuhkan untuk menguras rekeningmu.",
          "Terima kasih, kami proses pembatalannya.",
        ),
        slip(
          "b",
          "Bukan, apa yang harus saya lakukan?",
          "Jangan panik. Sebutkan nomor kartu dan 4 digit terakhir untuk verifikasi.",
          "t2",
        ),
        good(
          "c",
          "Saya akan telepon bank lewat nomor di kartu saya",
          "Tidak perlu, nanti transaksinya keburu lolos. Tetap di telepon ya!",
          "t2",
          "Melarang menutup telepon",
        ),
      ],
    ),
    t2: turn(["Jangan tutup telepon. Untuk memblokir, sebutkan PIN dan kode OTP yang masuk."], [
      fatal(
        "a",
        "PIN saya 4 8 ... dan OTP-nya ...",
        "PIN dan OTP memberi akses penuh ke rekeningmu.",
        "Kode diterima.",
      ),
      slip(
        "b",
        "Saya sebut OTP saja, PIN tidak",
        "OTP saja cukup. Sebutkan sekarang.",
        "t3",
      ),
      good(
        "c",
        "Bank tidak pernah minta PIN atau OTP",
        "Anda mempersulit kami. Dana Anda dalam bahaya!",
        "t3",
        "Meminta PIN dan OTP",
      ),
    ]),
    t3: turn(["Satu-satunya cara: pindahkan saldo ke rekening aman kami sekarang."], [
      fatal(
        "a",
        "Baik, saya pindahkan saldonya",
        "“Rekening aman” milik penipu. Bank tidak pernah memintanya.",
        "Setelah selesai, jangan tutup telepon.",
      ),
      fatal(
        "b",
        "Saya pindahkan sebagian saja",
        "Uang yang dipindahkan sulit ditarik kembali.",
        "Sisanya juga ya.",
      ),
      exit(
        "c",
        "Saya tutup telepon dan hubungi bank lewat aplikasi resmi",
        "Kamu memutus panggilan dan memverifikasi lewat kanal yang kamu pilih sendiri.",
      ),
    ]),
  }),

  /* ===== LEVEL 5 ===== */
  defineLevel({
    id: "calls-5",
    level: 5,
    difficulty: "Menengah",
    topic: "Penyamaran aparat",
    title: "Rekeningmu Dipakai Pencucian Uang",
    description: "Penelepon mengaku penyidik dan menyebut namamu terkait kasus.",
    sender: { name: "0811 9000 3350", status: "Mengaku “Penyidik Polda”" },
    takeaway: "Aparat tidak memeriksa lewat telepon dan tidak menyuruh memindahkan uang.",
    t1: turn(
      [
        "Saya AKP Hendra, penyidik. Rekening atas nama Anda dipakai dalam kasus pencucian uang.",
        "Anda terancam ditangkap. Ini serius.",
      ],
      [
        fatal(
          "a",
          "Astaga, saya tidak tahu! Saya akan kooperatif, apa yang harus saya serahkan?",
          "Rasa takut dipakai agar kamu langsung menurut.",
          "Serahkan data rekening dan PIN untuk pemeriksaan.",
        ),
        slip(
          "b",
          "Saya tidak bersalah! Bisa kirim surat resminya?",
          "Suratnya dikirim lewat WhatsApp. Pemeriksaan harus dimulai sekarang.",
          "t2",
        ),
        good(
          "c",
          "Panggilan polisi dikirim lewat surat resmi, bukan telepon",
          "Ini kasus rahasia, makanya lewat telepon.",
          "t2",
          "Alasan “kasus rahasia”",
        ),
      ],
    ),
    t2: turn(["Kasus ini rahasia. Jangan beri tahu keluarga atau siapa pun, atau Anda juga kena pasal."], [
      fatal(
        "a",
        "Baik, saya tidak akan bilang siapa-siapa",
        "Larangan memberi tahu orang lain adalah ciri utama penipuan ini.",
        "Bagus. Sekarang ikuti arahan saya.",
      ),
      slip(
        "b",
        "Saya kabari istri saya saja",
        "Jangan! Atau Anda ikut ditahan.",
        "t3",
      ),
      good(
        "c",
        "Saya mau ke kantor polisi terdekat untuk memastikan",
        "Tidak perlu, nanti Anda ditahan di tempat!",
        "t3",
        "Melarang datang ke kantor polisi",
      ),
    ]),
    t3: turn(["Pindahkan dana ke rekening pengamanan negara, nanti dikembalikan setelah terbukti bersih."], [
      fatal(
        "a",
        "Baik, saya pindahkan sekarang",
        "Tidak ada “rekening pengamanan negara” untuk warga.",
        "Kirim buktinya.",
      ),
      fatal(
        "b",
        "Saya pindahkan setengahnya",
        "Setengah uang tetap hilang.",
        "Setengah lagi ya.",
      ),
      exit(
        "c",
        "Saya tutup dan lapor ke kantor polisi langsung",
        "Kamu menolak tekanan dan mengecek ke kantor polisi yang asli.",
      ),
    ]),
  }),

  /* ===== LEVEL 6 ===== */
  defineLevel({
    id: "calls-6",
    level: 6,
    difficulty: "Menengah",
    topic: "Aplikasi remote access",
    title: "“CS Marketplace” Minta Pasang Aplikasi",
    description: "Penelepon tahu namamu dan pesananmu, lalu menawarkan refund.",
    sender: { name: "0821 6000 1900", status: "Mengaku “CS BelanjaKu”" },
    takeaway: "Jangan pernah memasang aplikasi bantuan jarak jauh atas permintaan penelepon.",
    t1: turn(
      [
        "Selamat siang, saya CS BelanjaKu. Pesanan Anda nomor BK-77120 bermasalah.",
        "Dana Rp389.000 akan kami refund. Boleh kami bantu prosesnya?",
      ],
      [
        fatal(
          "a",
          "Boleh, tolong bantu sekarang",
          "Kamu langsung masuk ke alur penipuan tanpa memeriksa.",
          "Silakan pasang aplikasi bantuan dulu.",
        ),
        slip(
          "b",
          "Pesanan yang mana ya?",
          "Yang tanggal kemarin, Kak. Nama dan alamat Kakak sudah ada di sistem.",
          "t2",
        ),
        good(
          "c",
          "Saya cek dulu di aplikasi resmi",
          "Prosesnya lebih cepat lewat telepon, Kak.",
          "t2",
          "Mendorong keluar dari aplikasi resmi",
        ),
      ],
    ),
    t2: turn(["Silakan pasang aplikasi “QuickAssist” dari toko aplikasi, lalu sebutkan kode 9 digitnya."], [
      fatal(
        "a",
        "Sudah terpasang. Kodenya 482 913 705",
        "Kode itu memberi penelepon kendali penuh atas layar ponselmu.",
        "Terima kasih, layar Anda sudah terlihat.",
      ),
      slip(
        "b",
        "Saya pasang, tapi kodenya belum kuberikan",
        "Tidak apa-apa, sebutkan saja kalau siap.",
        "t3",
      ),
      good(
        "c",
        "CS resmi tidak minta pasang aplikasi kendali jarak jauh",
        "Ini prosedur refund terbaru Kak.",
        "t3",
        "Minta pasang aplikasi remote",
      ),
    ]),
    t3: turn(["Sekarang buka m-banking Anda, supaya kami bisa memverifikasi refund."], [
      fatal(
        "a",
        "Oke, saya buka m-banking",
        "Pelaku melihat layar, PIN, dan OTP-mu lalu memindahkan uangmu.",
        "Terlihat. Sekarang masukkan PIN.",
      ),
      fatal(
        "b",
        "Kubuka tapi kututup bagian saldonya",
        "Pelaku tetap bisa membaca SMS dan notifikasi.",
        "Silakan lanjut.",
      ),
      exit(
        "c",
        "Tidak. Saya tutup telepon dan hapus aplikasinya",
        "Kamu memutus kendali sebelum aplikasi dipakai.",
      ),
    ]),
  }),

  /* ===== LEVEL 7 ===== */
  defineLevel({
    id: "calls-7",
    level: 7,
    difficulty: "Sulit",
    topic: "Pembajakan nomor (SIM swap)",
    title: "Kartu SIM Akan Diblokir",
    description: "“Operator” bilang nomormu harus diverifikasi, dan menyebut NIK-mu dengan benar.",
    sender: { name: "0878 2200 6001", status: "Mengaku “Customer Care Operator”" },
    takeaway: "Operator tidak meminta OTP atau mengalihkan SMS-mu. Nomor yang dibajak bisa menguras semua akunmu.",
    t1: turn(
      [
        "Selamat siang. Kartu Anda akan diblokir karena registrasi NIK belum valid.",
        "NIK Anda berakhiran 0042, benar ya? Kami bantu verifikasi sekarang.",
      ],
      [
        fatal(
          "a",
          "Benar, NIK saya lengkap: ...",
          "Pelaku yang sudah tahu sebagian data memakai data lengkapmu untuk mengambil alih nomor.",
          "Terima kasih, kami proses.",
        ),
        slip(
          "b",
          "Memang benar, kok mereka tahu ya?",
          "Data Anda ada di sistem kami, Kak. Mari lanjutkan.",
          "t2",
        ),
        good(
          "c",
          "Data bisa bocor. Saya cek registrasi lewat gerai resmi",
          "Ke gerai butuh waktu, nomor keburu mati. Kami bantu di sini.",
          "t2",
          "Data benar dipakai sebagai “bukti”",
        ),
      ],
    ),
    t2: turn(["Nanti ada SMS kode masuk. Mohon sebutkan kodenya untuk menyelesaikan verifikasi."], [
      fatal(
        "a",
        "Kodenya 7 2 1 9 4 0",
        "Kode itu dipakai memindahkan nomormu ke kartu SIM lain.",
        "Terima kasih, nomor Anda sedang kami proses.",
      ),
      slip(
        "b",
        "Kuteruskan SMS-nya ke nomor Anda",
        "Boleh, kirim ke nomor ini.",
        "t3",
      ),
      good(
        "c",
        "Operator tidak pernah minta kode SMS",
        "Kode ini bukan OTP, ini kode verifikasi biasa.",
        "t3",
        "Meminta kode SMS",
      ),
    ]),
    t3: turn(["Atau tekan kode pengalihan yang saya kirim, agar SMS Anda kami terima untuk verifikasi."], [
      fatal(
        "a",
        "Baik, saya tekan kodenya",
        "Pengalihan membuat semua SMS dan OTP-mu masuk ke penipu.",
        "Berhasil, sekarang tunggu ya.",
      ),
      fatal(
        "b",
        "Saya tekan, tapi matikan data seluler dulu",
        "Mematikan data tidak membatalkan pengalihan SMS.",
        "Sudah masuk, terima kasih.",
      ),
      exit(
        "c",
        "Saya tutup telepon dan datang ke gerai operator resmi",
        "Kamu memverifikasi di gerai resmi, bukan lewat telepon.",
      ),
    ]),
  }),

  /* ===== LEVEL 8 ===== */
  defineLevel({
    id: "calls-8",
    level: 8,
    difficulty: "Sulit",
    topic: "Penyamaran petugas pajak",
    title: "SPT Bermasalah dan Denda",
    description: "Penelepon mengaku petugas pajak dan menyebut data pajak yang tampak benar.",
    sender: { name: "021 5200 8800", status: "Mengaku “KPP”" },
    takeaway: "Urusan pajak dicek di situs dan aplikasi resmi sendiri, bukan lewat telepon atau foto KTP di chat.",
    t1: turn(
      [
        "Selamat siang, saya petugas pajak. Ada selisih pada pelaporan SPT Anda.",
        "Anda terancam denda Rp8.400.000 jika tidak diselesaikan hari ini.",
      ],
      [
        fatal(
          "a",
          "Mohon bantu, saya takut kena denda",
          "Rasa takut kena denda dipakai agar kamu patuh tanpa memeriksa.",
          "Kirim foto KTP dan NPWP ke WhatsApp ini.",
        ),
        slip(
          "b",
          "Boleh saya lihat detail selisihnya?",
          "Rinciannya kami kirim lewat WhatsApp. Daftar dulu ke nomor ini.",
          "t2",
        ),
        good(
          "c",
          "Saya cek langsung di akun pajak resmi saya",
          "Akun Anda sedang dikunci karena masalah ini.",
          "t2",
          "Mengaku akun resmi terkunci",
        ),
      ],
    ),
    t2: turn(["Kirim selfie sambil memegang KTP untuk verifikasi, lalu bayar lewat kode billing ini."], [
      fatal(
        "a",
        "Baik, ini selfie dan KTP saya",
        "Foto selfie dengan KTP dipakai untuk pinjaman online atas namamu.",
        "Foto diterima. Silakan bayar.",
      ),
      slip(
        "b",
        "Kirim kode billing dulu, nanti kucek",
        "Ini kodenya: 9208 1100 4521.",
        "t3",
      ),
      good(
        "c",
        "Kode billing resmi bisa kucek di situs pajak",
        "Kode ini khusus, tidak bisa dicek publik.",
        "t3",
        "Kode billing tidak bisa dicek",
      ),
    ]),
    t3: turn(["Kalau tidak dibayar dalam 1 jam, akan kami blokir rekening Anda."], [
      fatal(
        "a",
        "Baik, saya bayar sekarang",
        "Ancaman blokir rekening dipakai agar kamu membayar ke rekening penipu.",
        "Kirim buktinya.",
      ),
      fatal(
        "b",
        "Kubayar setengah dulu",
        "Setengahnya tetap hilang dan tekanan akan berlanjut.",
        "Setengah lagi ya.",
      ),
      exit(
        "c",
        "Silakan blokir. Saya cek ke kantor pajak dan lapor",
        "Kamu mengecek ke kanal pajak resmi dan menolak tekanan.",
      ),
    ]),
  }),

  /* ===== LEVEL 9 ===== */
  defineLevel({
    id: "calls-9",
    level: 9,
    difficulty: "Ahli",
    topic: "Video call deepfake",
    title: "Video Call dari Atasanmu",
    description: "Wajah dan suara atasanmu tampak jelas di video call, tapi permintaannya mendesak.",
    sender: { name: "Pak Budi (Direktur)", status: "Video call WhatsApp, sinyal kurang stabil" },
    takeaway: "Wajah dan suara bisa dipalsukan AI. Untuk uang, minta konfirmasi lewat jalur lain atau prosedur resmi.",
    t1: turn(
      [
        "📹 Halo, ini Budi. Maaf mendadak, saya lagi di luar kota.",
        "Ada pembayaran vendor Rp85.000.000 yang harus keluar sekarang. Tolong kamu transfer ya.",
      ],
      [
        fatal(
          "a",
          "Siap Pak, kirim nomor rekeningnya",
          "Wajah dan suara di video call bisa ditiru AI.",
          "Terima kasih, ini rekeningnya.",
        ),
        slip(
          "b",
          "Siap Pak, tapi ini sesuai prosedur kah?",
          "Kali ini darurat, prosedurnya menyusul.",
          "t2",
        ),
        good(
          "c",
          "Pak, apa nama proyek yang kita bahas Selasa lalu?",
          "Aduh, sinyal jelek, kamu nggak kedengaran!",
          "t2",
          "Menghindar saat ditanya hal pribadi",
        ),
      ],
    ),
    t2: turn(["Sinyal saya jelek, jangan ditutup. Transfer sekarang, saya tunggu di sini."], [
      fatal(
        "a",
        "Baik Pak, saya transfer sekarang",
        "Tekanan dan larangan menutup telepon mencegahmu memverifikasi.",
        "Bagus.",
      ),
      slip(
        "b",
        "Saya transfer setengah dulu, Pak",
        "Setengah lagi ya, jangan lama.",
        "t3",
      ),
      good(
        "c",
        "Pak, saya tutup dulu dan telepon biasa ke nomor Bapak",
        "Jangan! Nanti urusannya batal!",
        "t3",
        "Melarang telepon balik",
      ),
    ]),
    t3: turn(["Kamu mau saya anggap tidak loyal? Transfer sekarang!"], [
      fatal(
        "a",
        "Maaf Pak, saya transfer sekarang",
        "Tekanan memakai jabatan dan rasa takut adalah taktik utama.",
        "Terima kasih.",
      ),
      fatal(
        "b",
        "Saya transfer tapi lapor ke keuangan setelahnya",
        "Setelah uang pindah, pelaporan sudah terlambat.",
        "Sudah cukup.",
      ),
      exit(
        "c",
        "Maaf Pak, saya tutup dan konfirmasi ke keuangan serta nomor Bapak",
        "Kamu memverifikasi lewat jalur lain sebelum mengeluarkan uang.",
      ),
    ]),
  }),

  /* ===== LEVEL 10 ===== */
  defineLevel({
    id: "calls-10",
    level: 10,
    difficulty: "Ahli",
    topic: "Penipuan pemulihan dana (recovery scam)",
    title: "“Satgas” yang Mau Mengembalikan Uangmu",
    description: "Kamu pernah jadi korban penipuan investasi. Sebulan kemudian, ada telepon yang tahu persis kerugianmu.",
    sender: { name: "0813 4400 7721", status: "Mengaku “Satgas Pemulihan Aset”" },
    takeaway: "Pemulihan dana asli tidak meminta biaya di muka. Korban sering ditipu dua kali.",
    t1: turn(
      [
        "Selamat siang. Kami Satgas Pemulihan Aset. Kami tahu Anda kehilangan Rp18.000.000 di NovaTrade AI bulan lalu.",
        "Kami bisa mengembalikan seluruhnya. Anda berminat?",
      ],
      [
        fatal(
          "a",
          "Mau banget! Bagaimana caranya?",
          "Penipu mendatangi korban lama karena mereka sedang putus asa dan mudah percaya.",
          "Cukup bayar biaya administrasi 5% dulu.",
        ),
        slip(
          "b",
          "Dari mana kalian tahu kerugian saya?",
          "Dari data yang dilaporkan korban lain, Kak. Kami resmi.",
          "t2",
        ),
        good(
          "c",
          "Saya tidak pernah lapor ke kalian. Dari mana datanya?",
          "Dari database kasus. Percayalah, kami membantu.",
          "t2",
          "Tahu kerugianmu tanpa kamu lapor",
        ),
      ],
    ),
    t2: turn(["Biaya administrasi 5% (Rp900.000) dan pajak 10%. Transfer ke rekening notaris kami dulu."], [
      fatal(
        "a",
        "Baik, saya transfer sekarang",
        "Layanan pemulihan yang meminta biaya di muka adalah penipuan kedua.",
        "Terima kasih, proses dimulai.",
      ),
      slip(
        "b",
        "Biayanya dipotong dari dana yang kembali bisa?",
        "Tidak bisa, harus dibayar di muka.",
        "t3",
      ),
      good(
        "c",
        "Lembaga resmi tidak minta biaya di muka",
        "Biaya ini untuk notaris, bukan untuk kami.",
        "t3",
        "Minta biaya di muka",
      ),
    ]),
    t3: turn(["Hanya hari ini. Besok berkas Anda masuk antrean 6 bulan lagi."], [
      fatal(
        "a",
        "Baik, saya bayar hari ini",
        "Tenggat dan antrean dipakai agar kamu tidak sempat menimbang.",
        "Ini rekeningnya.",
      ),
      fatal(
        "b",
        "Saya pinjam dulu untuk membayar",
        "Berutang demi memulihkan kerugian hanya melipatgandakannya.",
        "Cepat ya.",
      ),
      exit(
        "c",
        "Tidak. Saya akan lapor lewat layanan pengaduan resmi dan hubungi bank",
        "Kamu tidak jatuh dua kali dan melapor lewat jalur resmi.",
      ),
    ]),
  }),
];