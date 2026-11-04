import { TrustLabChat } from "@/features/learning-protection/components/trust-lab-chat";
import { getSimulation } from "@/features/learning-protection/data/simulations";

export function TrustSimulation() {
  const simulation = getSimulation("trust");

  if (!simulation) return null;

  return <TrustLabChat simulation={simulation} />;
}
