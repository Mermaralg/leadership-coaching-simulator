import fs from 'fs';
import path from 'path';
import { SubDimension } from '@/types/coaching';

// Document types matching our 4 PDFs
export type DocumentType = 'strengths' | 'development' | 'actions' | 'cross-dimension';

interface DocumentChunk {
  content: string;
  dimension?: SubDimension;
  scoreRange?: 'low' | 'high';
  type: DocumentType;
}

class DocumentStore {
  private documents: Map<DocumentType, string> = new Map();
  private chunks: DocumentChunk[] = [];

  constructor() {
    this.loadDocuments();
    this.createChunks();
  }

  private loadDocuments() {
    const dataDir = path.join(process.cwd(), 'lib/data');
    
    const fileMap: Record<DocumentType, string> = {
      'strengths': 'Güçlü.txt',
      'development': 'Gelişim.txt',
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
      } catch (error) {
        console.error(`Failed to load ${filename}:`, error);
      }
    }
  }

  private createChunks() {
    // For now, we'll create simple chunks by paragraph
    // In a full implementation, we'd use embeddings
    for (const [type, content] of this.documents.entries()) {
      const paragraphs = content
        .split('\n\n')
        .filter(p => p.trim().length > 20); // Minimum length
      
      paragraphs.forEach(para => {
        this.chunks.push({
          content: para.trim(),
          type,
        });
      });
    }
  }

  /**
   * Search for relevant content based on keywords
   */
  search(keywords: string[], type?: DocumentType, limit: number = 5): DocumentChunk[] {
    let relevantChunks = this.chunks;

    // Filter by document type if specified
    if (type) {
      relevantChunks = relevantChunks.filter(chunk => chunk.type === type);
    }

    // Score each chunk based on keyword matches
    const scoredChunks = relevantChunks.map(chunk => {
      const lowerContent = chunk.content.toLowerCase();
      const score = keywords.reduce((acc, keyword) => {
        const lowerKeyword = keyword.toLowerCase();
        const matches = (lowerContent.match(new RegExp(lowerKeyword, 'g')) || []).length;
        return acc + matches;
      }, 0);

      return { chunk, score };
    });

    // Sort by score and return top results
    return scoredChunks
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ chunk }) => chunk);
  }

  /**
   * Get content for a specific dimension and score range
   */
  getForDimension(
    dimension: SubDimension,
    scoreRange: 'low' | 'high',
    type: DocumentType
  ): string {
    const dimensionLabels: Record<SubDimension, string[]> = {
      duygu_kontrolu: ['duygu kontrolü', 'duygusal'],
      stresle_basa_cikma: ['stres', 'başa çıkma'],
      ozguven: ['özgüven', 'güven'],
      risk_duyarlilik: ['risk'],
      kontrolculuk: ['kontrol'],
      kural_uyumu: ['kural'],
      one_cikmayi_seven: ['öne çık'],
      sosyallik: ['sosyal', 'ilişki'],
      basari_yonelimi: ['başarı'],
      iliski_yonetimi: ['ilişki yönetimi'],
      iyi_gecinme: ['iyi geç', 'uyum'],
      kacinma: ['kaçın', 'çatışma'],
      yenilikcilik: ['yenilik'],
      ogrenme_yonelimi: ['öğrenme'],
      merak: ['merak'],
    };

    const keywords = dimensionLabels[dimension] || [dimension];
    const results = this.search(keywords, type, 3);

    return results.map(chunk => chunk.content).join('\n\n');
  }

  /**
   * Get all content for a document type
   */
  getDocument(type: DocumentType): string {
    return this.documents.get(type) || '';
  }

  /**
   * Get context for coaching conversation based on current stage
   */
  getContextForStage(stage: number, scores?: Record<SubDimension, number>): string {
    switch (stage) {
      case 1: // Welcome
        return 'You are introducing the 5D coaching process.';
      
      case 2: // Score collection
        return 'You are collecting personality dimension scores from the participant.';
      
      case 3: // Strengths
        if (!scores) return '';
        // Get relevant strength content
        const strengthKeywords = Object.entries(scores)
          .filter(([_, score]) => score <= 30 || score >= 70)
          .map(([dim]) => dim);
        return this.search(strengthKeywords, 'strengths', 10)
          .map(c => c.content)
          .join('\n\n');
      
      case 4: // Development areas
        if (!scores) return '';
        const devKeywords = Object.entries(scores)
          .filter(([_, score]) => score <= 20 || score >= 80)
          .map(([dim]) => dim);
        return this.search(devKeywords, 'development', 10)
          .map(c => c.content)
          .join('\n\n');
      
      case 5: // Actions
        return this.getDocument('actions');
      
      case 6: // Summary
        return this.getDocument('cross-dimension');
      
      default:
        return '';
    }
  }
}

// Singleton instance
export const documentStore = new DocumentStore();
