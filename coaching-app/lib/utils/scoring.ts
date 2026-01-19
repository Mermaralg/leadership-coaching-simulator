import { SubDimension, StrengthItem, DevelopmentItem } from '@/types/coaching';
import { STRENGTH_DATA } from '../data/strengths';

export function analyzeStrengths(scores: Record<SubDimension, number>): StrengthItem[] {
  console.log('[analyzeStrengths] Input scores:', scores);
  const strengths: StrengthItem[] = [];

  Object.entries(scores).forEach(([dimension, score]) => {
    const subDim = dimension as SubDimension;
    const scoreRange: 'low' | 'high' = score <= 50 ? 'low' : 'high';
    
    console.log(`[analyzeStrengths] Processing ${subDim}: score=${score}, range=${scoreRange}`);
    
    // Find strength data for this dimension and score range
    const strengthData = STRENGTH_DATA.find(
      (d) => d.dimension === subDim && d.scoreRange === scoreRange
    );

    if (strengthData && strengthData.strengths.length > 0) {
      // Add strength items (take first 2-3 strengths)
      const selectedStrengths = strengthData.strengths.slice(0, 3);
      selectedStrengths.forEach((strengthDesc) => {
        const item = {
          dimension: subDim,
          score,
          description: strengthDesc,
          category: scoreRange,
        };
        console.log(`[analyzeStrengths] Adding strength:`, item);
        strengths.push(item);
      });
    }
  });

  console.log('[analyzeStrengths] Before sorting:', strengths.length, strengths.map(s => ({dim: s.dimension, score: s.score})));

  // Sort by extreme scores (both very high and very low)
  strengths.sort((a, b) => {
    const aExtreme = Math.abs(a.score - 50);
    const bExtreme = Math.abs(b.score - 50);
    return bExtreme - aExtreme;
  });
  console.log('[analyzeStrengths] After sorting:', strengths.map(s => ({dim: s.dimension, score: s.score})));

  // Return top 8-10 strengths (balanced between high and low)
  const balanced = balanceHighLow(strengths);
  console.log('[analyzeStrengths] After balancing:', balanced.map(s => ({dim: s.dimension, score: s.score})));
  
  const final = balanced.slice(0, 10);
  console.log('[analyzeStrengths] Final result (top 10):', final.map(s => ({dim: s.dimension, score: s.score})));
  
  return final;
}

export function analyzeDevelopmentAreas(
  scores: Record<SubDimension, number>
): DevelopmentItem[] {
  const developmentAreas: DevelopmentItem[] = [];

  Object.entries(scores).forEach(([dimension, score]) => {
    const subDim = dimension as SubDimension;
    
    // Development areas are for extreme scores (0-20 or 80-100)
    // But we'll also consider 21-50 and 51-79 as potential development areas
    let developmentText = '';
    let category: 'low' | 'high' = 'low';

    if (score <= 20) {
      category = 'low';
      developmentText = `Puanınız düşük (${score}). Bu alanda kapasite geliştirmek liderlik yelpaz enizi genişletebilir.`;
    } else if (score >= 80) {
      category = 'high';
      developmentText = `Puanınız yüksek (${score}). Gücünüzün aşırı kullanılması durumlarında dikkatli olun.`;
    } else if (score <= 35) {
      category = 'low';
      developmentText = `Bu alanda gelişim fırsatınız var (${score}). Odaklanarak iyileştirme sağlayabilirsiniz.`;
    } else if (score >= 65) {
      category = 'high';
      developmentText = `Bu özelliğiniz belirgin (${score}). Dengelemeye dikkat edin.`;
    }

    if (developmentText) {
      developmentAreas.push({
        dimension: subDim,
        score,
        description: developmentText,
        category,
      });
    }
  });

  // Sort by most extreme scores
  developmentAreas.sort((a, b) => {
    const aExtreme = Math.abs(a.score - 50);
    const bExtreme = Math.abs(b.score - 50);
    return bExtreme - aExtreme;
  });

  // Return top 8-10 development areas
  return balanceHighLow(developmentAreas).slice(0, 10);
}

// Helper to balance high and low scores
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
