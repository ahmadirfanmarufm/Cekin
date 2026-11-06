import type { SimulationScenario } from "@/types/learning-protection/index";
import { defineLevel, exit, fatal, good, slip, turn } from "./dialogue-builders";

/**
 * Trust Lab: 10 level, tiap level adalah percakapan WhatsApp 3 giliran dengan penipu.
 *
 * Level 1-3  (Mudah)    : lowongan palsu, bonus bertekanan waktu, paket berisi file APK.
 * Level 4-6  (Menengah) : penyamaran adik, task scam, kode WhatsApp "salah kirim".
 * Level 7-8  (Sulit)    : CS palsu di DM, suara kerabat hasil kloning AI.
 * Level 9-10 (Ahli)     : investasi AI + romansa, "salah transfer" yang uangnya benar-benar masuk.
 *
 * Penipu tidak menyerah setelah satu penolakan: tekanan makin kuat tiap giliran,
 * dan tanda bahaya terbuka dari cara mereka bereaksi saat kamu memeriksa.
 */

export const trustLabScenarios: SimulationScenario[] = [
  /* ===== LEVEL 1 ===== */
  defineLevel({
    id: "trust-1",
    level: 1,
    difficulty: "Mudah",
    topic: "Lowongan kerja palsu",
    title: "Lowongan Kerja Online",
    description: "Seseorang menghubungimu lewat WhatsApp soal pekerjaan.",
    sender: { name: "HRD Remote Karier", status: "akun bisnis" },
    takeaway: "Perusahaan sungguhan tidak memungut biaya dari pelamar.",
    t1: turn(
      [
        "Halo! Selamat, kamu lolos kandidat kerja remote kami 🎉",
        "Gaji Rp500rb–1jt per hari, cukup dari HP. Mau lanjut?",
      ],
      [
        fatal(
          "a",
          "Oke, ini foto KTP dan nomor rekening saya",
          "KTP dan rekening bisa dipakai untuk pinjaman dan akun palsu atas namamu.",
          "Siap! Kirim juga selfie sambil pegang KTP ya.",
        ),
        slip(
          "b",
          "Ini nama lengkap dan alamat rumah saya",
          "Terima kasih Kak. Sekarang kirim foto KTP ya.",
          "t2",
        ),
        good(
          "c",
          "Boleh tahu nama PT dan alamat kantornya?",
          "Kami PT Karya Digital Global, kantor di luar negeri. Yang penting kamu serius ya.",
          "t2",
          "Info perusahaan tidak jelas",
        ),
      ],
    ),
    t2: turn(
      ["Biar akunmu aktif, bayar biaya administrasi Rp75.000 ya. Hari ini saja, besok kuota habis."],
      [
        fatal(
          "a",
          "Oke, saya transfer Rp75.000 sekarang",
          "Perusahaan sungguhan tidak memungut biaya dari pelamar.",
          "Makasih! Setelah ini ada biaya seragam Rp150.000 ya.",
        ),
        slip(
          "b",
          "Boleh bayar setengahnya dulu?",
          "Boleh Kak, Rp40.000 dulu. Cepat ya!",
          "t3",
        ),
        good(
          "c",
          "Perusahaan resmi tidak minta biaya. Saya cek dulu ya.",
          "Jangan lama-lama, slotmu bisa diberikan ke orang lain!",
          "t3",
          "Meminta biaya di awal",
        ),
      ],
    ),
    t3: turn(
      ["Ini kesempatan terakhir, Kak. Banyak yang sudah berhasil lho. Jadi atau tidak?"],
      [
        fatal(
          "a",
          "Ya sudah, saya bayar sekarang",
          "Tekanan “kesempatan terakhir” dipakai agar kamu tidak sempat mengecek.",
          "Pintar! Ini rekeningnya.",
        ),
        fatal(
          "b",
          "Saya kirim KTP saja sebagai jaminan",
          "KTP yang kamu kirim bisa disalahgunakan untuk pinjaman atas namamu.",
          "Terima kasih, KTP diterima.",
        ),
        exit(
          "c",
          "Tidak. Saya berhenti dan laporkan akun ini",
          "Kamu menolak tekanan dan melaporkan. Tepat!",
        ),
      ],
    ),
  }),

  /* ===== LEVEL 2 ===== */
  defineLevel({
    id: "trust-2",
    level: 2,
    difficulty: "Mudah",
    topic: "Bonus palsu dan tekanan waktu",
    title: "Bonus Saldo Dompet Digital",
    description: "Seseorang yang mengaku admin promo menghubungimu.",
    sender: { name: "Admin Promo Dompetku", status: "akun bisnis" },
    takeaway: "Bonus asli bisa dicek di aplikasi resmi, tanpa setoran dan tanpa OTP.",
    t1: turn(
      [
        "Akun kamu dapat bonus Rp2.000.000! 🎁",
        "Klaim sekarang, bonus hangus 10 menit lagi.",
      ],
      [
        fatal(
          "a",
          "Oke, saya top-up sekarang",
          "Bonus asli tidak meminta setoran lebih dulu.",
          "Transfer ke rekening ini ya, waktunya 7 menit!",
        ),
        slip(
          "b",
          "Gimana cara klaimnya?",
          "Top-up Rp100.000 dulu untuk aktivasi bonus.",
          "t2",
        ),
        good(
          "c",
          "Saya cek dulu di aplikasi resminya",
          "Tidak perlu cek, itu lama. Langsung klaim di sini saja!",
          "t2",
          "Melarangmu mengecek",
        ),
      ],
    ),
    t2: turn(
      ["Waktumu tinggal 5 menit! Kirim juga kode OTP yang masuk untuk verifikasi."],
      [
        fatal(
          "a",
          "Ini kode OTP-nya: 4 8 2 9 1 7",
          "OTP adalah kunci akunmu. Pihak resmi tidak pernah memintanya.",
          "Kode diterima, mohon tunggu...",
        ),
        slip(
          "b",
          "Cairkan bonusnya dulu, baru saya top-up",
          "Sistem tidak bisa begitu, Kak. Cepat ya!",
          "t3",
        ),
        good(
          "c",
          "Admin resmi tidak pernah minta OTP",
          "Kalau begitu bonusnya hangus ya!",
          "t3",
          "Meminta kode OTP",
        ),
      ],
    ),
    t3: turn(
      ["Bonus hangus dalam 1 menit! Ini benar-benar kesempatan terakhir."],
      [
        fatal(
          "a",
          "Oke, saya bayar sekarang",
          "Hitung mundur hanyalah tekanan buatan.",
          "Bagus, ini rekeningnya.",
        ),
        fatal(
          "b",
          "Saya kirim kodenya saja deh",
          "OTP tidak boleh dibagikan, apa pun alasannya.",
          "Kode diterima.",
        ),
        exit(
          "c",
          "Biar hangus. Saya blokir akun ini",
          "Kamu tidak terpancing hitung mundur.",
        ),
      ],
    ),
  }),

  /* ===== LEVEL 3 ===== */
  defineLevel({
    id: "trust-3",
    level: 3,
    difficulty: "Mudah",
    topic: "File APK berbahaya",
    title: "Paket Tertahan",
    description: "Pesan dari nomor yang mengaku kurir ekspedisi.",
    sender: { name: "Info Paket KilatExpress", status: "akun bisnis" },
    takeaway: "Foto paket tidak pernah berbentuk file .apk. Jangan pasang aplikasi dari chat.",
    t1: turn(
      [
        "📦 Paketmu tertahan karena alamat kurang lengkap.",
        "Lihat foto paket dan konfirmasi alamat: 📎 Foto_Paket.apk (4,2 MB)",
      ],
      [
        fatal(
          "a",
          "Oke, saya buka filenya",
          "File .apk adalah aplikasi yang bisa membaca SMS dan OTP, bahkan mengambil alih m-banking.",
          "Izinkan semua akses ya Kak supaya fotonya muncul.",
        ),
        slip(
          "b",
          "Saya unduh di HP lama saja",
          "Silakan Kak, izinkan semua akses yang diminta ya.",
          "t2",
        ),
        good(
          "c",
          "Kirim foto biasa saja, bukan file .apk",
          "Tidak bisa Kak, harus lewat aplikasi kami.",
          "t2",
          "Memaksa pasang aplikasi",
        ),
      ],
    ),
    t2: turn(
      ["Kalau tidak dikonfirmasi 1 jam, paket dikembalikan dan kena denda Rp35.000."],
      [
        fatal(
          "a",
          "Ya sudah, saya bayar dendanya",
          "Denda paket lewat chat adalah modus.",
          "Terima kasih, transfer ke rekening ini.",
        ),
        slip(
          "b",
          "Ini alamat lengkap saya",
          "Terima kasih Kak. Nomor KTP juga ya.",
          "t3",
        ),
        good(
          "c",
          "Saya cek resi di aplikasi resmi kurir",
          "Resinya tidak akan muncul di sana, itu sistem kami!",
          "t3",
          "Resi tidak bisa dicek",
        ),
      ],
    ),
    t3: turn(
      ["Peringatan terakhir. Pasang aplikasinya sekarang atau paket dibatalkan."],
      [
        fatal(
          "a",
          "Baik, saya pasang sekarang",
          "Aplikasi dari chat bukan dari toko resmi dan bisa menguasai ponselmu.",
          "Bagus, izinkan aksesibilitas ya.",
        ),
        fatal(
          "b",
          "Saya kirim KTP saja",
          "KTP yang dikirim bisa disalahgunakan.",
          "KTP diterima.",
        ),
        exit(
          "c",
          "Saya cek lewat aplikasi resmi kurir. Blokir",
          "Kamu mengecek lewat kanal resmi dan tidak memasang apa pun.",
        ),
      ],
    ),
  }),

  /* ===== LEVEL 4 ===== */
  defineLevel({
    id: "trust-4",
    level: 4,
    difficulty: "Menengah",
    topic: "Penyamaran keluarga",
    title: "Nomor Baru Adikmu",
    description: "Nomor tak dikenal mengaku sebagai adikmu.",
    sender: { name: "+62 857-3391-0142", status: "nomor baru" },
    takeaway: "Nomor baru yang minta uang? Telepon nomor lamanya atau keluarga lain dulu.",
    t1: turn(
      [
        "Kak, ini Dimas 🙏 HP lamaku rusak, ini nomor baruku.",
        "Bisa tolong transferin Rp1.850.000 ke rekening temanku? Buat bayar vendor, nanti malam kuganti.",
      ],
      [
        fatal(
          "a",
          "Oke, kirim nomor rekeningnya",
          "Pelaku memakai nama keluarga dan alasan HP rusak agar kamu tidak sempat memeriksa.",
          "Makasih Kak! BCA 7712 3345 a.n. Rudi.",
        ),
        slip(
          "b",
          "Tanya lewat chat: “Siapa nama ibu kita?”",
          "Ibu Ratih kan? Udah ya Kak, cepetan transfer.",
          "t2",
        ),
        good(
          "c",
          "Aku telepon nomor lamamu dulu ya",
          "HP lamaku rusak Kak, nggak bisa! Transfer dulu aja.",
          "t2",
          "Menolak ditelepon",
        ),
      ],
    ),
    t2: turn(
      ["Kak ayo dong, vendornya nungguin. Kakak tega ya sama adik sendiri? 😢"],
      [
        fatal(
          "a",
          "Ya udah, aku transfer sekarang",
          "Rasa bersalah dipakai untuk menekanmu.",
          "Makasih Kak, kamu penyelamatku!",
        ),
        slip(
          "b",
          "Aku transfer Rp500.000 dulu deh",
          "Kurang Kak, kurang Rp1.350.000 lagi!",
          "t3",
        ),
        good(
          "c",
          "Aku tanya orang tua dulu ya",
          "Jangan! Mama nanti khawatir. Rahasiain dulu ya!",
          "t3",
          "Melarang menghubungi keluarga",
        ),
      ],
    ),
    t3: turn(
      ["Kak serius ini darurat, 10 menit lagi gagal bayar. Kirim sekarang!"],
      [
        fatal(
          "a",
          "Oke, kukirim sekarang",
          "Urgensi dibuat agar kamu tidak sempat memverifikasi.",
          "Terima kasih Kak!",
        ),
        fatal(
          "b",
          "Kukirim Rp1 juta saja ya",
          "Jumlah lebih kecil tetap uang yang hilang, dan permintaan berikutnya pasti datang.",
          "Makasih, tapi kurang ya Kak...",
        ),
        exit(
          "c",
          "Aku telepon nomor lama dan keluarga dulu. Blokir",
          "Kamu memverifikasi lewat jalur lain dan menolak tekanan.",
        ),
      ],
    ),
  }),

  /* ===== LEVEL 5 ===== */
  defineLevel({
    id: "trust-5",
    level: 5,
    difficulty: "Menengah",
    topic: "Penipuan tugas online (task scam)",
    title: "Komisi Pertama Benar-benar Cair",
    description: "Kemarin kamu ikut kerja sampingan “like & subscribe”, dan komisinya benar-benar masuk.",
    sender: { name: "Admin Tugas Harian", status: "online" },
    takeaway: "Komisi kecil di awal itu umpan. Kerja asli tidak meminta setoran.",
    t1: turn(
      [
        "Komisi 3 tugas kemarin Rp45.000 sudah cair ✅",
        "Hari ini naik ke TUGAS PREMIUM: setor Rp500.000, komisi Rp750.000 cair hari ini.",
      ],
      [
        fatal(
          "a",
          "Oke, saya setor Rp500.000",
          "Setoran “modal tugas” tidak akan kembali.",
          "Mantap Kak! Setor ke rekening ini ya.",
        ),
        slip(
          "b",
          "Setor Rp100.000 dulu buat coba",
          "Bisa, tapi komisinya turun jadi Rp150.000 ya.",
          "t2",
        ),
        good(
          "c",
          "Pekerjaan asli tidak minta setoran modal",
          "Ini bukan setoran, tapi “jaminan tugas”, nanti kembali!",
          "t2",
          "Setoran disebut “jaminan”",
        ),
      ],
    ),
    t2: turn(
      ["Slot tinggal 2 orang! Ajak temanmu juga biar dapat bonus rujukan Rp50.000."],
      [
        fatal(
          "a",
          "Saya ajak teman-teman saya",
          "Skema rujukan memperluas korban dan kamu ikut terseret.",
          "Wah mantap! Kirim kontak mereka ya.",
        ),
        slip(
          "b",
          "Saya setor, pinjam dulu ke teman",
          "Cepat ya, tinggal 1 slot!",
          "t3",
        ),
        good(
          "c",
          "Saya mau tarik komisi Rp45.000 dan berhenti",
          "Penarikan harus menyelesaikan tugas premium dulu.",
          "t3",
          "Penarikan ditahan",
        ),
      ],
    ),
    t3: turn(
      ["Kalau berhenti sekarang, semua komisimu hangus!"],
      [
        fatal(
          "a",
          "Ya sudah, saya setor sekarang",
          "Ancaman “hangus” dipakai agar kamu terus menyetor.",
          "Bagus! Ini rekeningnya.",
        ),
        fatal(
          "b",
          "Saya pinjam uang untuk setor",
          "Berutang demi mengejar komisi hanya menambah kerugian.",
          "Pintar! Cepat ya.",
        ),
        exit(
          "c",
          "Biar hangus. Saya berhenti dan laporkan",
          "Kamu menerima kehilangan kecil agar tidak rugi besar.",
        ),
      ],
    ),
  }),

  /* ===== LEVEL 6 ===== */
  defineLevel({
    id: "trust-6",
    level: 6,
    difficulty: "Menengah",
    topic: "Pengambilalihan akun WhatsApp",
    title: "Kode yang Salah Kirim",
    description: "Pesan datang dari kontak yang kamu kenal, tapi akunnya mungkin sudah diambil alih.",
    sender: { name: "Rina Kantor", status: "online" },
    takeaway: "Kode verifikasi itu rahasia, bahkan untuk teman. Telepon orangnya langsung.",
    t1: turn(
      [
        "Eh ini Rina. Tadi ada kode verifikasi masuk ke nomormu ya? Salah kirim 😅",
        "Tolong kirim 6 digitnya ya, aku lagi rapat, akunku keburu terkunci 🙏",
      ],
      [
        fatal(
          "a",
          "Kodenya 4 8 3 9 1 2",
          "Kamu menyerahkan akun WhatsApp-mu.",
          "Makasih ya!",
        ),
        slip(
          "b",
          "Kukirim 3 digit pertama aja",
          "Kurang 3 digit lagi nih, lanjutin dong!",
          "t2",
        ),
        good(
          "c",
          "Aku telepon kamu dulu ya",
          "Jangan! Aku lagi rapat, nggak bisa angkat.",
          "t2",
          "Menolak ditelepon",
        ),
      ],
    ),
    t2: turn(["Ayo cepet, 1 menit lagi akunku diblokir!"], [
      fatal(
        "a",
        "Ini kode lengkapnya",
        "Kode lengkap memberi mereka akses penuh ke akunmu.",
        "Makasih banget!",
      ),
      slip(
        "b",
        "Aku foto layar SMS-nya ya",
        "Boleh! Cepet ya.",
        "t3",
      ),
      good(
        "c",
        "Kode itu rahasia. Siapa pun tidak boleh minta",
        "Ya ampun, jahat banget sih kamu!",
        "t3",
        "Marah saat kode ditolak",
      ),
    ]),
    t3: turn(["Ya udah, pinjemin pulsa Rp100.000 aja, nanti kuganti."], [
      fatal(
        "a",
        "Oke, kukirim pulsanya",
        "Akun yang diretas dipakai untuk memeras kontak satu per satu.",
        "Makasih ya!",
      ),
      fatal(
        "b",
        "Kukirim kodenya aja deh",
        "Kode tidak boleh dibagikan apa pun alasannya.",
        "Nah gitu dong.",
      ),
      exit(
        "c",
        "Akunmu diretas. Aku telepon kamu dan laporkan",
        "Kamu mengenali pola akun diretas dan memberi tahu pemiliknya lewat jalur lain.",
      ),
    ]),
  }),

  /* ===== LEVEL 7 ===== */
  defineLevel({
    id: "trust-7",
    level: 7,
    difficulty: "Sulit",
    topic: "Akun layanan pelanggan palsu",
    title: "CS Resmi yang Menghampirimu",
    description: "Kamu mengeluh soal refund di media sosial, lalu sebuah akun mengirim DM.",
    sender: { name: "BelanjaKu Care Official", status: "centang biru • akun bisnis" },
    takeaway: "Layanan resmi tidak mendatangimu lewat DM dan tidak pernah meminta kode.",
    t1: turn(
      [
        "Halo Kak, kami lihat keluhan Kakak di media sosial 🙏",
        "Refund Rp389.000 kami proses sekarang. Verifikasi di refund-belanjaku-care.example ya.",
      ],
      [
        fatal(
          "a",
          "Oke, saya buka tautannya dan isi data",
          "Halaman palsu mencuri data dan kodemu.",
          "Silakan masukkan nomor, PIN, dan kode SMS.",
        ),
        slip(
          "b",
          "Ini nomor pesanan dan nama lengkap saya",
          "Pesanan ditemukan. Kode SMS-nya mohon dikirim.",
          "t2",
        ),
        good(
          "c",
          "Saya cek refund di aplikasi resmi saja",
          "Lewat aplikasi prosesnya 14 hari. Kami bisa langsung sekarang.",
          "t2",
          "Mendorong keluar dari aplikasi resmi",
        ),
      ],
    ),
    t2: turn(
      ["Akun kami bercentang biru, Kak. Percayalah. Kirim kode 6 digit yang masuk ke SMS."],
      [
        fatal(
          "a",
          "Ini kodenya...",
          "Kode SMS itu OTP untuk membobol akunmu.",
          "Terima kasih Kak, mohon tunggu.",
        ),
        slip(
          "b",
          "Oke, centang biru berarti resmi",
          "Betul Kak, kami tunggu kodenya.",
          "t3",
        ),
        good(
          "c",
          "Centang bisa dibeli. Admin resmi tidak minta kode",
          "Kakak mempersulit proses refund sendiri lho.",
          "t3",
          "Meminta kode SMS",
        ),
      ],
    ),
    t3: turn(["Refund hangus dalam 15 menit jika tidak diverifikasi."], [
      fatal(
        "a",
        "Baik, saya verifikasi sekarang",
        "Batas waktu dipakai agar kamu tidak sempat memeriksa.",
        "Silakan kirim kodenya.",
      ),
      fatal(
        "b",
        "Saya kirim kodenya biar cepat",
        "OTP tidak pernah boleh dibagikan.",
        "Kode diterima.",
      ),
      exit(
        "c",
        "Saya laporkan akun ini dan cek di pusat bantuan resmi",
        "Kamu memakai kanal resmi di dalam aplikasi dan melaporkan akun palsu.",
      ),
    ]),
  }),

  /* ===== LEVEL 8 ===== */
  defineLevel({
    id: "trust-8",
    level: 8,
    difficulty: "Sulit",
    topic: "Kloning suara dengan AI",
    title: "Suara yang Terdengar Persis Adikmu",
    description: "Kamu menerima pesan suara yang terdengar persis seperti adikmu, panik dan terisak.",
    sender: { name: "+62 821-6620-7715", status: "online" },
    takeaway: "Suara bisa ditiru AI. Sepakati kata sandi keluarga untuk situasi darurat.",
    t1: turn(
      [
        "🎤 Pesan suara 0:12 (suara adikmu, panik dan terisak)",
        "Kak aku kecelakaan, di klinik diminta DP Rp3.000.000. HP-ku rusak, pakai HP orang. Transfer cepat Kak 😭",
      ],
      [
        fatal(
          "a",
          "Oke, kutransfer. Suaranya jelas adikku",
          "Suara bisa ditiru AI hanya dari video pendek di media sosial.",
          "Makasih Kak, dokternya sudah nunggu 🙏",
        ),
        slip(
          "b",
          "Kirim foto selfie dan KTP-mu dulu",
          "Ini fotonya Kak 📸 Tolong cepat.",
          "t2",
        ),
        good(
          "c",
          "Aku telepon nomor adikku yang biasa",
          "HP-ku rusak Kak! Pakai HP orang! Transfer dulu!",
          "t2",
          "Menolak ditelepon",
        ),
      ],
    ),
    t2: turn(["Kak dokternya nunggu! Aku takut... jangan kasih tahu Mama dulu 😭"], [
      fatal(
        "a",
        "Oke, kutransfer sekarang",
        "Rasa panik sengaja dibuat agar kamu tidak sempat berpikir.",
        "Makasih Kak!",
      ),
      slip(
        "b",
        "Kutransfer Rp1.500.000 dulu",
        "Masih kurang, sisanya sekarang juga!",
        "t3",
      ),
      good(
        "c",
        "Apa kata sandi keluarga kita?",
        "Kata sandi apa sih Kak? Cepetan!",
        "t3",
        "Tidak tahu kata sandi keluarga",
      ),
    ]),
    t3: turn(["Kak, nyawaku taruhannya! Kirim sekarang atau terlambat!"], [
      fatal(
        "a",
        "Baik, kukirim semuanya",
        "Ancaman nyawa adalah tekanan paling kuat dan paling sering dipakai.",
        "Terima kasih Kak!",
      ),
      fatal(
        "b",
        "Kukirim setengah saja",
        "Setengah transfer tetap uang yang hilang.",
        "Masih kurang Kak...",
      ),
      exit(
        "c",
        "Aku hubungi keluarga dan klinik langsung. Blokir",
        "Kamu memverifikasi lewat jalur lain meski ditekan.",
      ),
    ]),
  }),

  /* ===== LEVEL 9 ===== */
  defineLevel({
    id: "trust-9",
    level: 9,
    difficulty: "Ahli",
    topic: "Investasi AI dan hubungan emosional",
    title: "Saldo Besar yang Tidak Bisa Ditarik",
    description: "Tiga minggu kamu mengobrol dengan Kevin. Ia mengajakmu investasi dan kini saldomu tampak membengkak.",
    sender: { name: "Kevin", status: "kenalan dari aplikasi kencan" },
    takeaway: "Saldo di aplikasi hanyalah angka. Biaya penarikan di muka itu penipuan.",
    t1: turn(
      [
        "Udah lihat saldomu di NovaTrade AI? Rp12.400.000 loh 🎉",
        "Biar bisa ditarik, bayar pajak 10% (Rp1.240.000) dulu ke rekening perusahaan ya.",
      ],
      [
        fatal(
          "a",
          "Oke, saya bayar pajaknya sekarang",
          "Biaya “pajak” sebelum penarikan adalah pola khas, dan akan muncul biaya baru lagi.",
          "Bagus! Tinggal biaya verifikasi 2% ya sayang 😘",
        ),
        slip(
          "b",
          "Saya pinjam pinjol dulu buat bayar",
          "Pintar! Cepat cairkan ya.",
          "t2",
        ),
        good(
          "c",
          "Coba tarik sebagian dulu tanpa bayar",
          "Sistem baru bisa tarik setelah pajak dibayar.",
          "t2",
          "Penarikan harus bayar dulu",
        ),
      ],
    ),
    t2: turn(
      ["Sayang, percaya aku dong. Aku nggak akan menipumu ❤️ Ini sertifikat izin perusahaannya 📄"],
      [
        fatal(
          "a",
          "Aku percaya, kubayar sekarang",
          "Kedekatan emosional dipakai untuk menutup keraguanmu.",
          "Makasih sayang ❤️",
        ),
        slip(
          "b",
          "Kucek sertifikat dari file ini",
          "Lihat kan, resmi! Yuk bayar.",
          "t3",
        ),
        good(
          "c",
          "Aku cek izinnya langsung di situs OJK",
          "Kamu nggak percaya aku? 😢",
          "t3",
          "Tersinggung saat dicek",
        ),
      ],
    ),
    t3: turn(["Besok saldo dibekukan dan pajaknya naik jadi 20%. Bayar hari ini ya sayang."], [
      fatal(
        "a",
        "Baik, kubayar hari ini",
        "Tenggat dan kenaikan pajak adalah tekanan buatan.",
        "Terima kasih sayang!",
      ),
      fatal(
        "b",
        "Kupinjam dulu ke temanku",
        "Berutang demi saldo palsu memperparah kerugian.",
        "Cepat ya sayang!",
      ),
      exit(
        "c",
        "Aku berhenti, simpan bukti, dan lapor ke bank",
        "Kamu menghentikan transfer dan melapor, langkah terpenting dalam penipuan investasi.",
      ),
    ]),
  }),

  /* ===== LEVEL 10 ===== */
  defineLevel({
    id: "trust-10",
    level: 10,
    difficulty: "Ahli",
    topic: "Salah transfer palsu (rekening perantara)",
    title: "“Salah Transfer” yang Uangnya Benar-benar Masuk",
    description: "Seseorang minta uang yang katanya salah transfer dikembalikan. Saat dicek, uangnya memang masuk.",
    sender: { name: "Bu Ratna", status: "online" },
    takeaway: "Uang salah transfer diurus lewat bank, bukan dikembalikan sendiri ke rekening lain.",
    t1: turn(
      [
        "Maaf Kak, saya salah transfer Rp3.200.000 ke rekening Kakak 🙏",
        "Tolong dikembalikan ya. Ini bukti transfernya 📸",
      ],
      [
        fatal(
          "a",
          "Oke, kukembalikan sekarang",
          "Uang itu bisa berasal dari korban lain. Kamu jadi perantara tanpa sadar.",
          "Terima kasih Kak, ini rekening saya.",
        ),
        slip(
          "b",
          "Kalau memang masuk, kukembalikan ke rekeningmu",
          "Sudah masuk kan Kak? Tolong ke rekening baru ini, yang lama bermasalah.",
          "t2",
        ),
        good(
          "c",
          "Aku cek mutasi dan hubungi bank soal salah transfer",
          "Tidak usah ke bank Kak, ribet. Langsung kembalikan saja!",
          "t2",
          "Melarang lapor ke bank",
        ),
      ],
    ),
    t2: turn(
      ["Tolong ke rekening BARU ini (a.n. Budi), rekeningku lagi diblokir. Itu uang buat biaya rumah sakit."],
      [
        fatal(
          "a",
          "Baik, kukirim ke rekening baru itu",
          "Rekening berbeda atas nama orang lain adalah tanda perantara penipuan.",
          "Terima kasih Kak.",
        ),
        slip(
          "b",
          "Kukirim setengah dulu, sisanya nanti",
          "Terima kasih, sisanya segera ya.",
          "t3",
        ),
        good(
          "c",
          "Pengembalian resmi harus lewat bank",
          "Bank prosesnya lama! Kasihani saya.",
          "t3",
          "Rekening pengembalian berbeda",
        ),
      ],
    ),
    t3: turn(["Kalau tidak dikembalikan sekarang, saya laporkan Kakak ke polisi!"], [
      fatal(
        "a",
        "Baik, kukembalikan supaya tidak dilapor",
        "Ancaman lapor dipakai agar kamu menyerah.",
        "Nah begitu dong.",
      ),
      fatal(
        "b",
        "Kukirim ke rekening itu, tapi minta maaf",
        "Meminta maaf tidak mengubah fakta kamu mengirim uang ke rekening perantara.",
        "Terima kasih.",
      ),
      exit(
        "c",
        "Silakan lapor. Bank sudah kuhubungi, dana tidak kupindahkan",
        "Kamu tidak memindahkan dana dan menyerahkannya ke jalur resmi bank.",
      ),
    ]),
  }),
];