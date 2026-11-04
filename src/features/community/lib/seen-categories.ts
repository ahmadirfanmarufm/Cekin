const KEY = "cekin:seen-categories";
const HALF_LIFE_MS = 24 * 60 * 60 * 1000;

export function readSeen(): Record<string, number> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};

    const { counts, at } = JSON.parse(raw) as { counts: Record<string, number>; at: number };
    const decay = 0.5 ** ((Date.now() - at) / HALF_LIFE_MS);

    return Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, v * decay]));
  } catch {
    return {};
  }
}

export function markSeen(category: string) {
  try {
    const counts = readSeen();
    counts[category] = (counts[category] ?? 0) + 1;
    localStorage.setItem(KEY, JSON.stringify({ counts, at: Date.now() }));
  } catch {
  }
}

export function seenQuery(): string {
  return Object.entries(readSeen())
    .map(([k, v]) => `${encodeURIComponent(k)}:${v.toFixed(1)}`)
    .join(",");
}