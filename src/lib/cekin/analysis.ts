export type AnalysisCategory = 'Pesan / Chat' | 'URL / Link' | 'Nomor Telepon' | 'Tawaran Kerja' | 'Investasi' | 'Informasi Lainnya'

export type Finding = {
  id: string
  label: string
  why: string
  tactic: string
  recommendation: string
  points: number
}

export type AnalysisResult = {
  score: number
  level: 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis'
  findings: Finding[]
  category: AnalysisCategory
}

const rules: Array<Omit<Finding, 'points'> & { pattern: RegExp; points: number }> = [
  {
    id: 'critical',
    label: 'Permintaan data rahasia',
    pattern: /\b(otp|pin|password|kata sandi|cvv)\b/i,
    why: 'OTP, PIN, dan kata sandi tidak boleh diminta oleh pihak lain.',
    tactic: 'Pelaku mengambil alih akun atau menyetujui transaksi tanpa izin.',
    recommendation: 'Jangan berikan data tersebut. Hentikan komunikasi dan hubungi layanan melalui kanal resmi.',
    points: 45,
  },
  {
    id: 'payment',
    label: 'Permintaan uang di awal',
    pattern: /(transfer terlebih dahulu|biaya admin(?:istrasi)?|deposit|uang pendaftaran|biaya aktivasi)/i,
    why: 'Permintaan biaya sebelum layanan atau pekerjaan dimulai adalah pola penipuan umum.',
    tactic: 'Nominal awal dibuat kecil agar korban merasa risikonya rendah.',
    recommendation: 'Jangan transfer uang. Verifikasi organisasi melalui situs dan nomor resminya.',
    points: 28,
  },
  {
    id: 'urgency',
    label: 'Tekanan dan urgensi',
    pattern: /(hanya hari ini|sekarang juga|kesempatan terakhir|segera|jangan sampai terlambat|tersisa \d+)/i,
    why: 'Tekanan waktu mengurangi kesempatanmu untuk berpikir dan memverifikasi.',
    tactic: 'Pelaku memicu rasa takut tertinggal agar keputusan dibuat terburu-buru.',
    recommendation: 'Berhenti sejenak. Periksa informasi dari sumber lain sebelum bertindak.',
    points: 16,
  },
  {
    id: 'offer',
    label: 'Imbal hasil tidak realistis',
    pattern: /(dijamin|pasti untung|tanpa risiko|300\.?000.{0,15}500\.?000 per hari|profit \d{2,}%|cuan \d+x)/i,
    why: 'Penghasilan atau keuntungan besar yang dijamin biasanya tidak realistis.',
    tactic: 'Pelaku memanfaatkan keinginan mendapat hasil cepat dengan usaha minim.',
    recommendation: 'Bandingkan dengan standar pasar dan cek legalitas penawar.',
    points: 24,
  },
  {
    id: 'identity',
    label: 'Klaim identitas tanpa verifikasi',
    pattern: /(admin resmi|tim keamanan|pihak bank|customer service|akun kamu akan diblokir)/i,
    why: 'Klaim sebagai pihak berwenang harus diverifikasi secara independen.',
    tactic: 'Pelaku memakai otoritas palsu agar instruksi segera dipatuhi.',
    recommendation: 'Tutup percakapan, lalu hubungi kanal resmi yang kamu cari sendiri.',
    points: 18,
  },
  {
    id: 'url',
    label: 'Pola tautan mencurigakan',
    pattern: /(bit\.ly|tinyurl|wa\.me|t\.me|https?:\/\/[^\s]*(?:-login|-verify|hadiah|bonus)|\.(?:xyz|click|top|buzz|site)\b)/i,
    why: 'Tautan singkat, domain tidak umum, atau nama layanan yang ditiru dapat menyembunyikan tujuan asli.',
    tactic: 'Halaman palsu dibuat menyerupai layanan asli untuk mengambil data masuk.',
    recommendation: 'Jangan buka tautan. Ketik alamat situs resmi secara manual di browser.',
    points: 25,
  },
  {
    id: 'offplatform',
    label: 'Diajak keluar dari platform',
    pattern: /(lanjut whatsapp|hubungi telegram|bayar langsung|di luar aplikasi|chat pribadi)/i,
    why: 'Transaksi di luar platform menghilangkan perlindungan dan jejak pengaduan.',
    tactic: 'Pelaku memindahkan korban ke kanal yang lebih sulit diawasi.',
    recommendation: 'Tetap gunakan pembayaran dan percakapan di platform resmi.',
    points: 14,
  },
  {
    id: 'social',
    label: 'Manipulasi sosial',
    pattern: /(sudah banyak yang|testimoni|dipercaya ribuan|teman kamu|jangan beri tahu siapa pun|rahasia)/i,
    why: 'Popularitas atau kerahasiaan digunakan untuk menggantikan bukti yang dapat diverifikasi.',
    tactic: 'Pelaku menciptakan rasa aman palsu atau mengisolasi korban.',
    recommendation: 'Cari ulasan independen dan diskusikan dengan orang tepercaya.',
    points: 12,
  },
]

export const checkLabels = [
  'Permintaan uang di awal',
  'Tekanan waktu',
  'Janji keuntungan tidak masuk akal',
  'Link mencurigakan',
  'Penyamaran identitas',
  'Permintaan informasi rahasia',
  'Manipulasi psikologis',
]

export function analyzeInput(input: string, category: AnalysisCategory): AnalysisResult {
  const findings = rules
    .filter((rule) => rule.pattern.test(input))
    .map(({ pattern: _pattern, ...finding }) => finding)

  if (category === 'Nomor Telepon' && /^(\+62|62|0)8\d{8,11}$/.test(input.replace(/[\s-]/g, ''))) {
    // A valid format alone is not a risk indicator.
  }

  const rawScore = findings.reduce((sum, item) => sum + item.points, 0)
  const score = Math.min(100, rawScore)
  const level = findings.some((item) => item.id === 'critical')
    ? 'Kritis'
    : score >= 60
      ? 'Kritis'
      : score >= 40
        ? 'Tinggi'
        : score >= 18
          ? 'Sedang'
          : 'Rendah'

  return { score, level, findings, category }
}
