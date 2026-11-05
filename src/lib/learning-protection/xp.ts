export const MAX_SIMULATION_XP = 50;

export function calculateSimulationXp(safeCount: number, totalCount: number) {
  if (totalCount <= 0) return 0;

  const ratio = Math.min(Math.max(safeCount / totalCount, 0), 1);

  return Math.round(MAX_SIMULATION_XP * ratio);
}

export function xpPerScenario(totalCount: number) {
  if (totalCount <= 0) return 0;

  return Math.round(MAX_SIMULATION_XP / totalCount);
}

export const TRUST_LAB_MAX_LEVEL = 10;

export const TRUST_LAB_LEVEL_XP: readonly number[] = [
  4, 6, 7, 8, 9, 10, 12, 13, 14, 17,
];

export const TRUST_LAB_MASTER_BONUS = 25;

export const TRUST_LAB_LEVEL_XP_TOTAL = TRUST_LAB_LEVEL_XP.reduce(
  (sum, xp) => sum + xp,
  0,
);

export const TRUST_LAB_MAX_XP = TRUST_LAB_LEVEL_XP_TOTAL + TRUST_LAB_MASTER_BONUS;

export function trustLabAttemptMultiplier(wrongAttempts: number) {
  if (wrongAttempts <= 0) return 1;
  if (wrongAttempts === 1) return 0.5;
  return 0.25;
}

export function trustLabLevelXp(level: number, wrongAttempts: number) {
  const base = TRUST_LAB_LEVEL_XP[level - 1] ?? 0;

  return Math.round(base * trustLabAttemptMultiplier(wrongAttempts));
}

export function calculateTrustLabXp(wrongCounts: number[]) {
  const levelXp = wrongCounts.reduce(
    (sum, wrong, index) => sum + trustLabLevelXp(index + 1, wrong),
    0,
  );

  const bonus = wrongCounts.length >= TRUST_LAB_MAX_LEVEL ? TRUST_LAB_MASTER_BONUS : 0;

  return { levelXp, bonus, total: levelXp + bonus };
}

export const APPS_SCAM_MAX_LEVEL = 10;

export const APPS_SCAM_LEVEL_XP: readonly number[] = [
  3, 4, 5, 6, 7, 8, 10, 11, 12, 14,
];

export const APPS_SCAM_MASTER_BONUS = 20;

export const APPS_SCAM_LEVEL_XP_TOTAL = APPS_SCAM_LEVEL_XP.reduce(
  (sum, xp) => sum + xp,
  0,
);

export const APPS_SCAM_MAX_XP = APPS_SCAM_LEVEL_XP_TOTAL + APPS_SCAM_MASTER_BONUS;

export function appsScamLevelXp(level: number, wrongAttempts: number) {
  const base = APPS_SCAM_LEVEL_XP[level - 1] ?? 0;

  return Math.round(base * trustLabAttemptMultiplier(wrongAttempts));
}

export function calculateAppsScamXp(wrongCounts: number[]) {
  const levelXp = wrongCounts.reduce(
    (sum, wrong, index) => sum + appsScamLevelXp(index + 1, wrong),
    0,
  );

  const bonus = wrongCounts.length >= APPS_SCAM_MAX_LEVEL ? APPS_SCAM_MASTER_BONUS : 0;

  return { levelXp, bonus, total: levelXp + bonus };
}

export const PHISHING_MAX_LEVEL = 10;

export const PHISHING_LEVEL_XP: readonly number[] = [
  3, 4, 5, 6, 7, 8, 10, 11, 12, 14,
];

export const PHISHING_MASTER_BONUS = 20;

export const PHISHING_MAX_XP =
  PHISHING_LEVEL_XP.reduce((sum, xp) => sum + xp, 0) + PHISHING_MASTER_BONUS;

export function phishingLevelXp(level: number, wrongAttempts: number) {
  const base = PHISHING_LEVEL_XP[level - 1] ?? 0;

  return Math.round(base * trustLabAttemptMultiplier(wrongAttempts));
}

export function calculatePhishingXp(wrongCounts: number[]) {
  const levelXp = wrongCounts.reduce(
    (sum, wrong, index) => sum + phishingLevelXp(index + 1, wrong),
    0,
  );

  const bonus = wrongCounts.length >= PHISHING_MAX_LEVEL ? PHISHING_MASTER_BONUS : 0;

  return { levelXp, bonus, total: levelXp + bonus };
}

export const MIND_TRAP_MAX_LEVEL = 10;
 
export const MIND_TRAP_LEVEL_XP: readonly number[] = [
  3, 4, 5, 6, 7, 8, 10, 11, 12, 14,
];
 
export const MIND_TRAP_MASTER_BONUS = 20;
 
export const MIND_TRAP_LEVEL_XP_TOTAL = MIND_TRAP_LEVEL_XP.reduce(
  (sum, xp) => sum + xp,
  0,
);
 
export const MIND_TRAP_MAX_XP = MIND_TRAP_LEVEL_XP_TOTAL + MIND_TRAP_MASTER_BONUS;
 
export function mindTrapLevelXp(level: number, wrongAttempts: number) {
  const base = MIND_TRAP_LEVEL_XP[level - 1] ?? 0;
 
  return Math.round(base * trustLabAttemptMultiplier(wrongAttempts));
}
 
export function calculateMindTrapXp(wrongCounts: number[]) {
  const levelXp = wrongCounts.reduce(
    (sum, wrong, index) => sum + mindTrapLevelXp(index + 1, wrong),
    0,
  );
 
  const bonus = wrongCounts.length >= MIND_TRAP_MAX_LEVEL ? MIND_TRAP_MASTER_BONUS : 0;
 
  return { levelXp, bonus, total: levelXp + bonus };
}

export const SPAM_CALL_MAX_LEVEL = 10;

export const SPAM_CALL_LEVEL_XP: readonly number[] = [
  3, 4, 5, 6, 7, 8, 10, 11, 12, 14,
];

export const SPAM_CALL_MASTER_BONUS = 20;

export const SPAM_CALL_LEVEL_XP_TOTAL = SPAM_CALL_LEVEL_XP.reduce(
  (sum, xp) => sum + xp,
  0,
);

export const SPAM_CALL_MAX_XP = SPAM_CALL_LEVEL_XP_TOTAL + SPAM_CALL_MASTER_BONUS;

export function spamCallLevelXp(level: number, wrongAttempts: number) {
  const base = SPAM_CALL_LEVEL_XP[level - 1] ?? 0;

  return Math.round(base * trustLabAttemptMultiplier(wrongAttempts));
}

export function calculateSpamCallXp(wrongCounts: number[]) {
  const levelXp = wrongCounts.reduce(
    (sum, wrong, index) => sum + spamCallLevelXp(index + 1, wrong),
    0,
  );

  const bonus = wrongCounts.length >= SPAM_CALL_MAX_LEVEL ? SPAM_CALL_MASTER_BONUS : 0;

  return { levelXp, bonus, total: levelXp + bonus };
}

export const GAMBLING_MAX_LEVEL = 10;

export const GAMBLING_LEVEL_XP: readonly number[] = [
  3, 4, 5, 6, 7, 8, 10, 11, 12, 14,
];

export const GAMBLING_MASTER_BONUS = 20;

export const GAMBLING_MAX_XP =
  GAMBLING_LEVEL_XP.reduce((sum, xp) => sum + xp, 0) + GAMBLING_MASTER_BONUS;

export function gamblingLevelXp(level: number, wrongAttempts: number) {
  const base = GAMBLING_LEVEL_XP[level - 1] ?? 0;

  return Math.round(base * trustLabAttemptMultiplier(wrongAttempts));
}

export function calculateGamblingXp(wrongCounts: number[]) {
  const levelXp = wrongCounts.reduce(
    (sum, wrong, index) => sum + gamblingLevelXp(index + 1, wrong),
    0,
  );

  const bonus = wrongCounts.length >= GAMBLING_MAX_LEVEL ? GAMBLING_MASTER_BONUS : 0;

  return { levelXp, bonus, total: levelXp + bonus };
}