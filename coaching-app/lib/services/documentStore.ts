import fs from 'fs';
import path from 'path';
import { SubDimension } from '@/types/coaching';

export type DocumentType = 'strengths' | 'development' | 'actions' | 'cross-dimension';

class DocumentStore {
  private documents: Map<DocumentType, string> = new Map();

  constructor() {
    this.loadDocuments();
  }

  private loadDocuments() {
    const dataDir = path.join(process.cwd(), 'lib/data');

    // Use markdown files for strengths and development (better structured)
    // Use txt for actions and cross-dimension
    const fileMap: Record<DocumentType, string> = {
      'strengths': 'Güçlü.md',
      'development': 'Gelişim.md',
      'actions': 'Ne yapması gerek.txt',
      'cross-dimension': 'Boyut-Çapraz Yorum.txt',
    };

    for (const [type, filename] of Object.entries(fileMap)) {
      try {
        const content = fs.readFileSync(
          path.join(dataDir, filename),
          'utf-8'
        );
        this.documents.set(type as DocumentType, content);
        console.log(`Loaded ${filename}: ${content.length} chars`);
      } catch (error) {
        console.error(`Failed to load ${filename}:`, error);
      }
    }
  }

  /**
   * Get all content for a document type
   */
  getDocument(type: DocumentType): string {
    return this.documents.get(type) || '';
  }

  /**
   * Extract content for specific dimensions based on scores
   */
  getContentForScores(
    type: DocumentType,
    scores: Record<SubDimension, number>
  ): string {
    const document = this.documents.get(type) || '';
    if (!document) return '';

    const dimensionMap: Record<SubDimension, string> = {
      duygu_kontrolu: 'DUYGU KONTROLÜ',
      stresle_basa_cikma: 'STRESLE BAŞA ÇIKMA',
      ozguven: 'ÖZGÜVEN',
      risk_duyarlilik: 'RİSK DUYARLILIK',
      kontrolculuk: 'KONTROLCÜLÜK',
      kural_uyumu: 'KURAL UYUMU',
      one_cikmayi_seven: 'ÖNE ÇIKMAYI SEVEN',
      sosyallik: 'SOSYALLİK',
      basari_yonelimi: 'BAŞARI YÖNELİMİ',
      iliski_yonetimi: 'İLİŞKİ YÖNETİMİ',
      iyi_gecinme: 'İYİ GEÇİNME',
      kacinma: 'KAÇINMA',
      yenilikcilik: 'YENİLİKÇİLİK',
      ogrenme_yonelimi: 'ÖĞRENME YÖNELİMİ',
      merak: 'MERAK',
    };

    const results: string[] = [];

    // Get extreme scores (0-20 or 80-100)
    Object.entries(scores).forEach(([dim, score]) => {
      if (score <= 20 || score >= 80) {
        const dimensionName = dimensionMap[dim as SubDimension];
        const scoreRange = score <= 50 ? 'Düşük Puan (0-50)' : 'Yüksek Puan (51-100)';

        // Find the section for this dimension
        const sectionRegex = new RegExp(
          `## ${dimensionName}[\\s\\S]*?(?=## |$)`,
          'i'
        );
        const match = document.match(sectionRegex);

        if (match) {
          // Extract just the relevant score range subsection
          const subsectionRegex = new RegExp(
            `### ${scoreRange}[\\s\\S]*?(?=### |## |$)`,
            'i'
          );
          const subsectionMatch = match[0].match(subsectionRegex);

          if (subsectionMatch) {
            results.push(`\n**${dimensionName} (${score} puan - ${score <= 50 ? 'düşük' : 'yüksek'}):**\n${subsectionMatch[0]}`);
          }
        }
      }
    });

    return results.join('\n');
  }

  /**
   * Get context for coaching conversation based on current stage
   */
  getContextForStage(stage: number, scores?: Record<SubDimension, number>): string {
    switch (stage) {
      case 1:
        return '';

      case 2:
        return '';
      case 3: // Strengths ONLY
        if (!scores) return '';
        return `
=== GÜCLÜ ÖZELLİKLER DOKÜMANI ===
${this.getDocument('strengths')}

=== KATILIMCININ UC PUANLARI ICIN GUCLU OZELLIKLER ===
${this.getContentForScores('strengths', scores)}
`;

      case 4: // Development ONLY
        if (!scores) return '';
        return `
=== GELISIM ALANLARI DOKÜMANI ===
${this.getDocument('development')}

=== KATILIMCININ UC PUANLARI ICIN GELISIM ALANLARI ===
${this.getContentForScores('development', scores)}

=== CAPRAZ BOYUT ANALIZI ===
${this.getDocument('cross-dimension')}
`;

      case 5:
        return `
=== NE YAPMASI GEREK DOKÜMANI ===
${this.getDocument('actions')}
`;

      case 6: // Summary
        return `
=== CAPRAZ BOYUT ANALIZI ===
${this.getDocument('cross-dimension')}
`;

      default:
        return '';
    }
  }
}

export const documentStore = new DocumentStore();
