export type Choice = {
  label: string
  safe: boolean
  consequence: string
}

export type Scenario = {
  title: string
  sender: string
  context: string
  messages: string[]
  choices: Choice[]
  trap: string
  safer: string
}

export const trustScenarios: Scenario[] = [
  {
    title: 'Lowongan Part-Time Palsu',
    sender: 'Rani - Rekruter Online',
    context: 'Sebuah nomor baru menghubungimu melalui WhatsApp.',
    messages: [
      'Halo Kak! Kamu lolos kerja part-time online. Cukup like dan follow akun, penghasilan Rp300.000–Rp500.000/hari.',
      'Untuk aktivasi akun, cukup deposit Rp50.000. Slotnya tinggal 2 ya Kak.',
    ],
    choices: [
      { label: 'Transfer deposit', safe: false, consequence: 'Deposit kecil sering menjadi awal permintaan uang yang terus membesar.' },
      { label: 'Minta identitas perusahaan', safe: true, consequence: 'Langkah baik, tetapi identitas yang dikirim tetap perlu diverifikasi sendiri.' },
      { label: 'Cari perusahaan lewat kanal resmi', safe: true, consequence: 'Tepat. Kamu mencari bukti independen, bukan mengikuti arahan pengirim.' },
      { label: 'Abaikan dan blokir pesan', safe: true, consequence: 'Aman. Kamu memutus tekanan sebelum memberikan uang atau data.' },
    ],
    trap: 'Keuntungan cepat, tekanan waktu, dan biaya awal yang terlihat kecil.',
    safer: 'Cari situs resmi perusahaan dan jangan pernah membayar untuk mendapat pekerjaan.',
  },
  {
    title: 'Top-Up Game Super Murah',
    sender: 'TopUp Sultan - Akun sosial',
    context: 'Sebuah akun menawarkan diamond dengan harga 70% lebih murah.',
    messages: [
      'PROMO KILAT! 5.000 diamond cuma Rp99 ribu. Sudah 12.000 pelanggan puas.',
      'Bayar langsung via transfer ya. Promo berakhir 10 menit lagi!',
    ],
    choices: [
      { label: 'Bayar sebelum promo habis', safe: false, consequence: 'Harga ekstrem dan tekanan waktu membuatmu melewatkan verifikasi.' },
      { label: 'Percaya testimoni akun', safe: false, consequence: 'Testimoni dan jumlah pengikut dapat dibeli atau dipalsukan.' },
      { label: 'Cek reputasi di luar akun', safe: true, consequence: 'Bagus. Ulasan independen lebih sulit dikendalikan penjual.' },
      { label: 'Gunakan kanal top-up resmi', safe: true, consequence: 'Pilihan paling aman karena transaksi mendapat perlindungan resmi.' },
    ],
    trap: 'Diskon ekstrem, social proof palsu, dan pembayaran di luar platform.',
    safer: 'Gunakan toko resmi atau marketplace dengan perlindungan pembeli.',
  },
  {
    title: 'Investasi Pasti Untung',
    sender: 'Coach Arga - Mentor Investasi',
    context: 'Kamu dimasukkan ke grup investasi tanpa diminta.',
    messages: [
      'Profit dijamin 25% tiap minggu, tanpa risiko. Semua anggota sudah cuan.',
      'Deposit malam ini sebelum grup VIP ditutup. Lihat bukti saldo ini!',
    ],
    choices: [
      { label: 'Ikut agar tidak tertinggal', safe: false, consequence: 'Janji untung tinggi tanpa risiko tidak realistis.' },
      { label: 'Percaya foto saldo', safe: false, consequence: 'Tangkapan layar sangat mudah dimanipulasi.' },
      { label: 'Cek izin melalui regulator', safe: true, consequence: 'Tepat. Legalitas harus dicek dari sumber resmi.' },
      { label: 'Keluar dan laporkan grup', safe: true, consequence: 'Aman. Kamu menghentikan paparan promosi berisiko.' },
    ],
    trap: 'FOMO, otoritas palsu, dan janji keuntungan tanpa risiko.',
    safer: 'Jangan transfer. Periksa legalitas dan pahami bahwa semua investasi memiliki risiko.',
  },
]

export const appScenarios = [
  {
    name: 'Galaxy Rush Ultra',
    developer: 'Ultra Fun Studio',
    source: 'galaxy-rush-bonus.example',
    badge: 'Game populer',
    claim: 'Bonus 10.000 gems gratis',
    permissions: ['Baca SMS', 'Akses kontak', 'Instal aplikasi lain'],
    reviews: 'Banyak ulasan serupa dalam waktu yang sama.',
    risk: 'Tinggi',
  },
  {
    name: 'StreamMax MOD+',
    developer: 'Premium Unlock Labs',
    source: 'mod-premium.example',
    badge: 'Premium terbuka',
    claim: 'Semua fitur premium selamanya',
    permissions: ['Akses penyimpanan', 'Tampil di atas aplikasi lain', 'Aksesibilitas'],
    reviews: 'Tidak tersedia di toko aplikasi resmi.',
    risk: 'Kritis',
  },
  {
    name: 'CatatUang Pro',
    developer: 'Simple Utility Dev',
    source: 'Toko aplikasi simulasi',
    badge: 'Aplikasi utilitas',
    claim: 'Pencatat pengeluaran praktis',
    permissions: ['Baca SMS', 'Akses mikrofon', 'Lokasi setiap saat'],
    reviews: 'Pengguna mempertanyakan izin yang berlebihan.',
    risk: 'Sedang',
  },
]

export const phishingScenarios = [
  {
    title: 'Akun Akan Ditangguhkan',
    sender: 'Tim Keamanan Akun',
    address: 'security@akun-verifikasi.example',
    subject: 'TINDAKAN DIPERLUKAN: Akun ditangguhkan',
    body: 'Kami menemukan aktivitas tidak biasa. Verifikasi akun dalam 15 menit agar aksesmu tidak ditutup.',
    cta: 'Verifikasi Sekarang',
    url: 'https://akun-verify.example/login',
    redFlags: ['Alamat pengirim bukan domain resmi', 'Tekanan waktu 15 menit', 'Tautan menuju domain berbeda'],
  },
  {
    title: 'Paket Tertahan',
    sender: 'Layanan Paket Nasional',
    address: 'update@paket-cepat.example',
    subject: 'Paketmu tertahan di gudang',
    body: 'Alamat tidak lengkap. Bayar biaya penjadwalan ulang Rp5.000 agar paket dapat dikirim hari ini.',
    cta: 'Atur Pengiriman',
    url: 'https://paket-bayar.example/reschedule',
    redFlags: ['Tidak ada nomor resi valid', 'Meminta pembayaran mendadak', 'Domain tidak dikenal'],
  },
  {
    title: 'Hadiah Giveaway',
    sender: 'Pusat Hadiah',
    address: 'winner@hadiah-eksklusif.example',
    subject: 'Selamat! Kamu pemenang smartphone',
    body: 'Klaim hadiah pilihanmu sekarang. Isi data akun sebelum kesempatan diberikan ke peserta lain.',
    cta: 'Klaim Hadiah',
    url: 'https://hadiah-claim.example/winner',
    redFlags: ['Hadiah tidak pernah diikuti', 'Meminta data akun', 'Kelangkaan dibuat-buat'],
  },
]

export const callScenarios = [
  {
    title: 'Petugas Bank Palsu',
    caller: 'Layanan Bank',
    number: '+62 811-0000-142',
    line: 'Ada transaksi mencurigakan. Sebutkan OTP yang baru masuk agar kami batalkan.',
    trap: 'Rasa takut dan penyamaran sebagai petugas bank.',
    responses: [
      { label: 'Berikan OTP', safe: false, consequence: 'OTP dapat dipakai untuk mengambil alih akun atau menyetujui transaksi.' },
      { label: 'Minta nomor laporan resmi', safe: true, consequence: 'Baik, tetapi jangan lanjutkan panggilan. Hubungi bank sendiri.' },
      { label: 'Tutup dan hubungi bank resmi', safe: true, consequence: 'Pilihan teraman. Kamu memutus kendali penelepon.' },
    ],
  },
  {
    title: 'Kurir Palsu',
    caller: 'Kurir Paket',
    number: '+62 812-0000-733',
    line: 'Paket Anda tertahan. Buka link yang kami kirim sekarang untuk konfirmasi alamat.',
    trap: 'Masalah palsu dan tekanan untuk membuka tautan.',
    responses: [
      { label: 'Buka link dari penelepon', safe: false, consequence: 'Tautan dapat mengarah ke halaman pencuri data.' },
      { label: 'Minta nomor resi', safe: true, consequence: 'Langkah verifikasi yang baik, lalu cek langsung di aplikasi resmi.' },
      { label: 'Tutup dan cek aplikasi kurir', safe: true, consequence: 'Tepat. Kamu berpindah ke kanal yang dapat dipercaya.' },
    ],
  },
  {
    title: 'Otoritas Palsu',
    caller: 'Penyidik Nasional',
    number: '+62 813-0000-911',
    line: 'Anda terlibat masalah hukum. Jangan beri tahu siapa pun dan segera ikuti instruksi kami.',
    trap: 'Intimidasi, authority bias, dan upaya mengisolasi korban.',
    responses: [
      { label: 'Ikuti instruksi diam-diam', safe: false, consequence: 'Isolasi membuatmu lebih mudah ditekan dan dimanipulasi.' },
      { label: 'Minta surat dan identitas', safe: true, consequence: 'Baik, tetapi verifikasi melalui kantor resmi yang kamu cari sendiri.' },
      { label: 'Akhiri panggilan dan cari bantuan', safe: true, consequence: 'Tepat. Masalah resmi dapat diverifikasi tanpa ancaman telepon.' },
    ],
  },
]

export const gamblingScenarios = [
  ['Slot Online', 'Hampir menang! Satu putaran lagi untuk bonus besar.', 'Near-miss dan loss chasing', 'Hampir menang tetap bukan kemenangan. Tutup promosi dan hentikan pembayaran.'],
  ['Mahjong Online', 'Bonus terbatas aktif 5 menit. Jangan lewatkan kesempatan!', 'FOMO dan urgency', 'Batas waktu dirancang agar kamu tidak sempat berpikir. Tinggalkan halaman.'],
  ['Togel Online', 'Angka pilihan hari ini sudah dianalisis. Peluang pasti lebih besar!', 'Illusion of control', 'Prediksi tidak dapat menjamin hasil acak. Jangan mengikuti klaim kepastian.'],
  ['Domino Online', 'Teman-temanmu sudah menang. Masa kamu tidak ikut?', 'Social proof dan peer pressure', 'Cerita kemenangan tidak menunjukkan kerugian. Tolak ajakan dan cari dukungan.'],
  ['Poker Online', 'Kalah tadi cuma kurang beruntung. Tambah lagi untuk balik modal.', 'Loss chasing', 'Mengejar kerugian biasanya memperbesar kerugian. Berhenti sekarang.'],
  ['Judi Bola Online', 'Prediksi pasti menang! Odds spesial hanya malam ini.', 'False certainty dan emosi', 'Tidak ada hasil pertandingan yang pasti. Hindari promosi dan blokir paparan.'],
] as const

export const mindTraps = [
  ['FOMO', 'Takut kehilangan kesempatan.', 'Promo “tinggal hari ini”.', 'Beri jeda dan verifikasi.'],
  ['Social Proof', 'Ramai terasa seperti bukti.', 'Ribuan testimoni.', 'Cari sumber independen.'],
  ['Authority Bias', 'Mudah patuh pada figur berwenang.', 'Akun mengaku petugas.', 'Hubungi institusi sendiri.'],
  ['Scarcity', 'Hal terbatas terasa lebih berharga.', '“Slot tersisa dua.”', 'Abaikan hitung mundur.'],
  ['Greed Appeal', 'Tergoda hasil besar dan cepat.', 'Gaji tinggi tanpa pengalaman.', 'Bandingkan dengan standar wajar.'],
  ['Urgency', 'Tekanan untuk segera bertindak.', 'Akun diblokir 10 menit lagi.', 'Berhenti sebelum bertindak.'],
  ['Gambler’s Fallacy', 'Merasa hasil berikutnya pasti berubah.', '“Sudah kalah, pasti menang.”', 'Ingat hasil tetap tidak pasti.'],
  ['Near-Miss Effect', 'Hampir menang terasa seperti kemajuan.', 'Simbol hampir sejajar.', 'Hampir menang tetap kalah.'],
  ['Illusion of Control', 'Merasa mengendalikan hasil acak.', 'Memilih waktu keberuntungan.', 'Bedakan skill dan peluang acak.'],
] as const

export const emergencies: Array<{ title: string; icon: string; steps: string[]; resource: string }> = [
  { title: 'Terlanjur klik link phishing', icon: 'link', steps: ['Tutup halaman dan jangan unduh apa pun.', 'Ganti password akun terkait dari perangkat aman.', 'Periksa sesi login dan aktivitas akun.', 'Simpan bukti pesan dan tautan.'], resource: 'Laporkan pesan ke platform tempat kamu menerimanya.' },
  { title: 'Memberikan OTP atau PIN', icon: 'key', steps: ['Hubungi bank atau layanan melalui kanal resmi.', 'Amankan akun yang terkait.', 'Ganti password dan keluarkan sesi asing.', 'Simpan bukti kejadian.'], resource: 'Gunakan nomor layanan resmi pada aplikasi atau kartu bank.' },
  { title: 'Akun diretas', icon: 'user', steps: ['Gunakan pemulihan akun resmi.', 'Periksa email dan nomor pemulihan.', 'Cabut semua sesi aktif.', 'Beri tahu kontakmu tentang pengambilalihan.'], resource: 'Gunakan pusat bantuan resmi platform.' },
  { title: 'Sudah transfer ke penipu', icon: 'wallet', steps: ['Hubungi bank atau dompet digital secepatnya.', 'Minta penelusuran atau pemblokiran transaksi.', 'Jangan bayar biaya pemulihan tambahan.', 'Simpan bukti transfer dan percakapan.'], resource: 'Laporkan melalui kanal kepolisian atau layanan pengaduan resmi.' },
  { title: 'Mengunduh aplikasi mencurigakan', icon: 'phone', steps: ['Putuskan koneksi bila perangkat bertingkah aneh.', 'Hapus aplikasi dan cabut izinnya.', 'Jalankan pemindaian dari alat keamanan tepercaya.', 'Ganti password dari perangkat lain yang aman.'], resource: 'Minta bantuan pusat layanan perangkat bila perlu.' },
  { title: 'Menerima telepon penipuan', icon: 'call', steps: ['Akhiri panggilan.', 'Jangan hubungi nomor yang diberikan penelepon.', 'Verifikasi melalui kanal resmi.', 'Blokir dan laporkan nomor tersebut.'], resource: 'Simpan waktu panggilan dan isi percakapan sebagai bukti.' },
  { title: 'Masalah judi online', icon: 'heart', steps: ['Hentikan setoran dan akses sekarang.', 'Blokir promosi serta metode pembayaran terkait.', 'Ceritakan pada orang tepercaya.', 'Cari dukungan profesional bila sulit berhenti.'], resource: 'Kamu tidak sendirian. Meminta bantuan adalah langkah yang kuat.' },
]
