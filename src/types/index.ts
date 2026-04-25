export type Lane = "neurotech" | "biotech" | "defense" | "ai_ml" | "academic_lab";

export type ApplicationStatus =
  | "target"
  | "applied"
  | "screen"
  | "interview"
  | "offer"
  | "rejected"
  | "ghosted";

export type ProjectStatus = "idea" | "in_progress" | "shipped";

export interface PrepChecklistItem {
  item: string;
  done: boolean;
}

export interface SkillEntry {
  skill: string;
  level: number; // 1-5
}

export interface FitAnalysisResult {
  fitScore: number; // 0-100
  matchedRequirements: string[];
  gaps: string[];
  recommendedActions: string[];
  oneLineSummary: string;
}

export interface SeedCompany {
  name: string;
  lane: Lane;
  priority: number;
  careerPageUrl: string;
  cycleOpensMonth: number | null;
  cycleClosesMonth: number | null;
  rolesHiredBs: string;
  notes: string;
  warmIntros: string;
}
