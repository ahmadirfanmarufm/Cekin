export const LEVELS = [
  {
    level: 1,
    name: "Si Polos",
    minXp: 0,
    maxXp: 99,
  },
  {
    level: 2,
    name: "Nyadar",
    minXp: 100,
    maxXp: 249,
  },
  {
    level: 3,
    name: "Gokil",
    minXp: 250,
    maxXp: 499,
  },
  {
    level: 4,
    name: "Jago",
    minXp: 500,
    maxXp: 899,
  },
  {
    level: 5,
    name: "Sigma",
    minXp: 900,
    maxXp: Infinity,
  },
] as const;

export function getLevelInfo(totalXp: number) {
  const currentLevel =
    [...LEVELS].reverse().find((level) => totalXp >= level.minXp) ??
    LEVELS[0];

  const nextLevel = LEVELS.find(
    (level) => level.level === currentLevel.level + 1
  );

  const progress = nextLevel
    ? Math.min(
        100,
        ((totalXp - currentLevel.minXp) /
          (nextLevel.minXp - currentLevel.minXp)) *
          100
      )
    : 100;

  return {
    ...currentLevel,
    nextLevel,
    progress,
    xpToNextLevel: nextLevel
      ? Math.max(0, nextLevel.minXp - totalXp)
      : 0,
  };
}