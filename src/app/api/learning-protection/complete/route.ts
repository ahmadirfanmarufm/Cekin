import { NextRequest, NextResponse } from "next/server";
import { and, eq, lt, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { users, simulationProgress } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/auth/request-security";
import { getSimulation } from "@/features/learning-protection/data/simulations";
import { collectDialogueWrongCounts } from "@/lib/learning-protection/dialogue";
import {
  APPS_SCAM_MAX_XP,
  GAMBLING_MAX_XP,
  MAX_SIMULATION_XP,
  MIND_TRAP_MAX_XP,
  PHISHING_MAX_XP,
  SPAM_CALL_MAX_XP,
  TRUST_LAB_MAX_XP,
  calculateAppsScamXp,
  calculateGamblingXp,
  calculateMindTrapXp,
  calculatePhishingXp,
  calculateSimulationXp,
  calculateSpamCallXp,
  calculateTrustLabXp,
} from "@/lib/learning-protection/xp";
import type { SimulationId } from "@/types/learning-protection";

const validSimulations = [
  "trust-lab",
  "apps-scam",
  "phishing-attack",
  "spam-call",
  "online-gambling",
  "mind-trap",
];

const MAX_SCENARIOS = 50;
const MAX_PICKS_PER_LEVEL = 30;

type XpResult = { levelXp: number; bonus: number; total: number };

type XpConfig = {
  key: Extract<SimulationId, "trust" | "apps" | "phishing" | "gambling" | "mind" | "calls">;
  calculate: (wrongCounts: number[]) => XpResult;
  maxXp: number;
};

const XP_SIMULATIONS: Record<string, XpConfig> = {
  "trust-lab": {
    key: "trust",
    calculate: calculateTrustLabXp,
    maxXp: TRUST_LAB_MAX_XP,
  },
  "apps-scam": {
    key: "apps",
    calculate: calculateAppsScamXp,
    maxXp: APPS_SCAM_MAX_XP,
  },
  "phishing-attack": {
    key: "phishing",
    calculate: calculatePhishingXp,
    maxXp: PHISHING_MAX_XP,
  },
  "online-gambling": {
    key: "gambling",
    calculate: calculateGamblingXp,
    maxXp: GAMBLING_MAX_XP,
  },
  "mind-trap": {
    key: "mind",
    calculate: calculateMindTrapXp,
    maxXp: MIND_TRAP_MAX_XP,
  },
  "spam-call": {
    key: "calls",
    calculate: calculateSpamCallXp,
    maxXp: SPAM_CALL_MAX_XP,
  },
};

function collectWrongCounts(key: XpConfig["key"], answers: unknown) {
  const simulation = getSimulation(key);

  if (!simulation) {
    return null;
  }

  if (simulation.scenarios.every((scenario) => scenario.dialogue)) {
    return collectDialogueWrongCounts(simulation, answers);
  }

  if (typeof answers !== "object" || answers === null || Array.isArray(answers)) {
    return null;
  }


  const picksByScenario = answers as Record<string, unknown>;
  const scenarios = simulation.scenarios;

  if (Object.keys(picksByScenario).length !== scenarios.length) {
    return null;
  }

  const wrongCounts: number[] = [];

  for (const scenario of scenarios) {
    const picks = picksByScenario[scenario.id];

    if (
      !Array.isArray(picks) ||
      picks.length < 1 ||
      picks.length > MAX_PICKS_PER_LEVEL
    ) {
      return null;
    }

    let wrong = 0;

    for (let index = 0; index < picks.length; index += 1) {
      const choice = scenario.choices.find((item) => item.id === picks[index]);

      if (!choice) return null;

      const isLast = index === picks.length - 1;

      if (isLast && !choice.isSafe) return null;

      if (!isLast) {
        if (choice.isSafe) return null;

        wrong += 1;
      }
    }

    wrongCounts.push(wrong);
  }

  return wrongCounts;
}

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json(
        { message: "Request tidak diizinkan." },
        { status: 403 },
      );
    }

    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { message: "Silakan login untuk menyimpan progres." },
        { status: 401 },
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("simulationId" in body) ||
      typeof body.simulationId !== "string" ||
      !validSimulations.includes(body.simulationId)
    ) {
      return NextResponse.json(
        { message: "Simulasi tidak valid." },
        { status: 400 },
      );
    }

    const simulationId = body.simulationId;
    const record = body as Record<string, unknown>;

    let scoreXp = MAX_SIMULATION_XP;
    let maxXp = MAX_SIMULATION_XP;
    let levelXp: number | undefined;
    let bonusXp: number | undefined;

    const xpConfig: XpConfig | undefined = XP_SIMULATIONS[simulationId];

    if (xpConfig) {
      const wrongCounts = collectWrongCounts(xpConfig.key, record.answers);

      if (!wrongCounts) {
        return NextResponse.json(
          { message: "Jawaban simulasi tidak valid." },
          { status: 400 },
        );
      }

      const result = xpConfig.calculate(wrongCounts);

      scoreXp = result.total;
      maxXp = xpConfig.maxXp;
      levelXp = result.levelXp;
      bonusXp = result.bonus;
    } else if ("safeCount" in record || "totalCount" in record) {
      const { safeCount, totalCount } = record;

      if (
        typeof safeCount !== "number" ||
        typeof totalCount !== "number" ||
        !Number.isInteger(safeCount) ||
        !Number.isInteger(totalCount) ||
        totalCount < 1 ||
        totalCount > MAX_SCENARIOS ||
        safeCount < 0 ||
        safeCount > totalCount
      ) {
        return NextResponse.json(
          { message: "Skor simulasi tidak valid." },
          { status: 400 },
        );
      }

      scoreXp = calculateSimulationXp(safeCount, totalCount);
    }

    const [inserted] = await db
      .insert(simulationProgress)
      .values({
        userId: user.id,
        simulationId,
        xpEarned: scoreXp,
      })
      .onConflictDoNothing()
      .returning({ id: simulationProgress.id });

    const firstCompletion = Boolean(inserted);
    let gainedXp = 0;
    let bestXp = scoreXp;

    if (inserted) {
      gainedXp = scoreXp;
    } else {
      const [current] = await db
        .select({ xpEarned: simulationProgress.xpEarned })
        .from(simulationProgress)
        .where(
          and(
            eq(simulationProgress.userId, user.id),
            eq(simulationProgress.simulationId, simulationId),
          ),
        )
        .limit(1);

      const previousXp = current?.xpEarned ?? 0;
      bestXp = Math.max(previousXp, scoreXp);

      if (scoreXp > previousXp) {
        const [improved] = await db
          .update(simulationProgress)
          .set({ xpEarned: scoreXp, completedAt: new Date() })
          .where(
            and(
              eq(simulationProgress.userId, user.id),
              eq(simulationProgress.simulationId, simulationId),
              lt(simulationProgress.xpEarned, scoreXp),
            ),
          )
          .returning({ id: simulationProgress.id });

        if (improved) gainedXp = scoreXp - previousXp;
      }
    }

    let totalXp = user.totalXp;

    if (gainedXp > 0) {
      const [updatedUser] = await db
        .update(users)
        .set({
          totalXp: sql`${users.totalXp} + ${gainedXp}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning({ totalXp: users.totalXp });

      totalXp = updatedUser?.totalXp ?? user.totalXp + gainedXp;
    } else {
      const [currentUser] = await db
        .select({ totalXp: users.totalXp })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      totalXp = currentUser?.totalXp ?? user.totalXp;
    }

    return NextResponse.json({
      message: "Simulasi berhasil diselesaikan.",
      firstCompletion,
      alreadyCompleted: !firstCompletion,
      xpEarned: gainedXp,
      scoreXp,
      bestXp,
      maxXp,
      levelXp,
      bonusXp,
      totalXp,
    });
  } catch (error) {
    console.error("SIMULATION_COMPLETE_ERROR:", error);

    return NextResponse.json(
      { message: "Gagal menyimpan progres simulasi." },
      { status: 500 },
    );
  }
}