export type SimulationId =
  | "trust"
  | "apps"
  | "phishing"
  | "calls"
  | "gambling"
  | "mind";

export type GamblingActivityKind =
  | "slot"
  | "budget"
  | "gacor"
  | "ledger"
  | "martingale"
  | "debt"
  | "triggers"
  | "none";

export type ScenarioDifficulty = "Mudah" | "Menengah" | "Sulit" | "Ahli";

export type ChatProfileItem = { label: string; value: string; suspicious: boolean };

export type ChatProfile = {
  phone: string;
  about?: string;
  items: ChatProfileItem[];
};

export type ScenarioSender = {
  name: string;
  status?: string;
};

export type SimulationChoice = {
  id: string;
  label: string;
  isSafe: boolean;
  feedback: string;
  explanation: string;
  saferAction: string;
  reply?: string;
};

export type DialogueEnding = {
  result: "win" | "lose";
  why: string;
};

export type DialogueOption = {
  id: string;
  label: string;
  isSafe: boolean;
  reply?: string[];
  next?: string;
  end?: DialogueEnding;
  flag?: string;
};

export type DialogueTurn = {
  lines?: string[];
  options: DialogueOption[];
};

export type DialogueTree = {
  start: string;
  turns: Record<string, DialogueTurn>;
};

export type SimulationScenario = {
  id: string;
  title: string;
  description: string;
  context: string;
  choices: SimulationChoice[];
  appDetails?: AppScenarioData;
  emailDetails?: EmailScenarioData;
  level?: number;
  difficulty?: ScenarioDifficulty;
  topic?: string;
  sender?: ScenarioSender;
  profile?: ChatProfile;
  messages?: string[];
  gamblingDetails?: GamblingScenarioData
  dialogue?: DialogueTree;
  takeaway?: string;
  gamblingActivity?: GamblingActivityKind;
};

export type GamblingScenarioData = {
  channel: string;
  sender: string;
  headline: string;
  body: string[];
  cta?: string;
  signals: GamblingSignal[];
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

export type AppDetailItem = {
  label: string;
  value: string;
  suspicious: boolean;
};

export type EmailCheck = {
  label: string;
  value: string;
  suspicious: boolean;
};

export type EmailLink = {
  text: string;
  url: string;
};

export type EmailAttachment = {
  name: string;
  size: string;
};

export type EmailScenarioData = {
  senderName: string;
  senderEmail: string;
  replyTo?: string;
  subject: string;
  body: string[];
  links?: EmailLink[];
  attachments?: EmailAttachment[];
  checks: EmailCheck[];
};

export type GamblingSignal = {
  label: string;
  value: string;
  suspicious: boolean;
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
    mode?: string;
  }[];
  redFlags: string[];
  explanation: string;
  saferAction: string;
  postInstall: string[];
  foundVia: string;
  details?: AppDetailItem[];
};