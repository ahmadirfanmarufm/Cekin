import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { simulationProgress } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/session";

const validSimulations = [
  "trust-lab",
  "apps-scam",
  "phishing-attack",
  "spam-call",
  "online-gambling",
  "mind-trap",
];

export async function GET(request: NextRequest) {
  const simulationId = request.nextUrl.searchParams.get("simulationId") ?? "";

  if (!validSimulations.includes(simulationId)) {
    return NextResponse.json({ message: "Simulasi tidak valid." }, { status: 400 });
  }

  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ authenticated: false, userId: null, completed: false });
  }

  const [row] = await db.select({ id: simulationProgress.id }).from(simulationProgress).where(
      and(
        eq(simulationProgress.userId, user.id),
        eq(simulationProgress.simulationId, simulationId),
      ),
    ).limit(1);

  return NextResponse.json({
    authenticated: true,
    userId: user.id,
    completed: Boolean(row),
  });
}