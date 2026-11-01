export type SimulationId =
  | "trust"
  | "apps"
  | "phishing"
  | "calls"
  | "gambling"
  | "mind";

export type SimulationChoice = {
  id: string;
  label: string;
  isSafe: boolean;
  feedback: string;
  explanation: string;
  saferAction: string;
};

export type SimulationScenario = {
  id: string;
  title: string;
  description: string;
  context: string;
  choices: SimulationChoice[];
};

export type SimulationConfig = {
  id: SimulationId;
  title: string;
  subtitle: string;
  description: string;
  difficulty: "Pemula" | "Menengah" | "Penting";
  duration: string;
  icon: string;
  color: string;
  scenarios: SimulationScenario[];
};