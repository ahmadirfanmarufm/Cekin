import { SimulationExperience } from "@/features/learning-protection/components//simulation-experience";
import { getSimulation } from "@/features/learning-protection/data/simulations";

export function GamblingSimulation() {
  const simulation = getSimulation("gambling");

  if (!simulation) return null;

  return <SimulationExperience simulation={simulation} />;
}