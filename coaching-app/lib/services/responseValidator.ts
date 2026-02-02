import { SubDimension } from '@/types/coaching';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class ResponseValidator {

  validateStage3Response(
    response: string,
    scores: Record<SubDimension, number>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const strengthCount = this.countListItems(response);
    if (strengthCount < 4) {
      errors.push(`Found only ${strengthCount} strengths, need minimum 4`);
    }

    const extremeScores = this.getExtremeScores(scores);
    const hasLowScore = extremeScores.low.some(dim =>
      response.toLowerCase().includes(dim.toLowerCase())
    );
    const hasHighScore = extremeScores.high.some(dim =>
      response.toLowerCase().includes(dim.toLowerCase())
    );

    if (extremeScores.low.length > 0 && !hasLowScore) {
      errors.push('No strengths from low scores (0-20)');
    }
    if (extremeScores.high.length > 0 && !hasHighScore) {
      errors.push('No strengths from high scores (80-100)');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  validateStage4Response(
    response: string,
    scores: Record<SubDimension, number>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const areaCount = this.countListItems(response);
    if (areaCount < 4) {
      errors.push(`Found only ${areaCount} development areas, need minimum 4`);
    }

    if (!response.toLowerCase().includes('pattern')) {
      warnings.push('No cross-dimensional pattern analysis found');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  validateStage5Response(response: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const genericPhrases = [
      'nefes egzersizi',
      'derin nefes',
      'meditasyon',
      'mindfulness',
    ];

    genericPhrases.forEach(phrase => {
      if (response.toLowerCase().includes(phrase)) {
        warnings.push(`Generic advice found: "${phrase}" - should use document content`);
      }
    });

    return { valid: errors.length === 0, errors, warnings };
  }

  validateStage6Response(response: string): ValidationResult {
    const errors: string[] = [];

    const hasModelSolution = response.includes('MODEL') && response.includes('OZUM');
    const hasModelSolutionAlt = response.toLowerCase().includes('model') && response.toLowerCase().includes('çözüm');
    if (!hasModelSolution && !hasModelSolutionAlt) {
      errors.push('Model solution section missing');
    }

    const hasComparison = response.toLowerCase().includes('karşılaştırma') ||
      response.toLowerCase().includes('karsilastirma');
    if (!hasComparison) {
      errors.push('Comparison section missing');
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  }

  private countListItems(text: string): number {
    const matches = text.match(/^\d+\./gm);
    return matches ? matches.length : 0;
  }

  private getExtremeScores(scores: Record<SubDimension, number>) {
    const dimensionNames: Record<string, string> = {
      duygu_kontrolu: 'duygu kontrol',
      stresle_basa_cikma: 'stresle basa cikma',
      ozguven: 'ozguven',
      risk_duyarlilik: 'risk duyarlilik',
      kontrolculuk: 'kontrolculuk',
      kural_uyumu: 'kural uyumu',
      one_cikmayi_seven: 'one cikmayi seven',
      sosyallik: 'sosyallik',
      basari_yonelimi: 'basari yonelimi',
      iliski_yonetimi: 'iliski yonetimi',
      iyi_gecinme: 'iyi gecinme',
      kacinma: 'kacinma',
      yenilikcilik: 'yenilikcilik',
      ogrenme_yonelimi: 'ogrenme yonelimi',
      merak: 'merak',
    };

    const low: string[] = [];
    const high: string[] = [];

    Object.entries(scores).forEach(([dim, score]) => {
      const name = dimensionNames[dim] || dim;
      if (score <= 20) low.push(name);
      if (score >= 80) high.push(name);
    });

    return { low, high };
  }
}

export const responseValidator = new ResponseValidator();
