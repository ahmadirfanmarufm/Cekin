import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { users, simulationProgress } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/auth/request-security";

const validSimulations = [
  "trust-lab",
  "game-apps-scam",
  "phishing-attack",
  "spam-call",
  "online-gambling",
  "mind-trap",
];

const XP_REWARD = 50;

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) {
        return NextResponse.json(
            { message: "Request tidak diizinkan." },
            { status: 403 }
        );
    }

    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { message: "Silakan login untuk menyimpan progres." },
        { status: 401 }
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
        { status: 400 }
      );
    }

    const simulationId = body.simulationId;

    const [newProgress] = await db
      .insert(simulationProgress)
      .values({
        userId: user.id,
        simulationId,
        xpEarned: XP_REWARD,
      })
      .onConflictDoNothing()
      .returning({
        id: simulationProgress.id,
      });

    if (!newProgress) {
      const [currentUser] = await db
        .select({ totalXp: users.totalXp })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      return NextResponse.json({
        message: "Simulasi ini sudah pernah diselesaikan.",
        alreadyCompleted: true,
        totalXp: currentUser?.totalXp ?? user.totalXp,
        xpEarned: 0,
      });
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        totalXp: sql`${users.totalXp} + ${XP_REWARD}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning({
        totalXp: users.totalXp,
      });

    return NextResponse.json({
      message: "Simulasi berhasil diselesaikan.",
      alreadyCompleted: false,
      xpEarned: XP_REWARD,
      totalXp: updatedUser?.totalXp ?? user.totalXp + XP_REWARD,
    });
  } catch (error) {
    console.error("SIMULATION_COMPLETE_ERROR:", error);

    return NextResponse.json(
      { message: "Gagal menyimpan progres simulasi." },
      { status: 500 }
    );
  }
}