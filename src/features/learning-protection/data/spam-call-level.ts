import type { SimulationScenario } from "@/types/learning-protection/index";
import { defineLevel, exit, fatal, good, slip, turn } from "./dialogue-builders";

export const spamCallScenarios: SimulationScenario[] = [
  /* 1. ASLI: driver ojol */
  defineLevel({
    id: "calls-1", level: 1, difficulty: "Mudah",
    topic: "Telepon asli: driver ojek online",
    title: "Driver Sudah di Depan",
    description: "Kamu baru memesan ojek online. Nomor tak dikenal menelepon.",
    sender: { name: "0813 2200 4411", status: "Nomor tak dikenal" },
    takeaway: "Telepon dari nomor asing bisa saja asli. Cocokkan dengan pesanan, dan jangan beri kode atau data yang tidak relevan.",
    turns: {
      t1: turn(
        ["Selamat siang, saya driver pesanan ojek Kakak. Sudah di depan gang ya, motor hitam, plat B 6643 XYZ."],
        [
          good("a", "Oke Pak. Saya lihat di aplikasi plat dan namanya sama, saya turun", "Siap Kak, saya tunggu.", "t2"),
          fatal("b", "Siapa kamu? Saya tutup, ini penipuan", "Kali ini asli: ada pesanan aktif di aplikasimu. Cek plat dan nama driver di aplikasi sebelum menutup.", "Halo? Kak?"),
          slip("c", "Pak, sebutkan nomor teleponku dan alamat tujuanku dulu", "Waduh Kak, saya lihatnya cuma titik jemput dan nama. Kakak turun aja ya.", "t2"),
        ],
      ),
      t2: turn(
        ["Kak, supaya cepat, bisa sebutkan kode OTP yang masuk ke SMS Kakak? Biar saya bisa mulai trip."],
        [
          exit("a", "Tidak perlu OTP, Pak. Tripnya dimulai dari aplikasiku, saya yang konfirmasi", "Ojol tidak pernah butuh OTP lewat telepon. Kamu tetap mengendalikan trip lewat aplikasi."),
          fatal("b", "Oke Pak, kodenya 7 3 0 5 2 1", "OTP bukan bagian dari trip ojol. Sekali dibagikan, akunmu bisa diambil alih.", "Terima kasih Kak."),
        ],
      ),
    },
  }),

  /* 2. Undian operator */
  defineLevel({
    id: "calls-2", level: 2, difficulty: "Mudah",
    topic: "Undian palsu berkedok operator seluler",
    title: "Hadiah dari Operator",
    description: "Penelepon sopan menyebut nomor ponselmu terpilih dalam program loyalitas.",
    sender: { name: "0812 7700 4521", status: "Mengaku “SelulerKu”" },
    takeaway: "Hadiah asli tidak meminta data identitas lengkap atau pembayaran lebih dulu, bahkan jika penelepon ramah dan tidak menekan.",
    turns: {
      t1: turn(
        ["Selamat siang Kak, saya dari SelulerKu Loyalty. Nomor Kakak terpilih dapat bonus kuota 20GB 🎉", "Boleh konfirmasi nama lengkap dan tanggal lahir Kakak untuk pencatatan?"],
        [
          good("a", "Saya terima kasih, tapi bonus bisa dicek lewat aplikasi SelulerKu saja, kan?", "Bisa juga Kak, tapi lewat telepon lebih cepat. Nama saja dulu ya.", "t2", "Mendorong keluar dari aplikasi"),
          fatal("b", "Nama saya Rina Wulandari, lahir 12 Mei 1998", "Nama dan tanggal lahir sering dipakai untuk meretas akun atau menjawab pertanyaan keamanan.", "Terima kasih, sekarang NIK-nya ya."),
          slip("c", "Boleh, namaku Rina saja", "Terima kasih Kak Rina. Tanggal lahirnya juga ya.", "t2"),
        ],
      ),
      t2: turn(
        ["Untuk mengaktifkan bonusnya, tekan *123*77# di ponsel Kakak ya, sekarang saya tunggu di telepon."],
        [
          exit("a", "Saya cek dulu di aplikasi, kode itu tidak saya tekan", "Kode USSD asing bisa mengalihkan panggilan atau SMS-mu. Bonus asli tidak butuh itu."),
          fatal("b", "Oke, saya tekan sekarang", "Kode itu bisa mengalihkan SMS dan OTP ke nomor pelaku.", "Berhasil Kak, terima kasih."),
          slip("c", "Kirim saja kodenya lewat SMS biar kupelajari", "Kodenya sudah saya sebut Kak, cepat ya.", "t3"),
        ],
      ),
      t3: turn(
        ["Kak, bonus hangus dalam 5 menit kalau tidak diaktifkan. Mau diberikan ke pelanggan lain?"],
        [
          exit("a", "Silakan. Saya tidak menekan kode apa pun dan akan tanya gerai resmi", "Tekanan waktu dipakai agar kamu tak sempat memeriksa."),
          fatal("b", "Jangan, saya tekan sekarang", "Kamu menyerahkan kendali SMS-mu.", "Bagus!"),
        ],
      ),
    },
  }),

  /* 3. COD + biaya tambahan */
  defineLevel({
    id: "calls-3", level: 3, difficulty: "Mudah",
    topic: "COD asli yang disusupi biaya tambahan",
    title: "Paket yang Memang Kamu Pesan",
    description: "Kamu memang memesan sepatu COD Rp320.000. Kurir menelepon dan semua detailnya cocok, lalu ada permintaan tambahan.",
    sender: { name: "0857 3310 9022", status: "Mengaku kurir" },
    takeaway: "Detail yang cocok tidak membuktikan penelepon asli. Biaya tambahan yang diminta lewat transfer adalah tanda utama.",
    turns: {
      t1: turn(
        ["Selamat siang Kak, saya kurir. Paket sepatu COD Rp320.000 resi 8821 sudah di kantor pos, mau diantar sore ini."],
        [
          good("a", "Iya Pak, boleh diantar sore. Bayarnya tunai ke kurir saat terima kan?", "Betul Kak, tunai. Tapi ada satu hal tambahan.", "t2"),
          fatal("b", "Kamu pasti penipu, saya tidak pesan apa pun", "Kali ini kamu memang memesan sepatu itu. Menyangkal tanpa mengecek pesanan membuat paketmu dikembalikan.", "Oke Kak, paket dikembalikan."),
          slip("c", "Boleh, kirim nomor rekeningmu, saya transfer saja", "Rekening saya 7712-0045 ya Kak, sekalian dengan asuransi.", "t2"),
        ],
      ),
      t2: turn(
        ["Karena barang bernilai tinggi, ada biaya asuransi Rp25.000. Transfer dulu ke rekening saya, nanti paketnya saya antar."],
        [
          exit("a", "Biaya seperti itu seharusnya tertera di resi. Saya bayar COD saat terima saja, tidak transfer dulu", "Biaya tambahan yang diminta lewat transfer pribadi adalah modus. Pembayaran COD dilakukan saat serah terima."),
          fatal("b", "Oke saya transfer Rp25.000", "Selain kehilangan uang, kamu juga memberi pelaku bukti transfer yang dipakai untuk penipuan lain.", "Terima kasih Kak, saya segera ke sana."),
          slip("c", "Aku transfer Rp10.000 dulu sebagai panjar", "Kurang Kak, harus penuh.", "t3"),
        ],
      ),
      t3: turn(["Kak, kalau tidak dibayar sekarang paket kami kembalikan ke gudang."],
        [
          exit("a", "Silakan. Saya cek resi dan hubungi toko online langsung", "Kamu mengecek lewat kanal resmi."),
          fatal("b", "Baik, saya transfer sekarang", "Ancaman pengembalian dipakai agar kamu menyerah.", "Terima kasih."),
        ],
      ),
    },
  }),

  /* 4. Bank palsu */
  defineLevel({
    id: "calls-4", level: 4, difficulty: "Menengah",
    topic: "Penyamaran petugas bank (menolak ditelepon balik)",
    title: "Transaksi Mencurigakan",
    description: "Penelepon mengaku dari keamanan bank dan menyebut nama serta tanggal lahirmu dengan benar.",
    sender: { name: "021 5088 7000", status: "Nomor mirip layanan bank" },
    takeaway: "Petugas asli menerima kamu menutup telepon dan menghubungi lagi lewat nomor resmi. Pelaku berusaha mencegahnya.",
    turns: {
      t1: turn(
        ["Selamat pagi Ibu Rina, saya Reza dari keamanan Bank Nusantara. Ada transaksi Rp12.500.000 ke luar negeri atas nama Ibu.", "Tanggal lahir Ibu 12 Mei 1998, benar? Apakah transaksi itu Ibu lakukan?"],
        [
          good("a", "Bukan saya. Saya tutup dan telepon nomor di belakang kartu untuk memastikan", "Tidak perlu Bu, nanti keburu lolos. Tetap di telepon ya!", "t2", "Melarang menutup telepon"),
          fatal("b", "Bukan, tolong batalkan. Ini kode OTP saya", "OTP justru yang dibutuhkan pelaku untuk menguras rekeningmu.", "Terima kasih, kami proses."),
          slip("c", "Bukan, apa yang harus saya lakukan?", "Jangan panik Bu. Sebutkan 4 digit terakhir kartu untuk verifikasi.", "t2"),
        ],
      ),
      t2: turn(
        ["Untuk memblokir, sebutkan PIN dan kode OTP yang masuk. Jangan tutup telepon, ini sangat mendesak."],
        [
          exit("a", "Bank tidak pernah minta PIN atau OTP. Saya tutup dan hubungi bank lewat aplikasi", "Kamu memutus panggilan dan menghubungi kanal resmi."),
          fatal("b", "PIN saya 4 8 3 9 dan OTP-nya 7 1 2", "PIN dan OTP memberi akses penuh.", "Diterima."),
          slip("c", "Saya sebut OTP saja, PIN tidak", "OTP saja cukup. Sebutkan sekarang.", "t3"),
        ],
      ),
      t3: turn(["Satu-satunya cara: pindahkan saldo ke rekening aman kami sekarang."],
        [
          exit("a", "Saya tutup dan telepon bank sendiri", "“Rekening aman” milik pelaku. Bank tidak pernah memintanya."),
          fatal("b", "Baik, saya pindahkan", "Uang yang dipindahkan sulit ditarik kembali.", "Jangan tutup telepon."),
        ],
      ),
    },
  }),

  /* 5. ASLI: klinik */
  defineLevel({
    id: "calls-5", level: 5, difficulty: "Menengah",
    topic: "Telepon asli: klinik mengonfirmasi jadwal kontrol",
    title: "Konfirmasi Jadwal Kontrol",
    description: "Dua hari lalu kamu mendaftar kontrol di klinik lewat aplikasi mereka. Nomor tak dikenal menelepon.",
    sender: { name: "021 7400 5521", status: "Nomor telepon kantor" },
    takeaway: "Telepon yang hanya mengonfirmasi hal yang memang kamu lakukan, tanpa meminta kode atau data rahasia, boleh dilayani.",
    turns: {
      t1: turn(
        ["Selamat siang, dari Klinik Sehat Sentosa. Dengan Ibu Rina? Besok Rabu pukul 10.00 jadwal kontrol dr. Hadi ya, mohon konfirmasi hadir."],
        [
          good("a", "Iya Mbak, saya hadir. Saya daftar dua hari lalu lewat aplikasi klinik", "Baik Bu, sudah kami catat. Mohon datang 15 menit lebih awal ya.", "t2"),
          fatal("b", "Tutup telepon. Aku tidak mengenal nomor ini", "Kali ini asli: ada jadwal yang memang kamu buat. Jadwalmu dibatalkan karena tidak ada konfirmasi.", "Halo? Bu?"),
          slip("c", "Bisa konfirmasi atas nama Rina Wulandari, KTP-nya saya sebutkan", "Tidak perlu KTP Bu, nama saja cukup.", "t2"),
        ],
      ),
      t2: turn(
        ["Satu lagi Bu, kalau ada kendala di aplikasi, kami bisa bantu. Tidak ada biaya tambahan, ya."],
        [
          exit("a", "Baik, terima kasih. Sampai besok", "Kamu melayani telepon yang memang berkaitan dengan jadwalmu, tanpa memberi data tambahan."),
          fatal("b", "Tolong kirim nomor rekeningmu, saya mau bayar panjar sekarang", "Tidak ada panjar yang diminta. Kamu mengirim uang tanpa alasan.", "Eh, nggak perlu Bu."),
        ],
      ),
    },
  }),

  /* 6. CS remote */
  defineLevel({
    id: "calls-6", level: 6, difficulty: "Menengah",
    topic: "Aplikasi remote access oleh “CS” yang menelepon balik",
    title: "CS Menelepon Balik Keluhanmu",
    description: "Kemarin kamu mengeluh di media sosial soal refund. Hari ini CS-nya menelepon dan tahu nomor pesananmu.",
    sender: { name: "0821 6000 1900", status: "Mengaku “CS BelanjaKu”" },
    takeaway: "Mereka bisa tahu masalahmu karena kamu sendiri menceritakannya di publik. CS asli tidak meminta aplikasi pengendali layar.",
    turns: {
      t1: turn(
        ["Selamat siang Ibu Rina, saya Sari CS BelanjaKu. Soal keluhan refund pesanan BK-77120 kemarin, kami ingin bantu.", "Boleh kami bantu proses langsung sekarang?"],
        [
          good("a", "Boleh. Tolong sebutkan apa langkahnya", "Mudah Bu. Pasang aplikasi bantuan dulu ya.", "t2"),
          fatal("b", "Silakan Bu, saya pasang apa pun yang dibutuhkan", "Kamu langsung menyerahkan kendali tanpa tahu langkahnya.", "Pasang QuickAssist ya, kodenya saya minta."),
          slip("c", "Mungkin kamu penipu, tapi lanjut saja deh", "Baik Bu, mohon pasang aplikasi bantuan ya.", "t2"),
        ],
      ),
      t2: turn(
        ["Silakan pasang “QuickAssist” dari toko aplikasi, lalu sebutkan kode 9 digitnya supaya saya bisa membantu langsung."],
        [
          exit("a", "CS resmi tidak butuh aplikasi pengendali layar. Saya cek lewat pusat bantuan di aplikasi", "Kamu menolak langkah yang memberi kendali layar."),
          fatal("b", "Sudah terpasang, kodenya 482 913 705", "Kode itu memberi penelepon kendali penuh atas layarmu.", "Layar Ibu sudah terlihat."),
          slip("c", "Saya pasang tapi kodenya belum saya kasih", "Tidak apa Bu, kapan siap saja ya.", "t3"),
        ],
      ),
      t3: turn(["Sekarang buka m-banking Ibu supaya kami bisa memverifikasi pengembalian dana ke rekening."],
        [
          exit("a", "Tidak. Saya hapus aplikasinya dan hubungi pusat bantuan resmi", "Kamu memutus kendali sebelum dipakai."),
          fatal("b", "Baik, saya buka", "Pelaku melihat layar, PIN, dan OTP-mu.", "Terlihat. Sekarang masukkan PIN."),
        ],
      ),
    },
  }),

  /* 7. SIM swap */
  defineLevel({
    id: "calls-7", level: 7, difficulty: "Sulit",
    topic: "Pembajakan nomor (SIM swap)",
    title: "Registrasi Kartu Perlu Diperbarui",
    description: "“Operator” menyebut NIK-mu dengan benar. Nadanya sangat profesional dan tidak mengancam.",
    sender: { name: "0878 2200 6001", status: "Mengaku “Customer Care Operator”" },
    takeaway: "Data benar bukan bukti penelepon asli. Operator tidak meminta kode SMS atau menyuruh mengalihkan SMS.",
    turns: {
      t1: turn(
        ["Selamat siang Ibu Rina. Sesuai aturan, registrasi kartu Ibu perlu validasi ulang. NIK Ibu berakhiran 0042, benar?", "Prosesnya hanya 2 menit, tidak ada biaya."],
        [
          good("a", "Betul, tapi validasi bisa saya lakukan di gerai atau aplikasi resmi saja", "Tentu Bu, tapi lewat telepon lebih cepat dan Ibu tidak perlu antre.", "t2", "Mendorong keluar dari kanal resmi"),
          fatal("b", "Benar, ini NIK lengkap saya: 3174...", "Pelaku memakai data lengkapmu untuk mengambil alih nomor.", "Terima kasih, kami proses."),
          slip("c", "Boleh, silakan lanjut", "Terima kasih Bu. Nanti ada SMS kode masuk.", "t2"),
        ],
      ),
      t2: turn(["Nanti ada SMS berisi kode verifikasi. Mohon dibacakan agar kami bisa menyelesaikan prosesnya."],
        [
          exit("a", "Operator tidak pernah minta kode SMS. Saya datang ke gerai resmi", "Kode itu dipakai memindahkan nomormu ke kartu SIM lain."),
          fatal("b", "Kodenya 7 2 1 9 4 0", "Nomormu dipindahkan ke SIM pelaku, semua OTP masuk ke mereka.", "Terima kasih, nomor Anda sedang diproses."),
          slip("c", "Kuteruskan SMS-nya ke nomor ini", "Boleh, kirim ke sini.", "t3"),
        ],
      ),
      t3: turn(["Atau, tekan kode pengalihan yang saya kirim supaya SMS Ibu otomatis kami terima."],
        [
          exit("a", "Saya tutup dan datang ke gerai operator", "Pengalihan SMS memberi pelaku semua OTP."),
          fatal("b", "Baik, saya tekan", "Semua SMS dan OTP-mu masuk ke penipu.", "Berhasil."),
        ],
      ),
    },
  }),

  /* 8. ASLI: bank menelepon */
  defineLevel({
    id: "calls-8", level: 8, difficulty: "Sulit",
    topic: "Telepon asli: bank memberi tahu transaksi mencurigakan",
    title: "Bank Menelepon Lebih Dulu",
    description: "Penelepon mengaku dari bank dan bicara tenang. Ia tidak meminta data apa pun dan mempersilakanmu menghubungi balik.",
    sender: { name: "021 1500 0XX", status: "Nomor sama dengan call center bank" },
    takeaway: "Petugas asli menerima kamu menelepon balik lewat nomor resmi. Yang berbahaya adalah yang melarangnya.",
    turns: {
      t1: turn(
        ["Selamat siang Ibu Rina, saya dari Bank Nusantara. Ada transaksi Rp2.400.000 di toko online yang tertahan.", "Saya tidak akan meminta PIN atau OTP. Jika Ibu ragu, silakan tutup dan hubungi nomor di belakang kartu. Kami tunggu."],
        [
          good("a", "Baik, saya tutup dan telepon nomor di belakang kartu", "Silakan Bu, mohon sebut kode referensi 7710 saat tersambung.", "t2"),
          fatal("b", "Tutup telepon dan abaikan, pasti penipuan", "Kali ini asli. Mengabaikan membuat transaksi mencurigakan tak tertangani.", "(Panggilan berakhir)"),
          fatal("c", "Silakan batalkan, ini PIN saya", "Meski penelepon asli, memberi PIN tetap tidak benar. Bank tidak membutuhkannya.", "Mohon jangan sebut PIN, Bu."),
        ],
      ),
      t2: turn(
        ["📞 (Kamu menelepon nomor di belakang kartu) “Bank Nusantara, ada kode referensi 7710 untuk Ibu: transaksi Rp2.400.000 tertahan. Apakah itu Ibu?”"],
        [
          exit("a", "Bukan saya. Tolong blokir kartu dan buat yang baru", "Kamu memverifikasi lewat nomor yang kamu pilih sendiri, lalu bertindak tepat."),
          fatal("b", "Itu saya, lanjutkan saja", "Kamu menyetujui transaksi yang sebenarnya bukan milikmu.", "Baik Bu, transaksi dilanjutkan."),
        ],
      ),
    },
  }),

  /* 9. Deepfake */
  defineLevel({
    id: "calls-9", level: 9, difficulty: "Ahli",
    topic: "Video call deepfake atasan",
    title: "Video Call dari Pak Budi",
    description: "Wajah dan suara “Pak Budi” tampak jelas. Ia menyapamu dengan nama panggilan yang biasa dipakai.",
    sender: { name: "Pak Budi (Direktur)", status: "Video call WhatsApp, sinyal kurang stabil" },
    takeaway: "Wajah dan suara bisa dipalsukan AI. Untuk uang, minta konfirmasi lewat jalur lain atau prosedur resmi.",
    turns: {
      t1: turn(
        ["📹 Halo Rin, maaf mendadak, saya di luar kota. Ada pembayaran vendor Rp85.000.000 yang harus keluar sekarang."],
        [
          good("a", "Pak, apa nama proyek yang kita bahas Selasa lalu?", "Aduh sinyal jelek, kamu nggak kedengaran!", "t2", "Menghindar saat ditanya hal pribadi"),
          fatal("b", "Siap Pak, kirim nomor rekeningnya", "Wajah dan suara di video call bisa ditiru AI.", "Terima kasih Rin, ini rekeningnya."),
          slip("c", "Pak, ini sesuai prosedur kah?", "Kali ini darurat, prosedur menyusul.", "t2"),
        ],
      ),
      t2: turn(["Jangan ditutup, sinyal saya jelek. Transfer sekarang, saya tunggu di sini."],
        [
          exit("a", "Pak, saya tutup dulu dan telepon biasa ke nomor Bapak yang tersimpan", "Memutus panggilan dan menghubungi jalur kedua adalah langkah terkuat."),
          fatal("b", "Baik Pak, saya transfer", "Tekanan dan larangan menutup telepon mencegahmu memverifikasi.", "Bagus."),
          slip("c", "Saya transfer separuh dulu Pak", "Separuhnya lagi ya, jangan lama.", "t3"),
        ],
      ),
      t3: turn(["Kamu mau saya anggap tidak loyal? Transfer sekarang!"],
        [
          exit("a", "Maaf Pak, saya konfirmasi ke bagian keuangan dan ke nomor Bapak", "Tekanan jabatan adalah taktik utama."),
          fatal("b", "Maaf Pak, saya transfer", "Takut pada atasan membuatmu melewati verifikasi.", "Terima kasih."),
        ],
      ),
    },
  }),

  /* 10. Recovery scam */
  defineLevel({
    id: "calls-10", level: 10, difficulty: "Ahli",
    topic: "Penipuan pemulihan dana (recovery scam)",
    title: "Tim Pemulihan Dana",
    description: "Kamu pernah rugi Rp18.000.000 di investasi palsu. Seorang penelepon yang lembut mengaku bisa membantu dan menyebut platform-nya dengan benar.",
    sender: { name: "0813 4400 7721", status: "Mengaku “Tim Pemulihan Aset”" },
    takeaway: "Pemulihan dana asli tidak meminta biaya di muka. Korban sering ditipu dua kali, apalagi saat penelepon tahu detail kerugianmu.",
    turns: {
      t1: turn(
        ["Selamat siang Ibu Rina, kami Tim Pemulihan Aset. Kami turut prihatin soal kerugian Rp18.000.000 di NovaTrade AI bulan lalu.", "Kami sudah menangani 300 kasus serupa. Boleh kami jelaskan prosesnya?"],
        [
          good("a", "Dari mana kalian tahu kerugian saya? Saya belum lapor ke siapa pun", "Dari data korban yang terkumpul Bu, kami bantu gratis. Percayalah.", "t2", "Tahu kerugianmu tanpa kamu lapor"),
          fatal("b", "Terima kasih, tolong bantu saya", "Korban yang putus asa paling mudah dipercaya. Kamu belum memeriksa dari mana mereka tahu.", "Cukup biaya administrasi 5% dulu ya."),
          slip("c", "Boleh dijelaskan, tapi saya tidak akan transfer dulu", "Tentu Bu. Prosesnya ada biaya notaris kecil.", "t2"),
        ],
      ),
      t2: turn(["Biaya administrasi 5% (Rp900.000) dan pajak 10%, ditransfer ke rekening notaris kami lebih dulu."],
        [
          exit("a", "Lembaga resmi tidak minta biaya di muka. Saya lapor lewat layanan pengaduan resmi dan hubungi bank", "Kamu tidak jatuh dua kali."),
          fatal("b", "Baik, saya transfer sekarang", "Layanan pemulihan yang minta biaya di muka adalah penipuan kedua.", "Terima kasih, proses dimulai."),
          slip("c", "Biayanya dipotong dari dana yang kembali saja bisa?", "Tidak bisa Bu, harus di muka.", "t3"),
        ],
      ),
      t3: turn(["Hanya hari ini. Besok berkas Ibu masuk antrean 6 bulan lagi."],
        [
          exit("a", "Tidak apa-apa. Saya tidak akan transfer", "Tenggat dan antrean dipakai agar kamu tak sempat menimbang."),
          fatal("b", "Baik, saya pinjam dulu untuk membayar", "Berutang demi memulihkan kerugian hanya melipatgandakannya.", "Cepat ya Bu."),
        ],
      ),
    },
  }),
];