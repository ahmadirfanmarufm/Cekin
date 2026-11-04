import { SpamCallSimulation } from "@/features/learning-protection/components/spam-call-simulation";
import { getSimulation } from "@/features/learning-protection/data/simulations";

export function CallSimulation() {
  const simulation = getSimulation("calls");

  if (!simulation) return null;

  return <SpamCallSimulation simulation={simulation} />;
}