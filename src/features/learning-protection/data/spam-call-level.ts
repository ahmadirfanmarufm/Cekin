import type { SimulationScenario } from "@/types/learning-protection/index";

function defineScenario(
  scenario: Omit<SimulationScenario, "context"> & { context?: string },
): SimulationScenario {
  return {
    ...scenario,
    context: scenario.context ?? scenario.messages?.join("\n\n") ?? "",
  };
}

export const spamCallScenarios: SimulationScenario[] = [
  /* ===== LEVEL 1 ===== */
  defineScenario({
    id: "calls-1",
    level: 1,
    difficulty: "Mudah",
    topic: "Permintaan OTP",
    title: "Telepon Mengaku Petugas Bank",
    description: "Seseorang mengaku petugas keamanan bank dan menyebut ada transaksi mencurigakan.",
    sender: { name: "Nomor Tidak Dikenal", status: "+62 812-0000-0101" },
    messages: [
      "Selamat siang. Saya petugas keamanan bank. Kami mendeteksi transaksi mencurigakan pada rekening Anda.",
      "Untuk membatalkannya, mohon sebutkan kode OTP yang baru saja dikirimkan ke ponsel Anda.",
    ],
    choices: [
      {
        id: "a",
        label: "Menyebutkan kode OTP agar transaksi dibatalkan.",
        isSafe: false,
        feedback: "Jangan pernah membagikan kode OTP kepada siapa pun.",
        explanation:
          "OTP adalah kunci rahasia. Dengan kode itu pelaku bisa masuk ke akunmu atau menyetujui transaksi atas namamu.",
        saferAction:
          "Akhiri panggilan dan hubungi bank lewat nomor resmi di kartu atau aplikasi.",
        reply: "Terima kasih. Mohon sebutkan 6 digitnya sekarang, waktunya terbatas.",
      },
      {
        id: "b",
        label:
          "Menolak memberi OTP, mengakhiri panggilan, lalu menghubungi bank lewat nomor resminya.",
        isSafe: true,
        feedback: "Bagus! Kamu melindungi kode autentikasi.",
        explanation:
          "Petugas resmi tidak meminta OTP, PIN, atau kata sandi lewat telepon.",
        saferAction:
          "Cek transaksi lewat aplikasi bank yang kamu buka sendiri.",
        reply: "Bapak/Ibu, transaksinya akan lolos kalau tidak segera dibatalkan!",
      },
      {
        id: "c",
        label: "Meminta penelepon mengirim tautan verifikasi.",
        isSafe: false,
        feedback: "Jangan mengikuti tautan dari penelepon yang belum terverifikasi.",
        explanation:
          "Tautan bisa mengarah ke situs palsu yang dirancang untuk mencuri data dan kode.",
        saferAction:
          "Gunakan aplikasi atau situs bank yang kamu buka sendiri.",
        reply:
          "Baik, tautannya kami kirim lewat WhatsApp. Isi data kartu dan kode yang masuk ya.",
      },
    ],
  }),

  /* ===== LEVEL 2 ===== */
  defineScenario({
    id: "calls-2",
    level: 2,
    difficulty: "Mudah",
    topic: "Rekaman otomatis (robocall)",
    title: "Rekaman: Nomormu Akan Diblokir",
    description: "Panggilan berupa suara rekaman yang menyuruhmu menekan tombol.",
    sender: { name: "Layanan Pelanggan", status: "+62 21-0000-0202" },
    messages: [
      "🔊 Rekaman otomatis: “Perhatian. Nomor Anda akan diblokir dalam 2 jam karena verifikasi data belum dilakukan.”",
      "🔊 “Tekan 1 untuk berbicara dengan petugas dan menyelamatkan nomor Anda.”",
    ],
    choices: [
      {
        id: "a",
        label: "Menekan 1 supaya nomormu tidak diblokir.",
        isSafe: false,
        feedback: "Menekan tombol menandakan nomormu aktif dan mudah ditekan.",
        explanation:
          "Rekaman massal sengaja menakut-nakuti. Responsmu membuktikan nomor aktif dan menyambungkanmu ke penipu.",
        saferAction:
          "Tutup panggilan. Cek status nomor lewat aplikasi atau layanan resmi operatormu.",
        reply:
          "Selamat datang. Untuk verifikasi, sebutkan nama lengkap dan nomor KTP Anda.",
      },
      {
        id: "b",
        label:
          "Menutup panggilan dan mengecek status nomor lewat aplikasi atau situs resmi operatormu.",
        isSafe: true,
        feedback: "Tepat! Kamu tidak merespons rekaman massal.",
        explanation:
          "Operator resmi tidak memblokir nomor lewat rekaman yang menyuruh menekan tombol.",
        saferAction:
          "Blokir nomor penelepon dan laporkan sebagai spam.",
        reply: "Tut... tut... Panggilan berakhir.",
      },
      {
        id: "c",
        label: "Menyimpan nomornya lalu menelepon balik untuk memastikan.",
        isSafe: false,
        feedback: "Menelepon balik nomor itu sama saja menghubungi pelaku.",
        explanation:
          "Nomor penipu bisa diarahkan ke operator palsu yang sama. Verifikasi harus lewat kanal yang kamu cari sendiri.",
        saferAction:
          "Cari kontak resmi operator di situs atau aplikasinya, bukan dari nomor penelepon.",
        reply:
          "Terima kasih sudah menghubungi kami kembali. Sebutkan nomor KTP Anda untuk verifikasi.",
      },
    ],
  }),

  /* ===== LEVEL 3 ===== */
  defineScenario({
    id: "calls-3",
    level: 3,
    difficulty: "Mudah",
    topic: "Hadiah undian palsu",
    title: "Kamu “Memenangkan” Undian",
    description: "Penelepon mengabarkan hadiah besar yang tidak pernah kamu ikuti.",
    sender: { name: "Nomor Tidak Dikenal", status: "+62 813-0000-0303" },
    messages: [
      "Selamat! Nomor Anda terpilih sebagai pemenang undian loyalitas senilai Rp50.000.000.",
      "Hadiah akan dikirim hari ini. Anda hanya perlu mentransfer pajak hadiah Rp2.500.000 ke rekening resmi panitia.",
    ],
    choices: [
      {
        id: "a",
        label: "Mentransfer pajak hadiah agar hadiah segera dikirim.",
        isSafe: false,
        feedback: "Hadiah yang meminta bayaran di awal adalah penipuan.",
        explanation:
          "Pemenang undian asli tidak diminta mentransfer uang. Setelah kamu membayar, biasanya muncul biaya baru.",
        saferAction:
          "Jangan transfer. Cek keaslian undian lewat situs resmi penyelenggara.",
        reply:
          "Terima kasih! Setelah ini ada biaya asuransi pengiriman Rp1.200.000, ya.",
      },
      {
        id: "b",
        label:
          "Menolak, tidak mentransfer, dan memeriksa apakah undian itu ada di kanal resmi penyelenggara.",
        isSafe: true,
        feedback: "Tepat! Kamu tidak pernah ikut undian apa pun.",
        explanation:
          "Kamu tidak mendaftar undian, jadi klaim kemenangan itu tidak masuk akal. Pajak hadiah juga tidak dibayar ke rekening pribadi.",
        saferAction: "Blokir nomor dan laporkan sebagai penipuan.",
        reply: "Anda akan menyesal kehilangan hadiah ini!",
      },
      {
        id: "c",
        label: "Meminta penelepon mengirim bukti pemenang lewat WhatsApp.",
        isSafe: false,
        feedback: "Memindahkan percakapan ke WhatsApp memberi pelaku jalur baru.",
        explanation:
          "Sertifikat “pemenang” mudah dipalsukan, dan WhatsApp memudahkan pelaku mengirim tautan atau file berbahaya.",
        saferAction:
          "Kamu tidak perlu bukti dari pelaku. Periksa lewat kanal resmi.",
        reply:
          "Baik, saya kirim sertifikat pemenang. Tolong simpan nomor saya ini.",
      },
    ],
  }),

  /* ===== LEVEL 4 ===== */
  defineScenario({
    id: "calls-4",
    level: 4,
    difficulty: "Menengah",
    topic: "Kurir palsu dan pembatalan palsu",
    title: "Paket COD yang Tidak Pernah Kamu Pesan",
    description:
      "Penelepon mengaku kurir dan menyebut paket COD atas namamu, padahal kamu tidak sedang memesan apa pun.",
    sender: { name: "Kurir Ekspres", status: "+62 857-0000-0404" },
    messages: [
      "Selamat sore, ada paket COD atas nama Anda senilai Rp385.000, sudah sampai di depan.",
      "Kalau bukan Anda yang pesan, mohon konfirmasi pembatalan lewat tautan yang saya kirim, dan sebutkan NIK serta alamat lengkap untuk memproses pengembalian.",
    ],
    choices: [
      {
        id: "a",
        label: "Membuka tautan pembatalan dan mengisi NIK serta alamat.",
        isSafe: false,
        feedback: "Kamu justru menyerahkan data ke pelaku.",
        explanation:
          "Paket yang tidak dipesan dipakai untuk membuatmu panik, lalu mencuri data dan kode lewat tautan palsu.",
        saferAction:
          "Jangan membuka tautan. Periksa pesanan lewat aplikasi marketplace atau jasa kirim yang kamu buka sendiri.",
        reply:
          "Bagus. Mohon masukkan juga kode yang masuk ke SMS agar pembatalan berhasil.",
      },
      {
        id: "b",
        label: "Membayar COD saja agar cepat selesai.",
        isSafe: false,
        feedback: "Kamu membayar barang yang tidak pernah kamu pesan.",
        explanation:
          "Isi paket bisa kosong atau murah, dan pembayaran yang sudah terkirim sulit ditarik kembali.",
        saferAction:
          "Tolak paket yang tidak ada di daftar pesananmu.",
        reply:
          "Terima kasih. Silakan transfer ke rekening saya karena mesin EDC rusak.",
      },
      {
        id: "c",
        label:
          "Tidak mengisi apa pun, menolak paket, dan memeriksa pesanan lewat aplikasi marketplace atau jasa kirim yang kamu buka sendiri.",
        isSafe: true,
        feedback: "Tepat! Kamu memeriksa lewat jalurmu sendiri.",
        explanation:
          "Pesanan yang sah selalu tercatat di akunmu. Jika tidak ada, paket itu bukan milikmu.",
        saferAction:
          "Tolak paket di depan pintu dan laporkan modus ini ke jasa kirim.",
        reply: "Kalau ditolak, nanti Bapak/Ibu kena denda lho!",
      },
      {
        id: "d",
        label: "Menyebutkan NIK saja tanpa membuka tautan.",
        isSafe: false,
        feedback: "NIK tetap data yang sangat sensitif.",
        explanation:
          "NIK dan alamat sudah cukup untuk membuat pinjaman atau akun palsu atas namamu.",
        saferAction: "Jangan berikan NIK lewat telepon.",
        reply: "Terima kasih. Kami butuh juga nama ibu kandung untuk validasi.",
      },
    ],
  }),

  /* ===== LEVEL 5 ===== */
  defineScenario({
    id: "calls-5",
    level: 5,
    difficulty: "Menengah",
    topic: "Intimidasi dan isolasi korban",
    title: "Telepon dari “Polisi”",
    description:
      "Penelepon mengaku aparat dan menyebut identitasmu terseret kasus kejahatan.",
    sender: { name: "Nomor Tidak Dikenal", status: "+62 811-0000-0505" },
    messages: [
      "Selamat siang. Saya Iptu Rahman dari Direktorat Reserse Kriminal. Nomor ponsel dan KTP Anda terpakai untuk rekening judi online dan pencucian uang.",
      "Anda berstatus saksi kunci. Jangan memberitahu siapa pun, termasuk keluarga, karena penyelidikan bersifat rahasia.",
      "Kami akan memeriksa Anda lewat panggilan video. Segera siapkan KTP dan buku rekening Anda.",
    ],
    choices: [
      {
        id: "a",
        label: "Mengikuti arahan agar tidak ditahan.",
        isSafe: false,
        feedback: "Tekanan dan ancaman adalah senjata utama pelaku.",
        explanation:
          "Penipu menakuti korban dengan status hukum dan melarangnya bicara supaya tidak ada yang menyadarkannya.",
        saferAction:
          "Akhiri panggilan, lalu hubungi kantor polisi lewat kontak resmi yang kamu cari sendiri.",
        reply:
          "Bagus. Sekarang pindahkan saldo ke rekening pengamanan sementara untuk diaudit.",
      },
      {
        id: "b",
        label:
          "Menanyakan nama dan pangkat, lalu percaya jika dijawab dengan lancar.",
        isSafe: false,
        feedback: "Jawaban yang lancar bukan bukti.",
        explanation:
          "Nama, pangkat, dan istilah resmi mudah dihafal pelaku.",
        saferAction:
          "Verifikasi lewat nomor kantor polisi yang kamu cari sendiri.",
        reply:
          "Iptu Rahman, NRP 8x1xxxxx. Sudah jelas? Sekarang kita mulai video call.",
      },
      {
        id: "c",
        label:
          "Mengakhiri panggilan, menghubungi kantor polisi lewat kontak resmi, dan menceritakan kejadian ke keluarga.",
        isSafe: true,
        feedback: "Tepat! Kamu memutus isolasi dan mengecek sendiri.",
        explanation:
          "Aparat tidak memeriksa lewat telepon dengan ancaman, dan tidak melarangmu bicara dengan keluarga.",
        saferAction: "Simpan nomor penelepon dan laporkan sebagai percobaan penipuan.",
        reply: "Anda menghambat penyelidikan! Konsekuensinya akan berat.",
      },
      {
        id: "d",
        label: "Ikut panggilan video, tetapi tidak mentransfer uang apa pun.",
        isSafe: false,
        feedback: "Panggilan video tetap berbahaya.",
        explanation:
          "Wajah, KTP, dan rekening yang kamu tunjukkan bisa dipakai untuk mengambil alih akun atau membuat identitas palsu, dan tekanannya makin kuat.",
        saferAction:
          "Jangan ikut panggilan video dengan pihak yang menghubungimu lebih dulu.",
        reply: "Silakan nyalakan kamera, tunjukkan KTP dan buku tabungan Anda.",
      },
    ],
  }),

  /* ===== LEVEL 6 ===== */
  defineScenario({
    id: "calls-6",
    level: 6,
    difficulty: "Menengah",
    topic: "Teror penagihan pinjol",
    title: "Penagih Utang yang Tahu Namamu",
    description:
      "Kamu tidak pernah meminjam, tetapi penelepon menyebut nama lengkapmu dan mengancam menyebar datamu.",
    sender: { name: "Nomor Tidak Dikenal", status: "+62 878-0000-0606" },
    messages: [
      "Dengan Bapak/Ibu pemilik nomor ini? Anda memiliki tunggakan pinjaman Rp7.400.000 yang sudah jatuh tempo.",
      "Kalau hari ini tidak dilunasi, kami akan menelepon seluruh kontak Anda dan menyebarkan foto KTP Anda.",
    ],
    choices: [
      {
        id: "a",
        label: "Membayar “biaya pelunasan” Rp1.200.000 agar teror berhenti.",
        isSafe: false,
        feedback: "Membayar penagih palsu hanya mengundang tagihan baru.",
        explanation:
          "Pelaku jadi tahu kamu mudah ditekan, dan jumlah “utang” biasanya terus naik.",
        saferAction:
          "Jangan bayar. Periksa riwayat pinjamanmu lewat layanan resmi.",
        reply:
          "Pembayaran diterima sebagian. Sisanya Rp6.200.000 harus lunas besok.",
      },
      {
        id: "b",
        label: "Mengirim foto KTP untuk membuktikan bahwa itu bukan kamu.",
        isSafe: false,
        feedback: "Foto KTP justru memperbesar risiko penyalahgunaan.",
        explanation:
          "Kamu memberi pelaku data tambahan yang bisa dipakai untuk pemalsuan identitas.",
        saferAction: "Jangan kirim dokumen identitas ke penelepon mana pun.",
        reply: "Terima kasih, KTP kami terima. Mohon selfie sambil memegang KTP juga.",
      },
      {
        id: "c",
        label:
          "Tidak membayar atau memberi data, mengakhiri panggilan, lalu memeriksa riwayat pinjaman lewat layanan resmi dan melaporkan nomor penagih.",
        isSafe: true,
        feedback: "Tepat! Kamu tidak membayar utang yang tidak pernah ada.",
        explanation:
          "Ancaman menyebar data adalah alat tekanan, bukan konsekuensi sah. Penagihan dengan teror melanggar hukum.",
        saferAction:
          "Simpan bukti panggilan, beri tahu kontak dekat agar tidak termakan pesan susulan, dan laporkan ke layanan pengaduan resmi.",
        reply: "Kami sebar sekarang! Kontak Anda akan tahu semuanya.",
      },
      {
        id: "d",
        label: "Berdebat panjang dengan marah untuk membuktikan dirimu benar.",
        isSafe: false,
        feedback: "Berdebat memperpanjang kontak dan memberi pelaku informasi.",
        explanation:
          "Setiap kalimatmu bisa dipakai untuk mengonfirmasi bahwa nomor aktif dan menggali data.",
        saferAction: "Akhiri panggilan tanpa berdebat, lalu blokir nomornya.",
        reply: "Jadi Anda mengakui nomor ini milik Anda ya? Kami catat.",
      },
    ],
  }),

  /* ===== LEVEL 7 ===== */
  defineScenario({
    id: "calls-7",
    level: 7,
    difficulty: "Sulit",
    topic: "Tidak semua panggilan itu penipuan",
    title: "Kurir COD yang Sungguhan",
    description:
      "Kali ini kamu memang memesan barang dengan COD dan status pesananmu “sedang diantar”. Namun ada permintaan yang janggal.",
    sender: { name: "Kurir Ekspres", status: "+62 852-0000-0707" },
    messages: [
      "Selamat siang, saya kurir. Paket atas nama Anda sudah sampai di depan, COD Rp189.000.",
      "Mesin pembayaran saya sedang bermasalah. Bisa bayar lewat transfer ke rekening saya saja?",
    ],
    choices: [
      {
        id: "a",
        label: "Transfer ke rekening pribadi kurir karena pesananmu memang ada.",
        isSafe: false,
        feedback: "Pesanan yang benar tidak membuat permintaan bayarnya benar.",
        explanation:
          "COD resmi dibayar sesuai metode di aplikasi (tunai atau kode bayar resmi), bukan transfer ke rekening pribadi.",
        saferAction:
          "Bayar hanya sesuai metode yang tertera di aplikasi pesananmu.",
        reply:
          "Terima kasih. Nomor rekening saya 0123 4567 a.n. kurir, cepat ya, saya buru-buru.",
      },
      {
        id: "b",
        label: "Menutup telepon dan membatalkan pesanan tanpa mengecek apa pun.",
        isSafe: false,
        feedback: "Aman dari penipuan, tetapi kurang tepat.",
        explanation:
          "Tidak semua telepon dari nomor asing berbahaya. Menolak tanpa memeriksa membuatmu kehilangan pesanan yang sah dan tidak melatih cara membedakan.",
        saferAction:
          "Cek aplikasi dulu: nama penerima, nominal COD, dan status pengiriman.",
        reply: "Baik, paket saya bawa kembali ke gudang ya.",
      },
      {
        id: "c",
        label:
          "Mencocokkan pesanan di aplikasi, menolak transfer ke rekening pribadi, dan membayar hanya lewat metode resmi di aplikasi.",
        isSafe: true,
        feedback: "Tepat! Kamu memverifikasi tanpa curiga berlebihan.",
        explanation:
          "Tanda sah: pesanan ada di akunmu dan nominalnya cocok. Tanda curiga: permintaan transfer ke rekening pribadi.",
        saferAction:
          "Jika kurir memaksa transfer pribadi, tolak dan hubungi layanan pelanggan resmi lewat aplikasi.",
        reply: "Baik, saya coba pakai mesinnya dulu ya.",
      },
      {
        id: "d",
        label: "Mengirim foto KTP lewat WhatsApp sebagai bukti penerima.",
        isSafe: false,
        feedback: "KTP tidak diperlukan untuk menerima paket COD.",
        explanation:
          "Data identitas tidak dibutuhkan untuk serah terima paket. Permintaan seperti ini bisa menjadi awal penyalahgunaan data.",
        saferAction: "Cukup konfirmasi nama penerima dan nominal COD.",
        reply: "Terima kasih, KTP-nya kami simpan untuk arsip pengiriman.",
      },
    ],
  }),

  /* ===== LEVEL 8 ===== */
  defineScenario({
    id: "calls-8",
    level: 8,
    difficulty: "Sulit",
    topic: "Pengambilalihan nomor (eSIM)",
    title: "“Pembatalan” Penggantian Kartu",
    description:
      "Beberapa menit lalu kamu menerima SMS berisi kode 6 digit yang tidak kamu minta. Lalu telepon ini masuk dengan nama operator tampil di layar.",
    sender: { name: "Customer Service Operator", status: "+62 21-0000-0808" },
    messages: [
      "Selamat sore. Kami dari customer service operator seluler Anda. Ada permintaan penggantian kartu ke eSIM atas nomor Anda dari perangkat lain.",
      "Jika itu bukan Anda, kami bisa membatalkannya sekarang. Mohon sebutkan kode pembatalan 6 digit yang barusan kami kirim lewat SMS.",
    ],
    choices: [
      {
        id: "a",
        label: "Menyebutkan kode karena ingin membatalkan penggantian kartu.",
        isSafe: false,
        feedback: "Kode itu justru kunci untuk memindahkan nomormu.",
        explanation:
          "Penipu sedang mengaktifkan eSIM atas nomormu lalu memintamu membacakan kode yang masuk. Dengan nomor itu mereka bisa menerima semua OTP milikmu.",
        saferAction:
          "Jangan bacakan kode. Hubungi operator lewat kanal resmi dan minta pengamanan nomor.",
        reply: "Terima kasih. Kode diterima, nomor Anda sedang kami amankan.",
      },
      {
        id: "b",
        label:
          "Meminta penelepon menyebut 4 digit terakhir KTP untuk membuktikan dirinya benar petugas.",
        isSafe: false,
        feedback: "Data pribadi yang benar bukan bukti penelepon sah.",
        explanation:
          "Data pribadi sering bocor. Pelaku bisa menyebutkannya dengan benar dan tetap menipu.",
        saferAction:
          "Verifikasi lewat kanal resmi yang kamu hubungi sendiri.",
        reply: "Tentu, 4 digit terakhir KTP Anda 5827, benar? Sekarang sebutkan kodenya.",
      },
      {
        id: "c",
        label:
          "Tidak membacakan kode, menutup telepon, lalu menghubungi operator lewat aplikasi atau gerai resmi untuk mengecek dan mengamankan nomor.",
        isSafe: true,
        feedback: "Tepat! Kamu menjaga kendali atas nomormu.",
        explanation:
          "Operator resmi tidak meminta kode SMS dibacakan lewat telepon. Kode itu hanya untukmu.",
        saferAction:
          "Aktifkan PIN kartu dan periksa akun penting yang terhubung ke nomor itu.",
        reply: "Kalau tidak dibatalkan sekarang, nomor Anda akan berpindah!",
      },
      {
        id: "d",
        label:
          "Meminta penelepon mengirim tautan pembatalan lewat SMS, lalu mengikutinya.",
        isSafe: false,
        feedback: "Tautan dari penelepon tetap tidak bisa dipercaya.",
        explanation:
          "Tautan “pembatalan” mengarah ke situs palsu yang meminta kode atau data akunmu.",
        saferAction:
          "Pakai aplikasi operator yang kamu pasang dari toko resmi.",
        reply: "Tautannya sudah kami kirim. Isi nomor, PIN, dan kode di halamannya ya.",
      },
    ],
  }),

  /* ===== LEVEL 9 ===== */
  defineScenario({
    id: "calls-9",
    level: 9,
    difficulty: "Ahli",
    topic: "Deepfake video dan penipuan atasan",
    title: "Video Call dari “Direktur”",
    description:
      "Kamu staf keuangan. Wajah dan suara di layar tampak persis seperti direkturmu.",
    sender: {
      name: "Pak Hendra (Direktur)",
      status: "Panggilan video WhatsApp • nomor baru",
    },
    messages: [
      "(Wajah Pak Hendra terlihat di layar, suaranya terdengar sama.) “Pagi. Saya sedang di luar kota dan sinyalnya jelek.”",
      "“Ada akuisisi vendor yang harus dibayar hari ini. Tolong transfer Rp48.000.000 ke rekening vendor baru ini. Ini rahasia, jangan dibicarakan dengan siapa pun dulu.”",
    ],
    choices: [
      {
        id: "a",
        label: "Mentransfer karena wajah dan suaranya benar-benar seperti Pak Hendra.",
        isSafe: false,
        feedback: "Wajah dan suara bukan lagi bukti identitas.",
        explanation:
          "Wajah dan suara kini bisa dipalsukan dengan AI secara real time. Perintah mendesak, rahasia, dan ke rekening baru adalah ciri penipuan atasan palsu.",
        saferAction:
          "Tunda transfer dan verifikasi lewat jalur lain.",
        reply: "Bagus. Kirim bukti transfernya ke sini ya, saya tunggu.",
      },
      {
        id: "b",
        label:
          "Meminta Pak Hendra menoleh ke samping dan melambaikan tangan untuk membuktikan ini bukan rekayasa.",
        isSafe: false,
        feedback: "Tes visual sederhana tidak cukup andal.",
        explanation:
          "Teknik deepfake terus berkembang dan sering lolos tes gerakan sederhana. Verifikasi harus lewat jalur yang terpisah.",
        saferAction:
          "Pakai prosedur persetujuan resmi dan hubungi atasan lewat jalur yang sudah dikenal.",
        reply: "Nih, lihat. Sudah percaya kan? Cepat ya, waktunya mepet.",
      },
      {
        id: "c",
        label:
          "Meminta persetujuan tertulis lewat chat dari nomor yang sama sebelum mentransfer.",
        isSafe: false,
        feedback: "Chat dari nomor yang sama bukan verifikasi.",
        explanation:
          "Pelaku mengendalikan nomor itu dan bisa mengirim “persetujuan” kapan saja.",
        saferAction:
          "Verifikasi lewat nomor kantor atau pihak lain yang berwenang.",
        reply:
          "Baik, ini persetujuan tertulis saya: setuju transfer Rp48.000.000. Silakan lanjut.",
      },
      {
        id: "d",
        label:
          "Menunda transfer, menelepon Pak Hendra lewat nomor lamanya atau menghubungi atasan lain, dan memakai prosedur persetujuan ganda perusahaan.",
        isSafe: true,
        feedback: "Tepat! Kamu tidak mengandalkan wajah dan suara.",
        explanation:
          "Persetujuan ganda dan verifikasi lewat jalur lain adalah pertahanan terbaik terhadap penipuan atasan palsu.",
        saferAction:
          "Laporkan percobaan ini ke tim keamanan dan atasan lewat jalur resmi.",
        reply: "Kamu menentang perintah direktur? Ini akan jadi catatan!",
      },
    ],
  }),

  /* ===== LEVEL 10 ===== */
  defineScenario({
    id: "calls-10",
    level: 10,
    difficulty: "Ahli",
    topic: "Penipuan pemulihan dana (recovery scam)",
    title: "Tim “Pemulihan Dana” yang Menghubungimu",
    description:
      "Beberapa minggu lalu kamu kehilangan uang akibat investasi palsu. Kini seseorang menelepon dan tahu persis apa yang terjadi.",
    sender: {
      name: "Satgas Pemulihan Dana",
      status: "+62 21-0000-1010 • nomor mirip lembaga resmi",
    },
    messages: [
      "Selamat siang. Kami dari Tim Pemulihan Dana Korban Penipuan. Kami melihat laporan Anda kehilangan Rp12.400.000 di platform investasi palsu.",
      "Dana Anda berhasil kami bekukan di rekening penipu. Untuk mencairkannya, Anda cukup membayar biaya administrasi dan pajak Rp3.100.000 hari ini.",
      "Jangan melapor ke polisi atau bank dulu, supaya proses pencairan tidak terblokir.",
    ],
    choices: [
      {
        id: "a",
        label: "Membayar biaya administrasi demi mendapatkan dana kembali.",
        isSafe: false,
        feedback: "Kamu hampir menjadi korban untuk kedua kalinya.",
        explanation:
          "Korban penipuan diincar lagi karena sedang putus asa. Lembaga resmi tidak memungut biaya untuk “mencairkan” dana.",
        saferAction:
          "Jangan membayar apa pun kepada pihak yang menghubungimu lebih dulu.",
        reply:
          "Pembayaran diterima. Ada biaya verifikasi tambahan Rp1.800.000 sebelum dana cair.",
      },
      {
        id: "b",
        label:
          "Memberikan akses m-banking dan PIN agar tim bisa “menarik” dana yang dibekukan.",
        isSafe: false,
        feedback: "Memberi akses sama dengan menyerahkan seluruh rekening.",
        explanation:
          "Mereka bisa menguras sisa saldomu, bukan mengembalikan danamu.",
        saferAction:
          "Jangan pernah membagikan PIN, kata sandi, atau akses perbankan.",
        reply:
          "Bagus. Silakan kirim PIN dan kode OTP yang masuk, kami proses sekarang.",
      },
      {
        id: "c",
        label:
          "Meminta penelepon mengirim surat tugas atau sertifikat lembaga sebagai bukti.",
        isSafe: false,
        feedback: "Dokumen yang mereka kirim bisa dipalsukan.",
        explanation:
          "Surat tugas, logo, dan stempel mudah ditiru. Yang membuktikan adalah kanal resmi yang kamu hubungi sendiri.",
        saferAction:
          "Hubungi lembaga lewat kontak resmi yang kamu cari sendiri.",
        reply:
          "Surat tugas kami kirim lewat WhatsApp. Segera transfer setelah menerimanya.",
      },
      {
        id: "d",
        label:
          "Menutup telepon, tidak membayar atau memberi akses apa pun, lalu melapor ke bank dan layanan pengaduan resmi lewat kanal yang kamu cari sendiri.",
        isSafe: true,
        feedback: "Level tertinggi, dan kamu menjawab dengan benar!",
        explanation:
          "Permintaan membayar dan larangan melapor adalah ciri jelas penipuan. Lembaga resmi justru mendorongmu melapor.",
        saferAction:
          "Simpan bukti, hubungi bank, dan laporkan lewat layanan pengaduan resmi seperti Indonesia Anti-Scam Centre (IASC). Waspadai pesan susulan yang mengaku membantu.",
        reply: "Anda tidak akan pernah mendapatkan dana Anda kembali tanpa kami!",
      },
    ],
  }),
];