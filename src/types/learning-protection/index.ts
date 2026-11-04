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
  appDetails?: AppScenarioData;
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

export type AppScenarioData = {
  name: string;
  description: string;
  developer: string;
  category: string;
  rating: string;
  downloads: string;
  badge: string;
  source: string;
  sourceType: "official" | "unofficial";
  risk: "Rendah" | "Sedang" | "Tinggi" | "Kritis";
  claim: string;
  reviews: string;
  permissions: {
    name: string;
    reason: string;
    suspicious: boolean;
  }[];
  redFlags: string[];
  explanation: string;
  saferAction: string;
  postInstall: string[];
};