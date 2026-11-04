import { MindTrapSimulation } from "@/features/learning-protection/components/mind-trap-simulation";
import { getSimulation } from "@/features/learning-protection/data/simulations";

export function MindSimulation() {
  const simulation = getSimulation("mind");

  if (!simulation) return null;

  return <MindTrapSimulation simulation={simulation} />;
}