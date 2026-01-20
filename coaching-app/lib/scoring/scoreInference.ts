import { SubDimension } from '@/types/coaching';
import { SCORING_RUBRIC } from './rubric';
import { InferenceConfig, roundToStep, clamp, bandForScore } from './types';

export interface ScoreProposal {
  dimension: SubDimension;
  proposedScore: number;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
  behavioralEvidence: string[];
}

export interface DimensionScores {
  [key: string]: {
    score: number;
    validated: boolean;
    aiProposal?: ScoreProposal;
  };
}

const DEFAULT_CONFIG: InferenceConfig = {
  step: 10,
  min: 0,
  max: 100,
};

/**
 * Generate a system prompt for the AI to infer scores from conversation
 */
export function generateScoreInferencePrompt(
  dimension: SubDimension,
  conversationContext: string,
  config: InferenceConfig = DEFAULT_CONFIG
): string {
  const rubricDim = SCORING_RUBRIC[dimension];
  
  if (!rubricDim) {
    throw new Error(`Unknown dimension: ${dimension}`);
  }

  const bandsDescription = rubricDim.bands
    .map(
      (band) =>
        `**${band.min}-${band.max} (${band.label}):**\n` +
        band.anchors.map((a) => `- ${a}`).join('\n')
    )
    .join('\n\n');

  return `Sen bir liderlik koçu asistanısın. Görüşme yaptığın kişinin "${rubricDim.title}" (${dimension}) boyutundaki puanını tahmin etmen gerekiyor.

## Puanlama Ölçeği (0-100)
${bandsDescription}

## Görüşme Bağlamı
${conversationContext}

## Görevin
1. Yukarıdaki görüşme notlarını analiz et
2. Kişinin davranışlarını ve yanıtlarını rubriğe göre değerlendir
3. 0-100 arası bir puan öner (${config.step}'un katları olarak)
4. Önerini destekleyen davranışsal kanıtları belirt
5. Güven seviyeni belirt (düşük/orta/yüksek)

## Yanıt Formatı
Yanıtını aşağıdaki JSON formatında ver:

{
  "proposedScore": <0-100 arası sayı>,
  "confidence": "<low/medium/high>",
  "reasoning": "<Türkçe açıklama: neden bu puanı önerdiğin>",
  "behavioralEvidence": ["<gözlemlenen davranış 1>", "<gözlemlenen davranış 2>"]
}

Sadece geçerli JSON döndür, başka açıklama ekleme.`;
}

/**
 * Parse AI response to extract score proposal
 */
export function parseScoreProposal(
  dimension: SubDimension,
  aiResponse: string,
  config: InferenceConfig = DEFAULT_CONFIG
): ScoreProposal {
  try {
    // Try to extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate and normalize score
    let score = parsed.proposedScore || 50;
    score = clamp(score, config.min, config.max);
    score = roundToStep(score, config.step);

    return {
      dimension,
      proposedScore: score,
      confidence: parsed.confidence || 'low',
      reasoning: parsed.reasoning || 'Yeterli bilgi yok',
      behavioralEvidence: Array.isArray(parsed.behavioralEvidence)
        ? parsed.behavioralEvidence
        : [],
    };
  } catch (error) {
    console.error('Failed to parse score proposal:', error);
    // Return default proposal
    return {
      dimension,
      proposedScore: 50,
      confidence: 'low',
      reasoning: 'Puanlama için yeterli bilgi toplanamadı',
      behavioralEvidence: [],
    };
  }
}

/**
 * Generate probing questions for a dimension
 */
export function getProbesForDimension(
  dimension: SubDimension,
  count: number = 2
): string[] {
  const rubricDim = SCORING_RUBRIC[dimension];
  if (!rubricDim) return [];

  const allProbes = [
    ...rubricDim.genericProbes,
    ...rubricDim.bands.flatMap((b) => b.probes || []),
  ];

  // Return requested number of probes (randomly selected)
  const shuffled = [...allProbes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get behavioral anchors for a specific score
 */
export function getAnchorsForScore(
  dimension: SubDimension,
  score: number
): string[] {
  const rubricDim = SCORING_RUBRIC[dimension];
  if (!rubricDim) return [];

  const band = bandForScore(rubricDim.bands, score);
  return band ? band.anchors : [];
}

/**
 * Validate that all dimensions have been scored
 */
export function allDimensionsScored(scores: DimensionScores): boolean {
  const allDimensions: SubDimension[] = [
    'duygu_kontrolu',
    'stresle_basa_cikma',
    'ozguven',
    'risk_duyarlilik',
    'kontrolculuk',
    'kural_uyumu',
    'one_cikmayi_seven',
    'sosyallik',
    'basari_yonelimi',
    'iliski_yonetimi',
    'iyi_gecinme',
    'kacinma',
    'yenilikcilik',
    'ogrenme_yonelimi',
    'merak',
  ];

  return allDimensions.every((dim) => scores[dim]?.score !== undefined);
}

/**
 * Validate that all scored dimensions have been validated by the user
 */
export function allScoresValidated(scores: DimensionScores): boolean {
  return Object.values(scores).every((s) => s.validated === true);
}
