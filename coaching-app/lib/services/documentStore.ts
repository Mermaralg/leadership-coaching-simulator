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
      'strengths': 'Guclu.md',
      'development': 'Gelisim.md',
      'actions': 'Neyapmasigerek.txt',
      'cross-dimension': 'BoyutCaprazYorum.txt',
    };

    for (const [type, filename] of Object.entries(fileMap)) {
      try {
        const content = fs.readFileSync(
          path.join(dataDir, filename),
          'utf-8'
        );
        this.documents.set(type as DocumentType, content);
        console.log(`✅ Loaded ${filename}: ${content.length} chars`);
        
        // 🔍 DEBUG: Show first 500 chars if it's development
        if (type === 'development') {
          console.log('📄 First 500 chars of Gelişim.md:');
          console.log(content.substring(0, 500));
        }
      } catch (error) {
        console.error(`❌ Failed to load ${filename}:`, error);
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

    console.log('\n🔍 ========== getContentForScores DEBUG ==========');
    console.log('Type:', type);
    console.log('Document length:', document.length);

    // Get extreme scores (0-25 or 75-100) - Priority 1
    // Both LOW and HIGH extreme scores can be strengths OR development areas!
    Object.entries(scores).forEach(([dim, score]) => {
      const dimensionName = dimensionMap[dim as SubDimension];
      
      // 🔍 DEBUG: Log every dimension
      if (score <= 25 || score >= 75) {
        console.log(`\n📊 Processing: ${dimensionName} = ${score}`);
        
        const scoreRange = score <= 50 ? 'Düşük Puan (0-50)' : 'Yüksek Puan (51-100)';
        console.log(`   Score range: ${scoreRange}`);

        // Find the section for this dimension
        const sectionRegex = new RegExp(
          `## ${dimensionName}[\\s\\S]*?(?=## |$)`,
          'i'
        );
        const match = document.match(sectionRegex);

        if (match) {
          console.log(`   ✅ Found section for ${dimensionName}`);
          console.log(`   Section length: ${match[0].length} chars`);
          
          // Extract just the relevant score range subsection
          const subsectionRegex = new RegExp(
            `### ${scoreRange}[\\s\\S]*?(?=### |## |$)`,
            'i'
          );
          const subsectionMatch = match[0].match(subsectionRegex);

          if (subsectionMatch) {
            console.log(`   ✅ Found subsection: ### ${scoreRange}`);
            console.log(`   Subsection length: ${subsectionMatch[0].length} chars`);
            console.log(`   First 200 chars: ${subsectionMatch[0].substring(0, 200)}`);
            
            // Alt boyut adı ve puanını göster (ana boyut değil!)
            results.push(`\n## ${dimensionName}\n### ${scoreRange}\n${subsectionMatch[0].replace(/^###.*\n/, '')}`);
          } else {
            console.log(`   ❌ Subsection NOT found: ### ${scoreRange}`);
            console.log(`   Looking in section (first 300 chars):`);
            console.log(match[0].substring(0, 300));
          }
        } else {
          console.log(`   ❌ Section NOT found for ${dimensionName}`);
        }
      }
    });

    console.log(`\n📝 Total results found: ${results.length}`);
    console.log('========== END DEBUG ==========\n');

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
        console.log('🎯 Stage 4: Getting development areas');
        return `
=== GELİŞİM ALANLARI DOKÜMANI (SADECE BU DOKÜMANI KULLAN) ===
${this.getDocument('development')}

=== ÇAPRAZ BOYUT ETKİLEŞİMİ (GELİŞİM ALANLARINI DERİNLEŞTİRMEK İÇİN KULLAN) ===
Bu doküman farklı ana boyut kombinasyonlarının yarattığı davranış kalıplarını gösterir.
Koçluk sırasında "bu iki özellik bir arada olunca şu oluyor" bağlantısını kurmak için yararlan.
${this.getDocument('cross-dimension')}

=== KATILIMCININ PUANLARINA GÖRE GELİŞİM ALANLARI ===
UYARI: Aşağıdaki içeriği AYNEN kullan. Kendi cümlelerini EKLEME.
${this.getContentForScores('development', scores)}
`;

      case 5:
        return `
=== NE YAPMASI GEREK DOKÜMANI ===
${this.getDocument('actions')}
`;

      case 6: // Summary
        return `
=== NE YAPMASI GEREK DOKÜMANI (Model Çözüm bullet pointları için kullan — AYNEN KOPYALA) ===
${this.getDocument('actions')}

=== CAPRAZ BOYUT ANALIZI ===
${this.getDocument('cross-dimension')}
`;

      default:
        return '';
    }
  }
}

export const documentStore = new DocumentStore();
