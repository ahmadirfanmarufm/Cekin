"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  DialogueEnding,
  DialogueOption,
  SimulationScenario,
} from "@/types/learning-protection";
import { seededShuffle } from "./shuffle";

export type DialogueBubble = {
  id: number;
  from: "them" | "me";
  text: string;
};

export type DialoguePhase = "idle" | "revealing" | "choosing" | "ended";

type Options = {
  scenario: SimulationScenario | undefined;
  /** false = percakapan belum dimulai (misalnya telepon belum dijawab). */
  enabled?: boolean;
  /** Berubah = percakapan diulang dari awal. */
  startKey: string | number;
  /** Dasar pengacakan urutan pilihan. */
  shuffleSeed: string;
  /** true = pesan langsung muncul tanpa jeda (tutorial, reduced motion). */
  instant: boolean;
  onFinish: (path: string[], ending: DialogueEnding) => void;
};

const TYPING_DELAY = 700;

export function useDialogue({
  scenario,
  enabled = true,
  startKey,
  shuffleSeed,
  instant,
  onFinish,
}: Options) {
  const [thread, setThread] = useState<DialogueBubble[]>([]);
  const [typing, setTyping] = useState(false);
  const [phase, setPhase] = useState<DialoguePhase>("idle");
  const [turnId, setTurnId] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [flags, setFlags] = useState<string[]>([]);
  const [ending, setEnding] = useState<DialogueEnding | null>(null);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const token = useRef(0);
  const bubbleCounter = useRef(0);

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const instantRef = useRef(instant);
  instantRef.current = instant;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const makeBubble = useCallback(
    (from: DialogueBubble["from"], text: string): DialogueBubble => {
      bubbleCounter.current += 1;
      return { id: bubbleCounter.current, from, text };
    },
    [],
  );

  // Munculkan pesan lawan bicara satu per satu, lalu panggil `done`.
  const reveal = useCallback(
    (lines: string[], done: () => void) => {
      if (!lines.length) {
        done();
        return;
      }

      if (instantRef.current) {
        const bubbles = lines.map((line) => makeBubble("them", line));
        setThread((previous) => [...previous, ...bubbles]);
        done();
        return;
      }

      const myToken = token.current;
      let index = 0;

      setTyping(true);

      const showNext = () => {
        const timer = setTimeout(() => {
          if (token.current !== myToken) return;

          const bubble = makeBubble("them", lines[index]);
          setThread((previous) => [...previous, bubble]);
          index += 1;

          if (index < lines.length) {
            showNext();
          } else {
            setTyping(false);
            done();
          }
        }, TYPING_DELAY);

        timers.current.push(timer);
      };

      showNext();
    },
    [makeBubble],
  );

  // Mulai (atau ulangi) percakapan.
  useEffect(() => {
    token.current += 1;
    clearTimers();

    setThread([]);
    setTyping(false);
    setPath([]);
    setFlags([]);
    setEnding(null);
    setTurnId(null);
    setPhase("idle");

    const dialogue = scenario?.dialogue;
    if (!dialogue || !enabled) return;

    const start = dialogue.turns[dialogue.start];
    if (!start) return;

    const myToken = token.current;

    setTurnId(dialogue.start);
    setPhase("revealing");
    reveal(start.lines ?? [], () => {
      if (token.current === myToken) setPhase("choosing");
    });

    return () => {
      token.current += 1;
      clearTimers();
    };
  }, [scenario, enabled, startKey, reveal, clearTimers]);

  const turn =
    scenario?.dialogue && turnId ? scenario.dialogue.turns[turnId] : undefined;

  // Pilihan hanya tampil saat giliran user, dengan urutan diacak.
  const options = useMemo(
    () =>
      turn && phase === "choosing"
        ? seededShuffle(turn.options, `${shuffleSeed}:${turnId}`)
        : [],
    [turn, phase, shuffleSeed, turnId],
  );

  const pick = useCallback(
    (option: DialogueOption) => {
      const dialogue = scenario?.dialogue;
      if (phase !== "choosing" || !dialogue) return;

      const nextPath = [...path, option.id];
      const myToken = token.current;

      setPath(nextPath);
      setThread((previous) => [...previous, makeBubble("me", option.label)]);
      setPhase("revealing");

      const afterReply = () => {
        if (token.current !== myToken) return;

        const flag = option.flag;
        if (flag) {
          setFlags((previous) =>
            previous.includes(flag) ? previous : [...previous, flag],
          );
        }

        if (option.end) {
          setEnding(option.end);
          setPhase("ended");
          onFinishRef.current(nextPath, option.end);
          return;
        }

        const nextTurn = option.next ? dialogue.turns[option.next] : undefined;

        if (option.next && nextTurn) {
          setTurnId(option.next);
          reveal(nextTurn.lines ?? [], () => {
            if (token.current === myToken) setPhase("choosing");
          });
        }
      };

      reveal(option.reply ?? [], afterReply);
    },
    [phase, path, scenario, reveal, makeBubble],
  );

  return { thread, typing, phase, options, path, flags, ending, pick };
}