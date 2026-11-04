import { PhishingEmail } from "@/features/learning-protection/components/phising-email";
import { getSimulation } from "@/features/learning-protection/data/simulations";

export function PhishingSimulation() {
  const simulation = getSimulation("phishing");

  if (!simulation) return null;

  return <PhishingEmail simulation={simulation} />;
}