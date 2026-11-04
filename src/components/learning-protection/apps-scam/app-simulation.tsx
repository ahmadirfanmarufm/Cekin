import { AppsScam } from "@/features/learning-protection/components/apps-scam";
import { getSimulation } from "@/features/learning-protection/data/simulations";

export function AppSimulation() {
  const simulation = getSimulation("apps");

  if (!simulation) return null;

  return <AppsScam simulation={simulation} />;
}