import type { SimulationScenario } from "@/types/learning-protection/index";

function defineScenario(
  scenario: Omit<SimulationScenario, "context"> & { context?: string },
): SimulationScenario {
  return {
    ...scenario,
    context: scenario.context ?? scenario.messages?.join("\n\n") ?? "",
  };
}

export const trustLabScenarios: SimulationScenario[] = [
  /* ===== LEVEL 1 ===== */
  defineScenario({
    id: "trust-1",
    level: 1,
    difficulty: "Mudah",
    topic: "Lowongan kerja palsu",
    title: "Lowongan Kerja Online",
    description: "Seseorang menghubungimu lewat WhatsApp soal pekerjaan.",
    sender: { name: "HRD Remote Karier", status: "akun bisnis" },
    messages: [
      "Halo! Selamat, kamu terpilih sebagai kandidat kerja remote kami 🎉",
      "Gaji Rp500.000–Rp1.000.000 per hari, cukup dari HP. Untuk mengaktifkan akun pekerja, bayar biaya administrasi Rp75.000. Apakah kamu bersedia?",
    ],
    choices: [
      {
        id: "a",
        label: "Membayar biaya administrasi agar bisa mulai bekerja.",
        isSafe: false,
        feedback: "Hati-hati! Ini pola klasik penipuan lowongan kerja.",
        explanation:
          "Perusahaan sungguhan tidak memungut biaya dari pelamar. Gaji tinggi dan proses mudah dipakai sebagai umpan agar korban membayar.",
        saferAction:
          "Periksa perusahaan lewat situs dan kanal resminya. Jangan membayar apa pun untuk mendapatkan pekerjaan.",
        reply:
          "Terima kasih! Transfer ke rekening berikut ya, lalu kirim bukti bayarnya 🙏",
      },
      {
        id: "b",
        label: "Memeriksa identitas perusahaan dan lowongan lewat kanal resminya.",
        isSafe: true,
        feedback: "Keputusan bagus! Kamu tidak langsung percaya.",
        explanation:
          "Verifikasi perusahaan adalah langkah pertama sebelum memberi data atau uang kepada siapa pun.",
        saferAction:
          "Cari situs resmi perusahaan dan hubungi kontak yang tercantum di sana, bukan kontak dari pesan tadi.",
      },
      {
        id: "c",
        label: "Mengirim foto KTP dan nomor rekening dulu supaya diproses.",
        isSafe: false,
        feedback: "Jangan terburu-buru memberikan data pribadi.",
        explanation:
          "KTP dan data rekening dapat dipakai untuk membuka pinjaman, akun palsu, atau penipuan atas namamu.",
        saferAction:
          "Pastikan perusahaan dan proses rekrutmennya valid sebelum memberikan data apa pun.",
        reply:
          "Siap! Kirim juga foto selfie sambil memegang KTP-mu ya untuk verifikasi.",
      },
    ],
  }),

  /* ===== LEVEL 2 ===== */
  defineScenario({
    id: "trust-2",
    level: 2,
    difficulty: "Mudah",
    topic: "Bonus palsu & tekanan waktu",
    title: "Bonus Saldo Dompet Digital",
    description: "Seseorang yang mengaku admin promo menghubungimu.",
    sender: { name: "Admin Promo Dompetku", status: "akun bisnis" },
    messages: [
      "Akun kamu mendapatkan bonus Rp2.000.000! 🎁",
      "Top-up Rp100.000 dulu untuk mengaktifkan bonus. Bonus hangus dalam 10 menit jika tidak segera diklaim!",
    ],
    choices: [
      {
        id: "a",
        label: "Segera top-up sebelum bonus hangus.",
        isSafe: false,
        feedback: "Waspada! Kamu sedang ditekan untuk memutuskan cepat.",
        explanation:
          "Batas waktu singkat dan hadiah besar adalah teknik tekanan psikologis agar korban tidak sempat berpikir.",
        saferAction:
          "Jangan membayar. Periksa info bonus lewat aplikasi resmi yang kamu buka sendiri.",
        reply:
          "Pilihan tepat! Transfer sekarang ya, waktunya tinggal 4 menit ⏰",
      },
      {
        id: "b",
        label: "Memeriksa informasi bonus lewat aplikasi resmi.",
        isSafe: true,
        feedback: "Tepat! Kamu memverifikasi dulu.",
        explanation:
          "Promo yang asli bisa dicek di dalam aplikasi atau situs resmi penyedia layanan.",
        saferAction:
          "Abaikan pesan tadi dan hubungi layanan pelanggan resmi bila perlu.",
      },
      {
        id: "c",
        label: "Menawar: minta bonus dicairkan dulu, baru top-up.",
        isSafe: false,
        feedback: "Menawar tidak mengubah jebakannya.",
        explanation:
          "Penipu bisa pura-pura setuju lalu tetap meminta uang. Menawar hanya memperpanjang percakapan di bawah tekanan.",
        saferAction:
          "Hentikan percakapan dan verifikasi lewat aplikasi resmi, bukan lewat chat ini.",
        reply:
          "Boleh Kak, tapi sistem butuh Rp50.000 dulu untuk verifikasi. Cepat ya, tinggal 7 menit!",
      },
    ],
  }),

  /* ===== LEVEL 3 ===== */
  defineScenario({
    id: "trust-3",
    level: 3,
    difficulty: "Mudah",
    topic: "File APK berbahaya",
    title: "Paket Tertahan",
    description: "Pesan dari nomor yang mengaku kurir ekspedisi.",
    sender: { name: "Info Paket KilatExpress", status: "akun bisnis" },
    messages: [
      "📦 Paket atas namamu tertahan di gudang karena alamat kurang lengkap.",
      "Lihat foto paket dan konfirmasi alamat lewat file berikut:",
      "📎 Foto_Paket_KilatExpress.apk (4,2 MB)",
    ],
    choices: [
      {
        id: "a",
        label: "Mengunduh dan membuka file itu untuk melihat paketnya.",
        isSafe: false,
        feedback: "Bahaya! File .apk bukan foto, melainkan aplikasi.",
        explanation:
          "APK dari chat adalah aplikasi yang dipasang di luar toko resmi. Aplikasi seperti ini dapat membaca SMS (termasuk OTP), notifikasi, dan mengambil alih m-banking.",
        saferAction:
          "Jangan pasang file tersebut. Cek status paket lewat aplikasi atau situs resmi kurir dengan nomor resi milikmu.",
        reply:
          "Setelah terpasang, izinkan semua akses yang diminta ya Kak, supaya foto paketnya muncul.",
      },
      {
        id: "b",
        label:
          "Tidak membuka file; cek paket lewat aplikasi atau situs resmi kurir dengan nomor resimu.",
        isSafe: true,
        feedback: "Tepat! Kamu tidak memasang file dari chat.",
        explanation:
          "Kurir sungguhan tidak mengirim foto paket dalam bentuk file aplikasi. Resi bisa dicek lewat kanal resmi.",
        saferAction:
          "Blokir dan laporkan nomor pengirim. Jika sudah telanjur memasang, putuskan internet dan hubungi bank.",
      },
      {
        id: "c",
        label: "Memasang file itu tapi menolak semua izin yang diminta.",
        isSafe: false,
        feedback: "Memasang saja sudah berisiko.",
        explanation:
          "Aplikasi berbahaya sering memaksa izin tambahan atau memakai fitur aksesibilitas untuk mengendalikan ponsel.",
        saferAction:
          "Jangan pasang aplikasi dari file yang dikirim lewat chat, apa pun alasannya.",
        reply: "Kalau layar minta 'Aktifkan Aksesibilitas', setujui saja ya Kak.",
      },
    ],
  }),

  /* ===== LEVEL 4 ===== */
  defineScenario({
    id: "trust-4",
    level: 4,
    difficulty: "Menengah",
    topic: "Penyamaran keluarga",
    title: "Nomor Baru Adikmu",
    description: "Nomor tak dikenal mengaku sebagai adikmu.",
    sender: { name: "+62 857-3391-0142", status: "nomor baru" },
    messages: [
      "Kak, ini aku Dimas 🙏 HP lamaku rusak, ini nomor baruku ya.",
      "Aku lagi buru-buru bayar vendor, tapi m-banking belum bisa dipakai di HP baru. Bisa transferin Rp1.850.000 ke rekening temanku dulu? Nanti malam kuganti, janji.",
    ],
    choices: [
      {
        id: "a",
        label: "Langsung transfer karena ini adikmu dan dia terdengar buru-buru.",
        isSafe: false,
        feedback: "Jangan mengambil keputusan hanya karena ada urgensi.",
        explanation:
          "Pelaku memakai nama keluarga dan alasan HP rusak agar kamu tidak sempat memverifikasi.",
        saferAction:
          "Hubungi nomor lama adikmu atau keluarga lain untuk memastikan sebelum mentransfer.",
        reply:
          "Makasih banget Kak! Ini rekeningnya: 7712 3345 a.n. Rudi Hartono. Kirim buktinya ya 🙏",
      },
      {
        id: "b",
        label:
          "Menanyakan lewat chat 'Kamu siapa?' dan percaya jika jawabannya cocok.",
        isSafe: false,
        feedback: "Jawaban lewat chat mudah ditebak atau dicari.",
        explanation:
          "Nama, panggilan, dan kebiasaan keluarga sering bisa ditemukan dari media sosial. Cocok di chat bukan bukti.",
        saferAction:
          "Verifikasi lewat telepon ke nomor lama atau lewat anggota keluarga lain.",
        reply:
          "Ya ampun Kak, masa lupa sama adik sendiri 😅 Dimas lah! Cepetan ya transfernya.",
      },
      {
        id: "c",
        label:
          "Menelepon nomor Dimas yang lama atau menghubungi keluarga lain untuk memastikan.",
        isSafe: true,
        feedback: "Bagus! Kamu memakai jalur yang sudah kamu percaya.",
        explanation:
          "Menghubungi lewat nomor lama atau orang lain adalah cara paling andal membuktikan identitas.",
        saferAction:
          "Jangan transfer sebelum identitas terbukti. Simpan nomor baru hanya setelah terkonfirmasi.",
      },
      {
        id: "d",
        label: "Transfer sebagian saja dulu (Rp500.000) sambil menunggu penjelasan.",
        isSafe: false,
        feedback: "Mentransfer sebagian tetap berarti kehilangan uang.",
        explanation:
          "Uang yang sudah terkirim sulit ditarik, dan pelaku biasanya lanjut meminta tambahan.",
        saferAction: "Pastikan identitas dulu, baru pertimbangkan membantu.",
        reply:
          "Kak, kurang segitu. Masih kurang Rp1.350.000 nih, tolong ya, vendornya nunggu.",
      },
    ],
  }),

  /* ===== LEVEL 5 ===== */
  defineScenario({
    id: "trust-5",
    level: 5,
    difficulty: "Menengah",
    topic: "Penipuan tugas online (task scam)",
    title: "Komisi Pertama Benar-benar Cair",
    description:
      "Kemarin kamu iseng ikut kerja sampingan 'like & subscribe', dan komisi Rp45.000 benar-benar masuk ke rekeningmu.",
    sender: { name: "Admin Tugas Harian", status: "online" },
    messages: [
      "Halo Kak! Komisi 3 tugas kemarin sudah cair Rp45.000 ya ✅",
      "Hari ini Kakak naik ke TUGAS PREMIUM. Setor dulu Rp500.000 sebagai modal tugas, komisinya Rp750.000 langsung cair hari ini. Slot tinggal 2 orang!",
    ],
    choices: [
      {
        id: "a",
        label: "Ikut karena komisi pertama terbukti cair.",
        isSafe: false,
        feedback: "Justru komisi kecil itulah umpannya.",
        explanation:
          "Pelaku sengaja membayar kecil di awal untuk membangun kepercayaan, lalu meminta setoran besar yang tidak akan kembali.",
        saferAction:
          "Berhenti. Pekerjaan sungguhan tidak meminta setoran modal dari pekerjanya.",
        reply:
          "Mantap Kak! Setor ke rekening ini, lalu kirim bukti transfer agar tugas dibuka.",
      },
      {
        id: "b",
        label: "Setor jumlah kecil dulu (Rp100.000) untuk menguji.",
        isSafe: false,
        feedback: "Menguji dengan uang kecil tetap masuk perangkap.",
        explanation:
          "Setoran kecil membuatmu makin terlibat. Biasanya muncul alasan baru untuk setor lebih banyak sebelum dana 'bisa dicairkan'.",
        saferAction:
          "Jangan menyetor sama sekali. Simpan bukti chat dan transaksi.",
        reply:
          "Tugas bisa dibuka mulai Rp300.000 Kak, tapi komisinya turun jadi Rp450.000 ya.",
      },
      {
        id: "c",
        label:
          "Berhenti, tidak menyetor, dan menyimpan bukti chat sebagai arsip laporan.",
        isSafe: true,
        feedback: "Tepat! Kamu mengenali pola umpan lalu setoran.",
        explanation:
          "Komisi pertama cair + permintaan setoran lebih besar adalah ciri khas penipuan tugas online.",
        saferAction:
          "Laporkan akun ke platform pesan dan, bila sudah menyetor, segera hubungi bank dan layanan pengaduan resmi.",
      },
      {
        id: "d",
        label: "Mengajak temanmu ikut agar dapat bonus rujukan.",
        isSafe: false,
        feedback: "Kamu justru menyeret orang lain ke penipuan.",
        explanation:
          "Skema rujukan dipakai untuk memperluas korban. Orang yang kamu ajak bisa rugi dan kamu ikut kehilangan kepercayaan mereka.",
        saferAction:
          "Jangan mengajak siapa pun. Peringatkan teman dan keluarga tentang modus ini.",
        reply:
          "Wah mantap, bonus rujukan Rp50.000 per orang! Kirim kontak temanmu ya.",
      },
    ],
  }),

  /* ===== LEVEL 6 ===== */
  defineScenario({
    id: "trust-6",
    level: 6,
    difficulty: "Menengah",
    topic: "Pengambilalihan akun WhatsApp",
    title: "Kode yang Salah Kirim",
    description:
      "Pesan datang dari kontak yang kamu kenal, tetapi akunnya mungkin sudah diambil alih.",
    sender: { name: "Rina Kantor", status: "online" },
    messages: [
      "Eh, ini Rina. Tadi ada kode verifikasi masuk ke nomormu ya? Itu salah kirim, harusnya ke HP-ku 😅",
      "Tolong ketikin 6 digit kodenya ke sini, cepetan ya aku lagi rapat, akunku keburu terkunci 🙏",
    ],
    choices: [
      {
        id: "a",
        label: "Mengirim kode karena yang meminta temanmu sendiri.",
        isSafe: false,
        feedback: "Akunmu bisa langsung diambil alih.",
        explanation:
          "Kode itu sebenarnya dikirim ke nomormu karena penyerang sedang mencoba masuk ke akun WhatsApp-mu. Akun temanmu kemungkinan sudah dikuasai.",
        saferAction:
          "Jangan kirim kode apa pun. Telepon Rina langsung untuk memastikan.",
        reply: "Makasih ya! Sebentar, aku masukin dulu...",
      },
      {
        id: "b",
        label: "Mengirim hanya 3 digit pertama sebagai tanda bantu.",
        isSafe: false,
        feedback: "Sebagian kode tetap berbahaya.",
        explanation:
          "Penyerang bisa menebak sisanya atau meminta sisanya di pesan berikutnya. Kode verifikasi tidak boleh dibagikan sebagian pun.",
        saferAction: "Jangan bagikan digit apa pun dari kode tersebut.",
        reply: "Kurang 3 digit lagi nih, tolong lanjutin ya, tinggal dikit!",
      },
      {
        id: "c",
        label:
          "Tidak mengirim kode, menelepon Rina langsung, lalu mengaktifkan verifikasi dua langkah.",
        isSafe: true,
        feedback: "Sempurna! Kamu menutup celah akunmu.",
        explanation:
          "Menelepon memastikan siapa yang sebenarnya menulis. Verifikasi dua langkah (PIN) mempersulit pengambilalihan akun.",
        saferAction:
          "Beritahu Rina lewat telepon bahwa akunnya kemungkinan diretas, dan minta ia memulihkan akunnya.",
      },
    ],
  }),

  /* ===== LEVEL 7 ===== */
  defineScenario({
    id: "trust-7",
    level: 7,
    difficulty: "Sulit",
    topic: "Akun layanan pelanggan palsu",
    title: "CS Resmi yang Menghampirimu",
    description:
      "Kamu baru mengeluh di media sosial soal refund pesanan yang belum cair, lalu sebuah akun mengirim DM.",
    sender: { name: "BelanjaKu Care Official", status: "centang biru • akun bisnis" },
    messages: [
      "Halo Kak, kami melihat keluhan Kakak di media sosial. Mohon maaf atas ketidaknyamanannya 🙏",
      "Refund Rp389.000 siap kami proses sekarang. Silakan verifikasi di refund-belanjaku-care.example lalu masukkan kode 6 digit yang kami kirim lewat SMS agar dana langsung masuk.",
    ],
    choices: [
      {
        id: "a",
        label: "Percaya dan mengikuti karena akunnya bercentang biru dan namanya mirip resmi.",
        isSafe: false,
        feedback: "Centang dan nama mirip bukan bukti.",
        explanation:
          "Centang bisa dibeli atau ditiru, dan nama akun mudah dibuat mirip. Kode SMS yang diminta kemungkinan OTP untuk membobol akunmu.",
        saferAction:
          "Gunakan pusat bantuan di dalam aplikasi resmi. Abaikan dan laporkan akun DM tersebut.",
        reply:
          "Terima kasih Kak, kode sudah kami terima. Mohon tunggu 5 menit ya 🙏",
      },
      {
        id: "b",
        label: "Membuka tautan hanya untuk melihat, tanpa memasukkan kode.",
        isSafe: false,
        feedback: "Risikonya sudah mulai saat tautan dibuka.",
        explanation:
          "Halaman palsu bisa meminta data, mengarahkan ke unduhan berbahaya, atau menyalin informasi perangkatmu.",
        saferAction:
          "Jangan buka tautan dari DM. Buka aplikasi resmi yang kamu pasang sendiri.",
        reply: "Sudah terbuka Kak? Silakan isi kolom kode di bagian bawah ya.",
      },
      {
        id: "c",
        label: "Mengirim nomor pesanan dan nama lengkap agar 'CS' bisa mengecek.",
        isSafe: false,
        feedback: "Data pesananmu membuat penipu makin meyakinkan.",
        explanation:
          "Nomor pesanan dan nama dipakai untuk tampil kredibel di langkah berikutnya, misalnya saat menelepon atau meminta kode.",
        saferAction:
          "Jangan beri data apa pun ke akun yang menghubungimu duluan.",
        reply:
          "Terima kasih Kak. Pesanan ditemukan. Untuk lanjut, mohon kirimkan kode yang masuk ke SMS-mu.",
      },
      {
        id: "d",
        label:
          "Mengabaikan DM, membuka aplikasi marketplace, dan memeriksa refund lewat pusat bantuan resmi di dalamnya.",
        isSafe: true,
        feedback: "Tepat! Kamu memakai kanal yang kamu buka sendiri.",
        explanation:
          "Layanan resmi tidak meminta kode SMS lewat DM. Status refund selalu bisa dicek di dalam aplikasi.",
        saferAction:
          "Laporkan akun DM sebagai penipuan dan hindari menanggapi akun yang menghubungimu lebih dulu.",
      },
    ],
  }),

  /* ===== LEVEL 8 ===== */
  defineScenario({
    id: "trust-8",
    level: 8,
    difficulty: "Sulit",
    topic: "Kloning suara dengan AI",
    title: "Suara yang Terdengar Persis Adikmu",
    description:
      "Kamu menerima pesan suara yang terdengar persis seperti adikmu, panik dan terisak.",
    sender: { name: "+62 821-6620-7715", status: "online" },
    messages: [
      "🎤 Pesan suara 0:12 (suara adikmu terdengar panik dan terisak)",
      "Kak, aku kecelakaan, motorku nabrak orang. Aku di klinik dan mereka minta DP Rp3.000.000 sekarang. HP-ku rusak, ini pakai HP orang. Tolong transfer ke rekening klinik ya, cepat Kak 😭",
    ],
    choices: [
      {
        id: "a",
        label: "Langsung transfer karena suaranya benar-benar suara adikmu.",
        isSafe: false,
        feedback: "Suara yang mirip bukan bukti identitas.",
        explanation:
          "Suara kini bisa ditiru AI hanya dari potongan video pendek di media sosial. Rasa panik sengaja dibuat agar kamu tidak sempat memeriksa.",
        saferAction:
          "Hubungi adikmu lewat nomor yang biasa atau keluarga lain sebelum mentransfer apa pun.",
        reply: "Makasih Kak, cepat ya, dokternya sudah menunggu 🙏",
      },
      {
        id: "b",
        label: "Meminta foto selfie dan KTP-nya sebagai bukti.",
        isSafe: false,
        feedback: "Foto dan dokumen juga bisa dipalsukan.",
        explanation:
          "Pelaku dapat memakai foto curian dari akun korban atau gambar buatan AI. Dokumen yang dikirim lewat chat bukan verifikasi sungguhan.",
        saferAction:
          "Verifikasi lewat telepon ke nomor adikmu yang lama atau lewat keluarga lain.",
        reply: "Ini fotonya Kak 📸 Sekarang tolong transfer ya, waktunya mepet.",
      },
      {
        id: "c",
        label: "Transfer separuh dulu (Rp1.500.000), sisanya setelah ada kabar.",
        isSafe: false,
        feedback: "Uang yang terkirim sulit ditarik kembali.",
        explanation:
          "Setelah satu transfer berhasil, pelaku biasanya meminta tambahan dengan alasan biaya lain.",
        saferAction:
          "Jangan transfer sebelum kamu mengonfirmasi kejadian lewat jalur terpercaya.",
        reply: "Masih kurang Kak, dokternya minta sisanya sekarang juga 😭",
      },
      {
        id: "d",
        label:
          "Menutup chat, menelepon nomor adikmu yang biasa atau menghubungi keluarga lain, dan memakai kata sandi keluarga bila ada.",
        isSafe: true,
        feedback: "Luar biasa! Kamu mematahkan tekanan emosional.",
        explanation:
          "Menghubungi lewat jalur lain adalah cara paling andal. Kata sandi keluarga yang disepakati sebelumnya tidak bisa ditiru AI.",
        saferAction:
          "Sepakati kata sandi keluarga untuk situasi darurat, dan hubungi klinik langsung lewat nomor yang kamu cari sendiri.",
      },
    ],
  }),

  /* ===== LEVEL 9 ===== */
  defineScenario({
    id: "trust-9",
    level: 9,
    difficulty: "Ahli",
    topic: "Investasi AI dan hubungan emosional",
    title: "Saldo Besar yang Tidak Bisa Ditarik",
    description:
      "Tiga minggu kamu mengobrol dengan Kevin dari aplikasi kencan. Ia mengajakmu menaruh Rp2.000.000 di platform trading AI, dan kini saldo di aplikasi tampak membengkak.",
    sender: { name: "Kevin", status: "kenalan dari aplikasi kencan" },
    messages: [
      "Udah lihat saldomu di NovaTrade AI? Sekarang Rp12.400.000 loh 🎉 Bot AI-nya lagi bagus banget minggu ini.",
      "Biar bisa ditarik, ada pajak keuntungan 10% (Rp1.240.000) yang harus dibayar dulu ke rekening perusahaan. Setelah itu langsung cair ke rekeningmu hari ini.",
    ],
    choices: [
      {
        id: "a",
        label: "Membayar pajak Rp1.240.000 supaya saldo cair.",
        isSafe: false,
        feedback: "Ini jebakan biaya penarikan yang tidak ada ujungnya.",
        explanation:
          "Biaya 'pajak', 'verifikasi', atau 'denda' sebelum penarikan adalah pola khas. Setelah dibayar, biasanya muncul biaya baru lagi.",
        saferAction:
          "Berhenti membayar. Saldo di aplikasi hanyalah angka yang bisa dibuat siapa saja.",
        reply:
          "Bagus! Tinggal biaya verifikasi akun 2%, itu yang terakhir ya sayang 😘",
      },
      {
        id: "b",
        label: "Meminjam uang (termasuk pinjol) untuk membayar pajak karena saldonya sudah besar.",
        isSafe: false,
        feedback: "Berutang demi saldo palsu memperparah kerugian.",
        explanation:
          "Saldo di platform bukan uang nyata. Pinjaman, terutama pinjol ilegal, menambah beban dan risiko teror penagihan.",
        saferAction:
          "Jangan berutang. Hentikan semua transfer dan cari bantuan resmi.",
        reply: "Pintar! Cepat cairkan pinjamannya ya, slot penarikan hari ini terbatas.",
      },
      {
        id: "c",
        label: "Meminta Kevin mengirim bukti izin usaha dan legalitas platform.",
        isSafe: false,
        feedback: "Dokumen dari pihak yang sama tidak bisa dipercaya.",
        explanation:
          "Sertifikat dan izin sangat mudah dipalsukan. Legalitas harus diperiksa dari sumber otoritas, bukan dari orang yang menawarkannya.",
        saferAction:
          "Periksa legalitas langsung lewat kanal resmi regulator, bukan lewat dokumen yang dikirim Kevin.",
        reply:
          "Ini sertifikatnya sayang 📄 Udah percaya kan? Yuk bayar pajaknya sekarang.",
      },
      {
        id: "d",
        label:
          "Berhenti mentransfer, tidak membayar apa pun, menyimpan bukti, dan memeriksa legalitas platform lewat kanal resmi OJK.",
        isSafe: true,
        feedback: "Keputusan tepat dan berani!",
        explanation:
          "Hubungan emosional yang dibangun lama dan saldo besar adalah ciri penipuan investasi berkedok romansa. Menghentikan transfer adalah langkah paling penting.",
        saferAction:
          "Simpan bukti chat dan transaksi, hubungi bank secepatnya, dan laporkan lewat layanan pengaduan resmi seperti Indonesia Anti-Scam Centre (IASC).",
      },
    ],
  }),

  /* ===== LEVEL 10 ===== */
  defineScenario({
    id: "trust-10",
    level: 10,
    difficulty: "Ahli",
    topic: "Rekening aman & pemalsuan nomor telepon",
    title: "Telepon 'Bank' yang Tahu Segalanya",
    description:
      "Panggilan ini sangat meyakinkan: nomor yang tampil sama dengan kontak resmi, dan penelepon tahu data pribadimu.",
    sender: { name: "Contact Center Bank Nusantara", status: "nomor sama dengan kontak resmi" },
    messages: [
      "📞 Panggilan masuk. Nomor yang tampil sama dengan Contact Center Bank Nusantara di kartumu.",
      "Selamat sore. Saya Reza, Divisi Keamanan Bank Nusantara. Kartu berakhiran 4821 milik Anda terdeteksi dipakai transaksi di luar negeri.",
      "Dana Anda dalam bahaya. Untuk mengamankannya, pindahkan saldo ke 'rekening aman' Bank Nusantara Escrow sekarang. Dana dikembalikan setelah investigasi selesai.",
    ],
    choices: [
      {
        id: "a",
        label: "Memindahkan dana ke 'rekening aman' agar uangmu terlindungi.",
        isSafe: false,
        feedback: "Rekening 'aman' itu milik penipu.",
        explanation:
          "Bank sungguhan tidak pernah meminta nasabah memindahkan dana ke rekening lain untuk 'diamankan'.",
        saferAction:
          "Jangan transfer. Tutup telepon dan hubungi bank lewat kanal yang kamu buka sendiri.",
        reply:
          "Baik, silakan transfer sekarang. Setelah selesai, jangan tutup telepon sampai kami konfirmasi.",
      },
      {
        id: "b",
        label: "Percaya karena penelepon menyebut namamu dan 4 digit kartumu dengan benar.",
        isSafe: false,
        feedback: "Data yang benar bukan bukti penelepon adalah bank.",
        explanation:
          "Data pribadi sering bocor atau diperjualbelikan ilegal. Penipu memakainya agar terdengar sah.",
        saferAction:
          "Anggap panggilan itu belum terbukti. Hubungi bank lewat nomor yang kamu cari sendiri.",
        reply:
          "Benar Bapak/Ibu, data kami lengkap. Mari segera amankan dananya sebelum terlambat.",
      },
      {
        id: "c",
        label: "Percaya karena nomor yang tampil sama dengan nomor resmi bank.",
        isSafe: false,
        feedback: "Nomor penelepon bisa dipalsukan.",
        explanation:
          "Teknik pemalsuan nomor (spoofing) membuat panggilan tampak berasal dari nomor resmi. Tampilan layar bukan bukti.",
        saferAction:
          "Tutup panggilan, lalu hubungi bank sendiri lewat aplikasi atau nomor di belakang kartu.",
        reply: "Seperti yang Anda lihat, ini nomor resmi kami. Mohon segera ikuti prosedurnya.",
      },
      {
        id: "d",
        label:
          "Menutup telepon, lalu menghubungi bank lewat nomor di aplikasi atau belakang kartu yang kamu buka sendiri; blokir kartu dari aplikasi bila ragu.",
        isSafe: true,
        feedback: "Level tertinggi, dan kamu melewatinya dengan benar!",
        explanation:
          "Penelepon yang membuktikan dirinya lewat data dan nomor tetap bisa palsu. Satu-satunya verifikasi andal adalah menghubungi bank sendiri lewat kanal yang kamu pilih.",
        saferAction:
          "Bank tidak akan meminta memindahkan dana ke 'rekening aman'. Blokir kartu lewat aplikasi bila khawatir, dan laporkan percobaan penipuan ke bank.",
      },
    ],
  }),
];