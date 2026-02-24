import { SubDimension, MainDimension, StrengthItem, DevelopmentItem } from '@/types/coaching';
import { STRENGTH_DATA } from '../data/strengths';
import { DEVELOPMENT_DATA } from '../data/development';

// Score thresholds - aligned with HTML coaching approach
// Priority 1 (Extreme): 0-25 and 75-100
// Priority 2 (Middle): 26-74
const EXTREME_LOW_THRESHOLD = 25;
const EXTREME_HIGH_THRESHOLD = 75;

/**
 * Determines the score category based on extreme thresholds.
 * Both LOW (0-25) and HIGH (75-100) can be strengths OR development areas!
 */
function getScoreCategory(score: number): 'low' | 'high' {
  // For data lookup: low = 0-50, high = 51-100
  // This determines which set of descriptions to use
  return score <= 50 ? 'low' : 'high';
}

/**
 * Checks if a score is in the extreme range (Priority 1).
 */
function isExtremeScore(score: number): boolean {
  return score <= EXTREME_LOW_THRESHOLD || score >= EXTREME_HIGH_THRESHOLD;
}

/**
 * Calculates how extreme a score is from the middle (50).
 */
function getExtremeness(score: number): number {
  return Math.abs(score - 50);
}

export function analyzeStrengths(
  scores: Record<SubDimension, number>,
  mainScores?: Record<MainDimension, number>
): StrengthItem[] {
  console.log('[analyzeStrengths] Input scores:', scores);
  console.log('[analyzeStrengths] Main scores (not used in analysis):', mainScores);
  const strengths: StrengthItem[] = [];

  // ✅ Only analyze SUB-DIMENSIONS (main scores are just stored, not analyzed)
  Object.entries(scores).forEach(([dimension, score]) => {
    const subDim = dimension as SubDimension;
    const category = getScoreCategory(score);
    const isExtreme = isExtremeScore(score);
    
    console.log(`[analyzeStrengths] Processing ${subDim}: score=${score}, category=${category}, isExtreme=${isExtreme}`);
    
    // Find strength data for this dimension and score category
    const strengthData = STRENGTH_DATA.find(
      (d) => d.dimension === subDim && d.scoreRange === category
    );

    if (strengthData && strengthData.strengths.length > 0) {
      const item: StrengthItem = {
        dimension: subDim,
        score,
        description: strengthData.strengths[0],
        category,
      };
      console.log(`[analyzeStrengths] Adding strength:`, item);
      strengths.push(item);
    }
  });

  console.log('[analyzeStrengths] Before sorting:', strengths.length);

  // Sort by: 1) Extreme scores first (0-25 and 75-100), 2) Then by extremeness
  strengths.sort((a, b) => {
    const aIsExtreme = isExtremeScore(a.score);
    const bIsExtreme = isExtremeScore(b.score);
    
    // Priority 1: Extreme scores first
    if (aIsExtreme && !bIsExtreme) return -1;
    if (!aIsExtreme && bIsExtreme) return 1;
    
    // Within same priority, sort by extremeness
    return getExtremeness(b.score) - getExtremeness(a.score);
  });
  
  console.log('[analyzeStrengths] After sorting:', strengths.map(s => ({dim: s.dimension, score: s.score})));

  // Balance high and low scores, prioritizing extreme scores
  const balanced = balanceHighLow(strengths);
  console.log('[analyzeStrengths] After balancing:', balanced.map(s => ({dim: s.dimension, score: s.score})));
  
  // Return top 8-10 strengths
  const final = balanced.slice(0, 10);
  console.log('[analyzeStrengths] Final result:', final.map(s => ({dim: s.dimension, score: s.score})));
  
  return final;
}

export function analyzeDevelopmentAreas(
  scores: Record<SubDimension, number>,
  mainScores?: Record<MainDimension, number>
): DevelopmentItem[] {
  console.log('[analyzeDevelopmentAreas] Input scores:', scores);
  console.log('[analyzeDevelopmentAreas] Main scores (not used in analysis):', mainScores);
  const developmentAreas: DevelopmentItem[] = [];

  // ✅ Only analyze SUB-DIMENSIONS (main scores are just stored, not analyzed)
  Object.entries(scores).forEach(([dimension, score]) => {
    const subDim = dimension as SubDimension;
    const category = getScoreCategory(score);
    const isExtreme = isExtremeScore(score);
    
    // Find development data for this dimension and score category
    const devData = DEVELOPMENT_DATA.find(
      (d) => d.dimension === subDim && d.scoreRange === category
    );

    if (devData && devData.developments.length > 0) {
      const item: DevelopmentItem = {
        dimension: subDim,
        score,
        description: devData.developments[0],
        category,
      };
      console.log(`[analyzeDevelopmentAreas] Adding:`, item, `isExtreme=${isExtreme}`);
      developmentAreas.push(item);
    }
  });

  // Sort by: 1) Extreme scores first, 2) Then by extremeness
  developmentAreas.sort((a, b) => {
    const aIsExtreme = isExtremeScore(a.score);
    const bIsExtreme = isExtremeScore(b.score);
    
    if (aIsExtreme && !bIsExtreme) return -1;
    if (!aIsExtreme && bIsExtreme) return 1;
    
    return getExtremeness(b.score) - getExtremeness(a.score);
  });

  // Balance high and low, return top 8-10
  return balanceHighLow(developmentAreas).slice(0, 10);
}

/**
 * Balances items between high and low categories.
 * Interleaves them to ensure both extremes are represented.
 */
function balanceHighLow<T extends { category: 'low' | 'high' }>(items: T[]): T[] {
  const high = items.filter((item) => item.category === 'high');
  const low = items.filter((item) => item.category === 'low');

  const balanced: T[] = [];
  const maxLength = Math.max(high.length, low.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < high.length) balanced.push(high[i]);
    if (i < low.length) balanced.push(low[i]);
  }

  return balanced;
}

export function getDimensionLabel(dimension: SubDimension): string {
  const labels: Record<SubDimension, string> = {
    duygu_kontrolu: 'Duygu Kontrolü',
    stresle_basa_cikma: 'Stresle Başa Çıkma',
    ozguven: 'Özgüven',
    risk_duyarlilik: 'Risk Duyarlılık',
    kontrolculuk: 'Kontrolcülük',
    kural_uyumu: 'Kural Uyumu',
    one_cikmayi_seven: 'Öne Çıkmayı Seven',
    sosyallik: 'Sosyallik',
    basari_yonelimi: 'Başarı Yönelimi',
    iliski_yonetimi: 'İlişki Yönetimi',
    iyi_gecinme: 'İyi Geçinme',
    kacinma: 'Kaçınma',
    yenilikcilik: 'Yenilikçilik',
    ogrenme_yonelimi: 'Öğrenme Yönelimi',
    merak: 'Merak',
  };
  return labels[dimension];
}
