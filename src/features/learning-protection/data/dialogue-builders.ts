import type {
  DialogueOption,
  DialogueTurn,
  ScenarioDifficulty,
  ScenarioSender,
  SimulationScenario,
} from "@/types/learning-protection/index";

type Reply = string | string[];

const toLines = (reply?: Reply) => reply === undefined ? undefined : Array.isArray(reply) ? reply : [reply];

export const fatal = (
  id: string,
  label: string,
  why: string,
  reply?: Reply,
): DialogueOption => ({
  id,
  label,
  isSafe: false,
  reply: toLines(reply),
  end: { result: "lose", why },
});

export const slip = (
  id: string,
  label: string,
  reply: Reply,
  next: string,
  flag?: string,
): DialogueOption => ({
  id,
  label,
  isSafe: false,
  reply: toLines(reply),
  next,
  flag,
});

/** Langkah tepat: percakapan lanjut. */
export const good = (
  id: string,
  label: string,
  reply: Reply,
  next: string,
  flag?: string,
): DialogueOption => ({
  id,
  label,
  isSafe: true,
  reply: toLines(reply),
  next,
  flag,
});

/** Keluar dengan benar: percakapan berakhir menang. */
export const exit = (
  id: string,
  label: string,
  why: string,
  reply?: Reply,
): DialogueOption => ({
  id,
  label,
  isSafe: true,
  reply: toLines(reply),
  end: { result: "win", why },
});

export const turn = (
  lines: string[],
  options: DialogueOption[],
): DialogueTurn => ({ lines, options });

type LevelInput = {
  id: string;
  level: number;
  difficulty: ScenarioDifficulty;
  topic: string;
  title: string;
  description: string;
  sender: ScenarioSender;
  takeaway: string;
  t1: DialogueTurn;
  t2: DialogueTurn;
  t3: DialogueTurn;
};

export function defineLevel(input: LevelInput): SimulationScenario {
  const { t1, t2, t3, ...meta } = input;

  return {
    ...meta,
    context: t1.lines?.join("\n\n") ?? "",
    messages: t1.lines,
    choices: [],
    dialogue: { start: "t1", turns: { t1, t2, t3 } },
  };
}