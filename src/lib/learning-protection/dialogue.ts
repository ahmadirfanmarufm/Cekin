import type {
  DialogueEnding,
  DialogueOption,
  DialogueTree,
  DialogueTurn,
  SimulationConfig,
} from "@/types/learning-protection";

const MAX_ATTEMPTS_PER_LEVEL = 30;
const MAX_PATH_LENGTH = 12;

export type DialogueWalk = {
  mistakes: number;
  flags: string[];
  ending: DialogueEnding | null;
};

export function walkDialoguePath(
  dialogue: DialogueTree,
  optionIds: string[],
): DialogueWalk | null {
  let turnId: string | null = dialogue.start;
  let mistakes = 0;
  let ending: DialogueEnding | null = null;
  const flags: string[] = [];

  for (const optionId of optionIds) {
    if (ending || !turnId) return null;

    const turn: DialogueTurn | undefined = dialogue.turns[turnId];
    if (!turn) return null;

    const option: DialogueOption | undefined = turn.options.find((item: DialogueOption) => item.id === optionId);
    if (!option) return null;

    if (!option.isSafe) mistakes += 1;
    if (option.flag && !flags.includes(option.flag)) flags.push(option.flag);

    if (option.end) {
      ending = option.end;
      turnId = null;
    } else if (option.next) {
      turnId = option.next;
    } else {
      return null;
    }
  }

  return { mistakes, flags, ending };
}

/** Total pilihan keliru dari beberapa jalur (percobaan). */
export function mistakesOfPaths(dialogue: DialogueTree, paths: string[][]) {
  return paths.reduce(
    (sum, path) => sum + (walkDialoguePath(dialogue, path)?.mistakes ?? 0),
    0,
  );
}

/**
 * Validasi riwayat percakapan dari client, lalu hitung jumlah kekeliruan per level.
 *
 * Format answers: { "trust-1": [["b","a"], ["c","c","c"]], ... }
 * - Setiap level berisi daftar percobaan, tiap percobaan adalah jalur id pilihan.
 * - Semua percobaan sebelum yang terakhir harus berakhir "lose".
 * - Percobaan terakhir harus berakhir "win".
 * - Semua level harus ada, tanpa level tambahan.
 */
export function collectDialogueWrongCounts(
  simulation: SimulationConfig,
  answers: unknown,
): number[] | null {
  if (typeof answers !== "object" || answers === null || Array.isArray(answers)) {
    return null;
  }

  const attemptsByScenario = answers as Record<string, unknown>;
  const scenarios = simulation.scenarios;

  if (Object.keys(attemptsByScenario).length !== scenarios.length) return null;

  const wrongCounts: number[] = [];

  for (const scenario of scenarios) {
    const dialogue = scenario.dialogue;
    const attempts = attemptsByScenario[scenario.id];

    if (
      !dialogue ||
      !Array.isArray(attempts) ||
      attempts.length < 1 ||
      attempts.length > MAX_ATTEMPTS_PER_LEVEL
    ) {
      return null;
    }

    let mistakes = 0;

    for (let index = 0; index < attempts.length; index += 1) {
      const path = attempts[index];

      if (
        !Array.isArray(path) ||
        path.length < 1 ||
        path.length > MAX_PATH_LENGTH ||
        !path.every((item) => typeof item === "string")
      ) {
        return null;
      }

      const walk = walkDialoguePath(dialogue, path as string[]);

      if (!walk || !walk.ending) return null;

      const isLast = index === attempts.length - 1;

      if (isLast && walk.ending.result !== "win") return null;
      if (!isLast && walk.ending.result !== "lose") return null;

      mistakes += walk.mistakes;
    }

    wrongCounts.push(mistakes);
  }

  return wrongCounts;
}