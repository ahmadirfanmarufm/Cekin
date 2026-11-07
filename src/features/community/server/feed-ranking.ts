export type RankablePost = {
  id: string;
  category: string;
  createdAt: Date | string;
  verificationStatus: string;
  likeCount: number;
  commentCount: number;
  reportCount?: number; // laporan penyalahgunaan terhadap postingan (opsional)
};

export type RankOptions = {
  now?: number;
  limit?: number;
  /** Berapa banyak postingan per kategori yang baru dilihat viewer (sudah meluruh). */
  seenByCategory?: Record<string, number>;
};

const HOUR = 3_600_000;

const FRESHNESS_HALF_LIFE_H = 36;
const FRESHNESS_FLOOR = 0.05; // postingan lama yang bagus tetap punya peluang kecil
const HEAT_WINDOW_H = 72;
const HEAT_HALF_LIFE_H = 24;

const REPEAT_PENALTY = 0.6; // per postingan sekategori yang sudah terpilih di halaman ini
const FATIGUE_PER_SEEN = 0.9; // per postingan sekategori yang sudah dilihat viewer
const FATIGUE_FLOOR = 0.25;
const MAX_STREAK = 2; // maksimal berturut-turut dari kategori yang sama

const VERIFICATION_WEIGHT: Record<string, number> = { verified: 1.3, unverified: 1 };

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const ageHours = (post: RankablePost, now: number) =>
  Math.max(0, (now - new Date(post.createdAt).getTime()) / HOUR);

const engagementOf = (post: RankablePost) => post.likeCount + 2 * post.commentCount;

export function computeCategoryHeat(posts: RankablePost[], now: number): Map<string, number> {
  const weight = new Map<string, number>();

  for (const post of posts) {
    const age = ageHours(post, now);
    if (age > HEAT_WINDOW_H) continue;

    const w = 0.5 ** (age / HEAT_HALF_LIFE_H) * (1 + 0.5 * Math.log1p(engagementOf(post)));
    weight.set(post.category, (weight.get(post.category) ?? 0) + w);
  }

  if (weight.size === 0) return new Map();

  const mean = [...weight.values()].reduce((a, b) => a + b, 0) / weight.size;
  const heat = new Map<string, number>();
  for (const [category, w] of weight) {
    heat.set(category, clamp(1 + 0.4 * Math.log2(w / mean), 0.8, 1.8));
  }
  return heat;
}

export function scorePost(post: RankablePost, heat: number, now: number): number {
  const quality = 1 + Math.log1p(engagementOf(post));
  const freshness = Math.max(FRESHNESS_FLOOR, 0.5 ** (ageHours(post, now) / FRESHNESS_HALF_LIFE_H));
  const verification = VERIFICATION_WEIGHT[post.verificationStatus] ?? 1;
  const reportPenalty = 1 / (1 + (post.reportCount ?? 0) * 0.15);

  return quality * freshness * verification * reportPenalty * heat;
}

export function rankFeed<T extends RankablePost>(posts: T[], options: RankOptions = {}): T[] {
  const now = options.now ?? Date.now();
  const limit = Math.min(options.limit ?? posts.length, posts.length);
  const seen = options.seenByCategory ?? {};

  const heat = computeCategoryHeat(posts, now);
  const pool = posts.map((post) => ({
    post,
    score: scorePost(post, heat.get(post.category) ?? 1, now),
  }));

  const picked: T[] = [];
  const pickedPerCategory = new Map<string, number>();

  while (picked.length < limit && pool.length > 0) {
    const [prev, prev2] = [picked.at(-1)?.category, picked.at(-2)?.category];
    const streakCategory = prev && prev === prev2 && MAX_STREAK === 2 ? prev : null;
    const canAvoidStreak = streakCategory !== null && pool.some((i) => i.post.category !== streakCategory);

    let bestIndex = -1;
    let bestValue = -Infinity;

    pool.forEach((item, index) => {
      const category = item.post.category;
      if (canAvoidStreak && category === streakCategory) return;

      const fatigue = Math.max(FATIGUE_FLOOR, FATIGUE_PER_SEEN ** (seen[category] ?? 0));
      const repeat = REPEAT_PENALTY ** (pickedPerCategory.get(category) ?? 0);
      const value = item.score * fatigue * repeat;

      if (value > bestValue) {
        bestValue = value;
        bestIndex = index;
      }
    });

    const [chosen] = pool.splice(bestIndex, 1);
    picked.push(chosen.post);
    pickedPerCategory.set(chosen.post.category, (pickedPerCategory.get(chosen.post.category) ?? 0) + 1);
  }

  return picked;
}

export function parseSeen(raw: string | null): Record<string, number> {
  const result: Record<string, number> = {};
  if (!raw) return result;

  for (const part of raw.split(",").slice(0, 20)) {
    const [key, value] = part.split(":");
    const n = Number(value);
    if (key && key.length <= 40 && Number.isFinite(n)) result[key] = clamp(n, 0, 50);
  }
  return result;
}