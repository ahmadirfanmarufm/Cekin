import { GamblingAwareness } from "@/features/learning-protection/components/gambling-awareness";
import { getSimulation } from "@/features/learning-protection/data/simulations";

export function GamblingSimulation() {
  const simulation = getSimulation("gambling");

    console.log(
      "total:", simulation?.scenarios.length,
      "ada gamblingDetails:", simulation?.scenarios.filter((s) => s.gamblingDetails).length,
    );

  if (!simulation) return null;

  return <GamblingAwareness simulation={simulation} />;
}