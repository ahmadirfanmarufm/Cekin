import type {
  ChatProfile,
  DialogueOption,
  DialogueTurn,
  ScenarioDifficulty,
  ScenarioSender,
  SimulationScenario,
} from "@/types/learning-protection/index";

type Reply = string | string[];

const toLines = (reply?: Reply) =>
  reply === undefined ? undefined : Array.isArray(reply) ? reply : [reply];

export const fatal = (id: string, label: string, why: string, reply?: Reply): DialogueOption => ({
  id, label, isSafe: false, reply: toLines(reply), end: { result: "lose", why },
});

export const slip = (id: string, label: string, reply: Reply, next: string, flag?: string): DialogueOption => ({
  id, label, isSafe: false, reply: toLines(reply), next, flag,
});

export const good = (id: string, label: string, reply: Reply, next: string, flag?: string): DialogueOption => ({
  id, label, isSafe: true, reply: toLines(reply), next, flag,
});

export const exit = (id: string, label: string, why: string, reply?: Reply): DialogueOption => ({
  id, label, isSafe: true, reply: toLines(reply), end: { result: "win", why },
});

export const turn = (lines: string[], options: DialogueOption[]): DialogueTurn => ({ lines, options });

type LevelInput = {
  id: string;
  level: number;
  difficulty: ScenarioDifficulty;
  topic: string;
  title: string;
  description: string;
  sender: ScenarioSender;
  takeaway: string;
  profile?: ChatProfile;
  turns: Record<string, DialogueTurn>;
};

export function defineLevel(input: LevelInput): SimulationScenario {
  const { turns, ...meta } = input;

  return {
    ...meta,
    context: turns.t1.lines?.join("\n\n") ?? "",
    messages: turns.t1.lines,
    choices: [],
    dialogue: { start: "t1", turns },
  };
}