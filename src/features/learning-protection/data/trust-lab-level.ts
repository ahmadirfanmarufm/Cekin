import type { SimulationScenario } from "@/types/learning-protection/index";
import { defineLevel, exit, fatal, good, slip, turn } from "./dialogue-builders";

export const trustLabScenarios: SimulationScenario[] = [
  /* ===== 1. ASLI: kurir ===== */
  defineLevel({
    id: "trust-1", level: 1, difficulty: "Mudah",
    topic: "Chat asli: kurir yang memang kamu tunggu",
    title: "Kurir di Depan Perumahan",
    description: "Tadi malam kamu memesan headset COD Rp87.500. Pagi ini nomor asing mengirim pesan.",
    sender: { name: "+62 812-6003-1187", status: "online" },
    takeaway: "Pesan dari nomor asing tidak otomatis penipuan. Cocokkan dengan pesanan yang kamu buat, dan jangan beri data di luar kebutuhan.",
    profile: {
      phone: "+62 812-6003-1187",
      about: "Antar paket dulu, chat belakangan 🙏",
      items: [
        { label: "Jenis akun", value: "WhatsApp biasa", suspicious: false },
        { label: "Foto profil", value: "Orang berjaket kurir di atas motor", suspicious: false },
        { label: "Nomor di resi paketmu", value: "Sama dengan nomor ini", suspicious: false },
        { label: "Ada di kontakmu", value: "Tidak", suspicious: false },
      ],
    },
    turns: {
      t1: turn(
        ["Selamat pagi Kak, saya Andi kurir J&T. Paket COD Rp87.500 resi berakhiran 4471 sudah saya bawa.", "Saya di depan perumahan nih. Rumah Kakak yang mana ya?"],
        [
          good("a", "Cat putih, pagar hitam, no. 14. Resi 4471 cocok sama pesananku", "Siap Kak, saya ke sana. Bayar tunai ya.", "t2"),
          fatal("b", "Nomor asing! Kamu penipu, saya blokir", "Kali ini pesannya asli: resi 4471 cocok dengan pesananmu. Curiga itu baik, tapi cocokkan dulu dengan data yang kamu punya sebelum memblokir.", "Waduh Kak, paketnya saya kembalikan ya."),
          slip("c", "Kirim dulu foto KTP-mu biar saya yakin", "Hah? Maaf Kak, saya cuma kurir. Rumahnya yang mana ya?", "t2"),
        ],
      ),
      t2: turn(
        ["Oke Kak, 2 menit sampai. Total tetap Rp87.500, bayar tunai ke saya."],
        [
          exit("a", "Oke Kak. Saya cek nama di paket dulu, lalu bayar tunai", "Kamu mencocokkan nama di paket dan membayar sesuai resi tanpa memberi data tambahan."),
          fatal("b", "Kirim nomor rekeningmu, saya transfer sekarang aja", "COD dibayar saat serah terima. Transfer ke rekening pribadi kurir melewati sistem resi.", "Maaf Kak, tunai ya. Rekening pribadi tidak bisa."),
          exit("c", "Saya bayar pas diterima, minta struknya ya", "Membayar saat terima dan meminta bukti adalah cara yang rapi."),
        ],
      ),
    },
  }),

  /* ===== 2. Magang rapi, biaya muncul belakangan ===== */
  defineLevel({
    id: "trust-2", level: 2, difficulty: "Mudah",
    topic: "Biaya “pelatihan” di balik magang",
    title: "Balasan Lamaran Magang",
    description: "Kamu memang melamar magang lewat situs lowongan. Seorang HR membalas lewat WhatsApp.",
    sender: { name: "HR Nusantara Digital", status: "akun bisnis" },
    takeaway: "Melayani tahap awal itu wajar. Yang menentukan: kapan mereka mulai minta uang atau data berlebih.",
    profile: {
      phone: "+62 811-9087-2210",
      about: "Rekrutmen resmi Nusantara Digital. Jam kerja 09.00-17.00",
      items: [
        { label: "Jenis akun", value: "WhatsApp Business", suspicious: false },
        { label: "Situs di profil", value: "nusantaradigital-career.example", suspicious: true },
        { label: "Alamat", value: "Jakarta Selatan (lengkap dengan peta)", suspicious: false },
        { label: "Akun dibuat", value: "3 minggu lalu", suspicious: true },
      ],
    },
    turns: {
      t1: turn(
        ["Halo Kak Rina, terima kasih sudah melamar magang Content Creator di Nusantara Digital 🙏", "Profil Kakak menarik. Boleh kirim CV dan link portofolio untuk seleksi awal?"],
        [
          good("a", "Ini CV dan link portofolio saya", "Terima kasih Kak, kami review sebentar ya.", "t2"),
          slip("b", "Ini CV, foto KTP, dan nomor rekening biar cepat", "Wah lengkap banget Kak, terima kasih!", "t2"),
          good("c", "Boleh minta email HR resminya? Saya kirim ke sana juga", "Boleh Kak, hr@nusantaradigital-career.example. Tapi langsung di sini lebih cepat.", "t2", "Mendorong tetap di chat"),
        ],
      ),
      t2: turn(
        ["Selamat, Kakak lolos seleksi 🎉 Mulai pelatihan online besok, 3 hari.", "Ada biaya modul & sertifikat Rp350.000, dikembalikan penuh di gaji pertama. Mohon bayar hari ini agar slot aman."],
        [
          fatal("a", "Oke, transfer sekarang. Kan dikembalikan", "Magang atau pekerjaan sungguhan tidak memungut biaya dari pelamar, dan janji “dikembalikan” tidak mengikat.", "Terima kasih! Setelah ini ada biaya seragam ya."),
          slip("b", "Bayar separuh dulu, sisanya setelah kontrak", "Boleh, Rp175.000 dulu. Kontrak dikirim setelah lunas.", "t3"),
          good("c", "Magang resmi tidak minta biaya. Saya cek lewat situs karier perusahaan dulu", "Silakan, tapi slot habis jam 5 ya Kak.", "t3", "Biaya di awal"),
        ],
      ),
      t3: turn(
        ["Kakak ragu sama kami? Sudah 40 peserta bergabung minggu ini. Jadi atau tidak?"],
        [
          fatal("a", "Oke, saya bayar", "Bukti sosial dan tenggat dipakai agar kamu tidak sempat memeriksa.", "Pilihan tepat! Ini rekeningnya."),
          fatal("b", "Kirim bukti legalitas PT dulu, baru saya bayar", "Dokumen mudah dipalsukan. Legalitas diperiksa di sumber resmi, bukan dari berkas yang dikirim penjualnya.", "Ini NIB dan akta kami 📄. Sudah percaya kan?"),
          exit("c", "Tidak apa-apa kehabisan slot. Saya cek ke kanal resmi dulu", "Kamu rela kehilangan “slot” daripada membayar di muka."),
        ],
      ),
    },
  }),

  /* ===== 3. Pembeli kelebihan transfer ===== */
  defineLevel({
    id: "trust-3", level: 3, difficulty: "Mudah",
    topic: "Kelebihan transfer palsu",
    title: "Pembeli yang Terlalu Baik",
    description: "Kamu menjual headset bekas Rp2.400.000 di marketplace. Pembeli pindah ke WhatsApp.",
    sender: { name: "Budi Pratama", status: "online" },
    takeaway: "Bukti transfer berupa gambar bukan uang. Cek mutasi rekeningmu sendiri, dan jangan mengembalikan “kelebihan”.",
    profile: {
      phone: "+62 857-2231-9004",
      about: "Hobi audio 🎧",
      items: [
        { label: "Foto profil", value: "Foto pria, tampak seperti foto stok", suspicious: true },
        { label: "Ada di kontakmu", value: "Tidak", suspicious: false },
        { label: "Ulasan di marketplace", value: "Belum ada (akun baru)", suspicious: true },
        { label: "Grup bersama", value: "Tidak ada", suspicious: false },
      ],
    },
    turns: {
      t1: turn(
        ["Kak, headset-nya masih ada? Saya ambil Rp2.400.000 sesuai iklan. Sudah transfer ya, ini buktinya 📸", "Eh maaf, kelebihan nol, saya transfer Rp24.000.000 😅 Tolong kembalikan Rp21.600.000, lalu barang langsung kirim."],
        [
          fatal("a", "Oke, saya kembalikan selisihnya sekarang", "Bukti transfer itu hanya gambar. Uang tidak pernah masuk, dan kamu justru mengirim uang sungguhan.", "Terima kasih Kak! Kirim barangnya juga ya."),
          good("b", "Saya cek mutasi rekening dulu, bukan lewat foto", "Sudah Kak, tadi bank bilang pending. Cek lagi nanti.", "t2"),
          slip("c", "Saya kembalikan Rp5.000.000 dulu sambil menunggu", "Makasih Kak, sisanya ya, soalnya saya butuh cepat.", "t2"),
        ],
      ),
      t2: turn(
        ["Kak, mutasi sering telat 1x24 jam. Kirim barangnya dulu ya, uangnya pasti masuk. Ongkir saya lebihkan Rp100.000."],
        [
          exit("a", "Barang tidak kukirim sebelum uang benar-benar masuk. Batal saja", "Uang yang belum masuk di rekeningmu berarti belum ada pembayaran."),
          fatal("b", "Oke, barang kukirim hari ini", "Barang dan uangmu sama-sama hilang.", "Mantap Kak, tolong kirim resinya ya."),
          slip("c", "Kutunggu sampai besok, lalu kirim kalau masuk", "Saya tidak bisa menunggu Kak, tolong hari ini saja.", "t3"),
        ],
      ),
      t3: turn(
        ["Kak, kalau begini saya laporkan ke marketplace karena menahan barang pembeli."],
        [
          exit("a", "Silakan. Dana belum masuk, saya batalkan transaksi", "Ancaman lapor dipakai agar kamu menyerah. Dana tidak masuk berarti tidak ada transaksi."),
          fatal("b", "Jangan lapor, saya kirim sekarang", "Takut dilaporkan membuatmu mengirim barang tanpa pembayaran.", "Terima kasih Kak."),
        ],
      ),
    },
  }),

  /* ===== 4. CS hasil Google ===== */
  defineLevel({
    id: "trust-4", level: 4, difficulty: "Menengah",
    topic: "Nomor CS palsu dari hasil pencarian",
    title: "Nomor CS yang Kamu Cari Sendiri",
    description: "Dompet digitalmu error saat bayar. Kamu mencari “nomor WhatsApp CS” di internet dan menghubungi salah satu hasilnya.",
    sender: { name: "DompetKu Care", status: "akun bisnis" },
    takeaway: "Kamu yang menghubungi lebih dulu bukan jaminan aman. Nomor di hasil pencarian bisa dibuat pihak lain. Ambil kontak dari aplikasi resmi.",
    profile: {
      phone: "+62 877-5500-3012",
      about: "Layanan pelanggan DompetKu. Respon cepat 24 jam.",
      items: [
        { label: "Jenis akun", value: "WhatsApp Business, kategori Keuangan", suspicious: false },
        { label: "Foto profil", value: "Logo DompetKu", suspicious: false },
        { label: "Situs di profil", value: "dompetku-care.example (situs resmi: dompetku.example)", suspicious: true },
        { label: "Nomor tertera di aplikasi DompetKu", value: "Tidak sama", suspicious: true },
      ],
    },
    turns: {
      t1: turn(
        ["Halo Kak, terima kasih sudah menghubungi DompetKu Care 🙏 Saya Sari. Ada yang bisa dibantu?"],
        [
          good("a", "Saya error saat bayar. Boleh tahu nomor ini sama dengan yang di aplikasi?", "Tentu Kak, ini jalur resmi. Boleh jelaskan kendalanya?", "t2", "Tidak menjawab soal nomor"),
          slip("b", "Saldo saya tersangkut Rp1.250.000 saat bayar, tolong dibantu", "Baik Kak, kami bantu. Mohon tunggu sebentar.", "t2"),
          fatal("c", "Ini nomor CS resmi kan? Berarti aman kirim data akun", "Nomor dari hasil pencarian bisa dibuat siapa saja. Kamu belum mencocokkan dengan nomor di aplikasi resmi.", "Betul Kak, silakan kirim nomor akun dan PIN untuk kami cek."),
        ],
      ),
      t2: turn(
        ["Baik Kak, kami lihat ada transaksi tertahan. Untuk mengembalikan dana, mohon kirim kode verifikasi 6 digit yang baru masuk di SMS Kakak ya."],
        [
          exit("a", "Kode SMS itu rahasia. Saya hubungi CS lewat menu bantuan di aplikasi", "Tim resmi tidak butuh kode SMS. Kamu pindah ke kanal yang kamu buka sendiri."),
          fatal("b", "Ini kodenya: 6 1 0 2 9 4", "Kode itu dipakai masuk ke akunmu dan menguras saldo.", "Terima kasih Kak, mohon tunggu."),
          slip("c", "Kirim lewat chat apa saja yang penting aman", "Boleh di sini Kak, aman kok.", "t3"),
        ],
      ),
      t3: turn(
        ["Kak, dana tertahan hangus dalam 15 menit kalau tidak diverifikasi. Mohon segera."],
        [
          exit("a", "Biar hangus, saya cek lewat aplikasi resmi", "Batas waktu dibuat agar kamu berhenti memeriksa."),
          fatal("b", "Baik, saya kirim kodenya", "OTP tidak boleh dibagikan apa pun alasannya.", "Kode diterima."),
        ],
      ),
    },
  }),

  /* ===== 5. ASLI: adik ganti nomor ===== */
  defineLevel({
    id: "trust-5", level: 5, difficulty: "Menengah",
    topic: "Chat asli: adikmu memang ganti nomor",
    title: "“HP-ku Jatuh ke Selokan”",
    description: "Nomor baru mengaku adikmu, Dimas. Ibu bilang kemarin HP Dimas jatuh, tapi kamu belum menyimpan nomornya.",
    sender: { name: "+62 857-3391-0142", status: "nomor baru" },
    takeaway: "Menolak semua permintaan dari nomor baru juga bisa salah. Verifikasi lewat orang atau jalur lain, lalu bantu dengan cara yang aman.",
    profile: {
      phone: "+62 857-3391-0142",
      about: "Hey there! I am using WhatsApp.",
      items: [
        { label: "Foto profil", value: "Kosong", suspicious: false },
        { label: "Akun dibuat", value: "Hari ini", suspicious: false },
        { label: "Grup bersama", value: "“Keluarga Besar” (kamu dan ibumu juga ada)", suspicious: false },
        { label: "Ada di kontakmu", value: "Tidak", suspicious: false },
      ],
    },
    turns: {
      t1: turn(
        ["Kak, ini Dimas. HP-ku jatuh ke selokan 😭 ini nomor baruku.", "Nanti malam aku telepon ya. Bisa bantu dulu Rp350.000 ke rekening ibu kos? Gajian Jumat kuganti."],
        [
          good("a", "Aku telepon Ibu dulu buat konfirmasi nomor barumu", "Boleh Kak, tanya Ibu aja.", "t2"),
          fatal("b", "Oke kutransfer sekarang, kirim rekeningnya", "Kebetulan itu memang adikmu, tapi kamu tidak memeriksa. Persis skenario yang sama dipakai penipu.", "Makasih Kak!"),
          fatal("c", "Nomor baru minta uang? Pasti penipu, kublokir", "Kali ini asli. Memblokir tanpa mengecek lewat Ibu membuat adikmu kesulitan padahal verifikasinya mudah.", "Kak?? Ini beneran aku..."),
        ],
      ),
      t2: turn(
        ["📞 (Kamu menelepon Ibu) “Iya Nak, itu nomor baru Dimas. HP-nya rusak kemarin.”", "Dimas: Makasih Kak udah cek 🙏 Jadi bisa bantu Rp350.000 ke rekening kos?"],
        [
          exit("a", "Bisa. Kutransfer ke rekening atas nama pemilik kos, kirim buktinya ya", "Kamu memverifikasi lewat jalur lain, lalu membantu dengan wajar."),
          fatal("b", "Tidak, tetap kurasa itu penipu", "Ibumu sudah mengonfirmasi. Menolak setelah verifikasi lengkap bukan lagi waspada, tapi mengabaikan bukti.", "Yaudah Kak, aku cari bantuan lain."),
          fatal("c", "Kutransfer Rp5.000.000 sekalian biar aman", "Membantu boleh, tapi jumlahnya tidak perlu melebihi kebutuhan.", "Wah Kak, kebanyakan..."),
        ],
      ),
    },
  }),

  /* ===== 6. Tugas online yang benar-benar bayar ===== */
  defineLevel({
    id: "trust-6", level: 6, difficulty: "Menengah",
    topic: "Penipuan tugas online (task scam) dengan pembayaran awal nyata",
    title: "Komisi yang Benar-benar Masuk",
    description: "Kemarin kamu ikut tugas “like & subscribe”. Komisi Rp30.000 benar-benar masuk ke rekeningmu.",
    sender: { name: "Admin Tugas Harian", status: "online" },
    takeaway: "Pembayaran kecil di awal itu umpan. Berhenti saat diminta menyetor, bukan setelah.",
    profile: {
      phone: "+62 896-1201-7788",
      about: "Kerja sampingan santai dari HP 💼",
      items: [
        { label: "Jenis akun", value: "WhatsApp biasa", suspicious: false },
        { label: "Anggota grup tugas", value: "2.318 anggota", suspicious: false },
        { label: "Riwayat pembayaran ke kamu", value: "2 kali, tepat waktu", suspicious: false },
        { label: "Akun dibuat", value: "2 bulan lalu", suspicious: false },
      ],
    },
    turns: {
      t1: turn(
        ["Komisi 2 tugas kemarin Rp30.000 sudah masuk ✅ Cek mutasinya ya Kak.", "Hari ini ada tugas yang lebih besar: pesan barang “booster” dulu (Rp400.000), nanti dikembalikan plus komisi Rp120.000."],
        [
          good("a", "Mutasi sudah kucek, makasih. Tugas kecil saja ya, aku nggak mau transfer dulu", "Tugas kecil sudah habis Kak, hanya tersisa yang booster.", "t2"),
          fatal("b", "Karena dua kali dibayar, aku ikut booster-nya", "Dua kali dibayar adalah cara membangun kepercayaan sebelum permintaan setoran besar.", "Mantap Kak! Transfer ke rekening ini."),
          slip("c", "Boleh booster kecil dulu Rp100.000", "Boleh Kak, tapi komisinya jadi Rp25.000 ya.", "t2"),
        ],
      ),
      t2: turn(
        ["Kak, kalau berhenti sekarang tugas kemarin tidak dihitung dan akunmu dibekukan."],
        [
          exit("a", "Tidak apa-apa. Saya berhenti dan simpan buktinya", "Kehilangan komisi kecil lebih baik daripada menyetor uang yang tidak kembali."),
          fatal("b", "Oke aku ikut daripada akunku dibekukan", "Ancaman pembekuan dipakai agar kamu terus menyetor.", "Pintar Kak, kirim buktinya ya."),
          slip("c", "Aku tarik komisi Rp30.000 dulu baru putuskan", "Penarikan baru bisa setelah booster selesai Kak.", "t3"),
        ],
      ),
      t3: turn(
        ["Kak, ini kesempatan terakhir hari ini. Tinggal 2 slot."],
        [
          exit("a", "Tidak, terima kasih. Saya berhenti di sini", "Penarikan yang ditahan sampai kamu menyetor adalah tanda umum penipuan tugas."),
          fatal("b", "Baik, saya setor sekarang", "Tenggat dan “slot” hanya tekanan buatan.", "Terima kasih Kak."),
        ],
      ),
    },
  }),

  /* ===== 7. Voting dari akun teman yang diretas ===== */
  defineLevel({
    id: "trust-7", level: 7, difficulty: "Sulit",
    topic: "Pengambilalihan akun WhatsApp lewat tautan “vote”",
    title: "Tolong Vote Anakku",
    description: "Pesan datang dari Bu Wati, tetangga yang kamu kenal baik, dengan bahasa seperti biasanya.",
    sender: { name: "Bu Wati RT 04", status: "online" },
    takeaway: "Teman yang kamu kenal pun bisa dipakai pelaku. Nada pesan yang mirip aslinya bukan bukti.",
    profile: {
      phone: "+62 813-4452-9001",
      about: "Dekat dengan Tuhan, dekat dengan tetangga 🌷",
      items: [
        { label: "Ada di kontakmu", value: "Ya, tersimpan “Bu Wati RT 04”", suspicious: false },
        { label: "Foto profil", value: "Foto Bu Wati (sama seperti biasanya)", suspicious: false },
        { label: "Terakhir dilihat", value: "Baru saja", suspicious: false },
        { label: "Cara menulis", value: "Persis seperti biasa, ada “yaa Bu 🙏”", suspicious: true },
      ],
    },
    turns: {
      t1: turn(
        ["Bu, tolong vote anak saya lomba mewarnai ya 🙏 Klik: vote-lomba-anak.example", "Nanti ada kode masuk lewat SMS, tinggal masukkan di situ ya. Makasih banyak!"],
        [
          fatal("a", "Siap Bu, saya vote sekarang", "Kode SMS itu adalah kode masuk WhatsApp-mu. Memasukkannya berarti menyerahkan akunmu.", "Terima kasih Bu! Tolong share ke grup RT juga."),
          good("b", "Saya telepon Ibu dulu, ya", "Aduh nanti saja Bu, saya lagi di acara 🙏 Pokoknya klik aja.", "t2", "Menghindari ditelepon"),
          slip("c", "Aku buka tautannya dulu, nggak masukkan kode", "Sudah kebuka Bu? Masukkan kodenya ya.", "t2"),
        ],
      ),
      t2: turn(
        ["Bu, tinggal 10 menit lagi nih lombanya ditutup 😢 Cepetan ya."],
        [
          exit("a", "Bu Wati, saya telepon langsung dan beri tahu RT bahwa akun Ibu mungkin diretas", "Kamu menghubungi jalur lain dan memperingatkan lingkungan."),
          fatal("b", "Oke Bu, ini kodenya 4 8 2 0 1 7", "Akunmu langsung diambil alih dan dipakai ke kontakmu.", "Makasih Bu!"),
          slip("c", "Ibu kirim voice note dulu supaya saya yakin", "Aduh suaranya serak Bu, tulis aja.", "t3"),
        ],
      ),
      t3: turn(
        ["Ayo Bu, jangan bikin saya malu. Anak saya sudah nunggu."],
        [
          exit("a", "Maaf Bu, saya cek lewat telepon dulu dan tidak masukkan kode apa pun", "Membuat orang “malu” dipakai sebagai tekanan emosional."),
          fatal("b", "Baik Bu, saya masukkan sekarang", "Akunmu hilang dalam hitungan detik.", "Terima kasih banyak Bu."),
        ],
      ),
    },
  }),

  /* ===== 8. ASLI: bank melalui WhatsApp resmi ===== */
  defineLevel({
    id: "trust-8", level: 8, difficulty: "Sulit",
    topic: "Chat asli: notifikasi transaksi dari bank",
    title: "Transaksi Tidak Biasa",
    description: "Pesan masuk dari akun bank bercentang hijau. Kamu belum pernah menerima pesan seperti ini.",
    sender: { name: "Bank Nusantara", status: "akun bisnis terverifikasi" },
    takeaway: "Pesan yang tampak sah bisa memang sah, tapi tetap tidak boleh dipercaya begitu saja. Cek di aplikasi bank yang kamu buka sendiri, dan jangan memberi OTP.",
    profile: {
      phone: "+62 21-1500-0XX (Nomor resmi)",
      about: "Notifikasi resmi Bank Nusantara. Kami tidak pernah meminta PIN, OTP, atau password.",
      items: [
        { label: "Centang hijau", value: "Ya (akun bisnis terverifikasi)", suspicious: false },
        { label: "Nomor", value: "Sama dengan yang tercantum di situs resmi bank", suspicious: false },
        { label: "Isi pesan", value: "Tidak ada tautan, tidak minta data", suspicious: false },
        { label: "Cara membalas", value: "Hanya ke aplikasi atau call center", suspicious: false },
      ],
    },
    turns: {
      t1: turn(
        ["Selamat siang Ibu Rina. Kami mendeteksi transaksi Rp2.400.000 di “TOKO ELEKTRO X” pukul 11.42 dengan kartu debit berakhiran 4821.", "Jika bukan Anda, mohon blokir kartu lewat aplikasi atau hubungi 1500-0XX. Kami tidak pernah meminta PIN atau OTP."],
        [
          good("a", "Saya buka aplikasi bank sendiri dan cek mutasi", "Pesan ini hanya notifikasi, tidak perlu balasan.", "t2"),
          fatal("b", "Abaikan saja, pasti spam", "Kali ini pesannya asli. Mengabaikan membuat transaksi tak dikenal terus berjalan.", "(Tidak ada balasan)"),
          fatal("c", "Balas: bukan saya, tolong batalkan dan ini PIN saya", "Bank tidak pernah meminta PIN lewat chat. Kali ini pesannya sah, tapi permintaan datamu yang keliru.", "Mohon jangan bagikan PIN. Gunakan aplikasi."),
        ],
      ),
      t2: turn(
        ["📱 (Kamu membuka aplikasi) Mutasi: “TOKO ELEKTRO X Rp2.400.000, pending”. Itu bukan transaksimu."],
        [
          exit("a", "Blokir kartu lewat aplikasi, lalu hubungi nomor di belakang kartu", "Kamu memakai kanal resmi yang kamu buka sendiri, tepat saat ada transaksi tak dikenal."),
          fatal("b", "Balas chat: tolong batalkan dan kirim link pemblokiran", "Bank tidak mengirim tautan untuk blokir lewat chat. Gunakan aplikasi atau nomor di kartu.", "Silakan gunakan aplikasi Bank Nusantara."),
          fatal("c", "Tunggu besok, mungkin salah sistem", "Setiap jam menunda memberi pelaku kesempatan menghabiskan saldo.", "(Transaksi lain terdeteksi pukul 13.10)"),
        ],
      ),
    },
  }),

  /* ===== 9. Romansa + investasi AI ===== */
  defineLevel({
    id: "trust-9", level: 9, difficulty: "Ahli",
    topic: "Investasi “AI” bermodus romansa (pig butchering)",
    title: "Saldo yang Terus Naik",
    description: "Tiga minggu kamu dekat dengan Kevin dari aplikasi kencan. Ia tidak pernah meminta uang, dan pernah ikut membantu saat kamu sakit.",
    sender: { name: "Kevin", status: "kenalan dari aplikasi kencan" },
    takeaway: "Hubungan emosional yang tulus pun bisa dipakai. Biaya penarikan di muka dan “saldo” di aplikasi yang tidak bisa kamu verifikasi adalah tanda pastinya.",
    profile: {
      phone: "+65 8123 4455",
      about: "Engineer & traveler ✈️",
      items: [
        { label: "Nomor", value: "Kode negara Singapura", suspicious: true },
        { label: "Foto profil", value: "Beragam, tampak natural (lokasi berbeda-beda)", suspicious: false },
        { label: "Riwayat chat", value: "3 minggu, perhatian setiap hari", suspicious: false },
        { label: "Pernah minta uang", value: "Tidak pernah", suspicious: false },
      ],
    },
    turns: {
      t1: turn(
        ["Pagi sayang ❤️ Aku lihat saldomu di NovaTrade AI sudah Rp12.400.000 loh. Tanpa sadar jadi segitu ya 😄", "Mau tarik sebagian? Tinggal bayar pajak keuntungan 10% (Rp1.240.000), nanti langsung cair."],
        [
          good("a", "Kita coba tarik Rp500.000 dulu. Kalau berhasil tanpa biaya, baru kupikir", "Sistemnya baru bisa tarik setelah pajak dibayar, sayang.", "t2"),
          fatal("b", "Oke, aku bayar pajaknya, biar semuanya cair", "Biaya “pajak” sebelum penarikan adalah pola khas. Setelah dibayar, biasanya muncul biaya baru.", "Bagus! Tinggal biaya verifikasi 2% ya."),
          slip("c", "Aku pinjam dulu dari pinjol untuk bayar pajaknya", "Pinter! Cepat ya, slot penarikan hari ini terbatas.", "t2"),
        ],
      ),
      t2: turn(
        ["Sayang, kamu masih ragu sama aku? 😢 Aku bahkan kirim sertifikat izin perusahaannya 📄 Aku cuma ingin kita punya masa depan."],
        [
          exit("a", "Aku percaya kamu sebagai orang, tapi aku nggak akan transfer apa pun. Aku cek izinnya di OJK sendiri", "Menolak transfer sambil tetap menjaga hubungan adalah langkah yang sulit tapi tepat."),
          fatal("b", "Maaf sayang, kubayar sekarang", "Rasa bersalah dan kedekatan dipakai menutup keraguanmu.", "Makasih sayang ❤️"),
          slip("c", "Kucek sertifikat dari file itu dulu", "Lihat kan, resmi! Yuk bayar.", "t3"),
        ],
      ),
      t3: turn(
        ["Besok saldo dibekukan dan pajaknya naik jadi 20%. Aku nggak mau kita rugi."],
        [
          exit("a", "Biar dibekukan. Aku berhenti, simpan bukti, dan lapor ke bank", "Menghentikan transfer lebih dulu adalah langkah terpenting dalam penipuan investasi."),
          fatal("b", "Kubayar hari ini ya", "Tenggat dan kenaikan pajak hanya tekanan buatan.", "Terima kasih sayang."),
        ],
      ),
    },
  }),

  /* ===== 10. Atasan ganti nomor ===== */
  defineLevel({
    id: "trust-10", level: 10, difficulty: "Ahli",
    topic: "Penyamaran atasan dengan nomor baru",
    title: "Pak Budi Ganti Nomor",
    description: "Pesan dari “Pak Budi”, direkturmu, dengan nada sopan dan konteks proyek yang benar. Ia bilang sedang roaming.",
    sender: { name: "Budi Santoso", status: "online" },
    takeaway: "Konteks yang benar bisa diambil dari informasi bocor atau media sosial. Untuk uang, konfirmasi lewat prosedur dan jalur kedua, siapa pun yang meminta.",
    profile: {
      phone: "+62 812-9988-0034",
      about: "Direktur Operasional",
      items: [
        { label: "Foto profil", value: "Foto resmi di situs perusahaan", suspicious: false },
        { label: "Ada di kontakmu", value: "Tidak (nomor berbeda dari yang kamu simpan)", suspicious: true },
        { label: "Akun dibuat", value: "Kemarin", suspicious: true },
        { label: "Grup bersama", value: "“Tim Proyek Dermaga” (kamu, Pak Budi, dan 8 orang lain)", suspicious: false },
      ],
    },
    turns: {
      t1: turn(
        ["Selamat sore Rina. Ini Budi, nomor saya ganti sementara karena roaming. Soal Proyek Dermaga, ada tagihan vendor yang harus keluar hari ini.", "Bisa Rina bantu proses sekarang? Saya sedang rapat, nanti saya yang tanda tangan."],
        [
          good("a", "Siap Pak. Saya cek dulu ke nomor Bapak yang biasa dan ke Bu Dewi (Keuangan)", "Boleh Rin, tapi cepat ya, vendor sudah menunggu.", "t2"),
          slip("b", "Siap Pak. Rincian rekening dan nominalnya mana?", "Rp48.500.000 ke rekening ini ya: Bank Nusantara 3320-8841-77 a.n. PT Dermaga Jaya Utama.", "t2"),
          fatal("c", "Maaf Pak, ini bukan Pak Budi. Saya blokir ya", "Bisa saja akun ini palsu, tapi “pasti bukan” tanpa memeriksa juga keliru. Cara yang tepat: konfirmasi lewat jalur kedua.", "Rin, ini saya! Tolong jangan begini."),
        ],
      ),
      t2: turn(
        ["Rin, jangan telepon, nanti pulsa roaming saya habis. Tolong langsung transfer ya, nanti dokumennya menyusul."],
        [
          exit("a", "Maaf Pak, untuk nominal ini harus lewat prosedur dua persetujuan. Saya konfirmasi ke Bu Dewi dulu", "Prosedur dan jalur kedua melindungimu bahkan saat atasan yang sebenarnya meminta."),
          fatal("b", "Baik Pak, saya transfer sekarang", "Kamu mengeluarkan uang perusahaan tanpa verifikasi.", "Terima kasih Rin, kirim bukti ya."),
          slip("c", "Saya transfer separuh dulu, sisanya setelah Bapak telepon", "Separuh saja kurang Rin, vendor minta full.", "t3"),
        ],
      ),
      t3: turn(
        ["Rin, ini permintaan langsung dari direktur. Kamu mau saya catat tidak kooperatif?"],
        [
          exit("a", "Saya hanya mengikuti prosedur, Pak. Silakan saya telepon Bapak lewat nomor yang tersimpan", "Tekanan jabatan adalah taktik yang paling sering dipakai."),
          fatal("b", "Maaf Pak, saya transfer sekarang", "Takut pada atasan membuatmu melewati verifikasi.", "Bagus Rin."),
        ],
      ),
    },
  }),
];