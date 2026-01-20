import { SubDimension } from '@/types/coaching';

// A score band can be coarse (e.g., 0–50 / 51–100) or granular (e.g., deciles)
export interface ScoreBand {
  // inclusive min/max
  min: number;
  max: number;
  label: string; // e.g., "very_low", "low", "mid", "high", "very_high"
  // Behavioral anchors that characterize this band
  anchors: string[];
  // Probing questions to help elicit behavior for this band
  probes?: string[];
}

export interface RubricDimension {
  key: SubDimension;
  title: string;
  // Ordered from lowest to highest; bands can be coarse today and expanded later
  bands: ScoreBand[];
  // Generic probes applicable independent of band
  genericProbes: string[];
}

export type Rubric = Record<SubDimension, RubricDimension>;

export interface InferenceConfig {
  // Round scores to this step (e.g., 50 for coarse, 10 for deciles, 1 for full)
  step: number; // default 10
  // Min/Max of the scale
  min?: number; // default 0
  max?: number; // default 100
}

export function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function roundToStep(n: number, step = 10) {
  if (step <= 1) return Math.round(n);
  return Math.round(n / step) * step;
}

export function bandForScore(bands: ScoreBand[], score: number) {
  return bands.find(b => score >= b.min && score <= b.max) || bands[bands.length - 1];
}
