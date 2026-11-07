import { connection, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { simulationProgress } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  await connection();

  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    const progress = await db.select({
        simulationId: simulationProgress.simulationId,
      }).from(simulationProgress).where(eq(simulationProgress.userId, user.id));

    return NextResponse.json({
      user: {
        ...user,
        completedSimulations: progress.map(
          (item) => item.simulationId
        ),
      },
    });
  } catch (error) {
    console.error("AUTH_ME_ERROR:", error);

    return NextResponse.json(
      { message: "Gagal memeriksa sesi.", user: null },
      { status: 500 }
    );
  }
}