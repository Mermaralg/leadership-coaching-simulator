// 5D Personality Model Types

export type MainDimension = 
  | 'duygusal_denge'
  | 'dikkat_duzen'
  | 'disadonukluk'
  | 'dengeli_iliski'
  | 'deneyime_aciklik';

export type SubDimension =
  // Duygusal Denge
  | 'duygu_kontrolu'
  | 'stresle_basa_cikma'
  | 'ozguven'
  // Dikkat ve Düzen
  | 'risk_duyarlilik'
  | 'kontrolculuk'
  | 'kural_uyumu'
  // Dışadönüklük
  | 'one_cikmayi_seven'
  | 'sosyallik'
  | 'basari_yonelimi'
  // Dengeli İlişki
  | 'iliski_yonetimi'
  | 'iyi_gecinme'
  | 'kacinma'
  // Deneyime Açıklık
  | 'yenilikcilik'
  | 'ogrenme_yonelimi'
  | 'merak';

export interface PersonalityScore {
  dimension: SubDimension;
  score: number; // 0-100
}

export interface PersonalityProfile {
  participantName: string;
  scores: Record<SubDimension, number>;
  mainDimensionScores?: Record<MainDimension, number>;
  createdAt: Date;
}

export interface StrengthItem {
  dimension: SubDimension;
  score: number;
  description: string;
  category: 'high' | 'low'; // High score strength or low score strength
}

export interface DevelopmentItem {
  dimension: SubDimension;
  score: number;
  description: string;
  category: 'high' | 'low';
}

export interface ActionItem {
  dimension: SubDimension;
  scoreRange: 'low' | 'high';
  action: string;
}

export type CoachingStage = 1 | 2 | 3 | 4 | 5 | 6;

export interface CoachingSession {
  id: string;
  participantName: string;
  currentStage: CoachingStage;
  profile?: PersonalityProfile;
  strengths?: StrengthItem[];
  developmentAreas?: DevelopmentItem[];
  selectedDevelopmentAreas?: SubDimension[];
  actionItems?: ActionItem[];
  startedAt: Date;
  completedAt?: Date;
}

export interface DimensionData {
  name: string;
  nameEn: string;
  subDimensions: {
    key: SubDimension;
    name: string;
  }[];
}

export const DIMENSIONS: Record<MainDimension, DimensionData> = {
  duygusal_denge: {
    name: 'Duygusal Denge',
    nameEn: 'Emotional Stability',
    subDimensions: [
      { key: 'duygu_kontrolu', name: 'Duygu Kontrolü' },
      { key: 'stresle_basa_cikma', name: 'Stresle Başa Çıkma' },
      { key: 'ozguven', name: 'Özgüven' },
    ],
  },
  dikkat_duzen: {
    name: 'Dikkat ve Düzen',
    nameEn: 'Conscientiousness',
    subDimensions: [
      { key: 'risk_duyarlilik', name: 'Risk Duyarlılık' },
      { key: 'kontrolculuk', name: 'Kontrolcülük' },
      { key: 'kural_uyumu', name: 'Kural Uyumu' },
    ],
  },
  disadonukluk: {
    name: 'Dışadönüklük',
    nameEn: 'Extraversion',
    subDimensions: [
      { key: 'one_cikmayi_seven', name: 'Öne Çıkmayı Seven' },
      { key: 'sosyallik', name: 'Sosyallik' },
      { key: 'basari_yonelimi', name: 'Başarı Yönelimi' },
    ],
  },
  dengeli_iliski: {
    name: 'Dengeli İlişki',
    nameEn: 'Agreeableness',
    subDimensions: [
      { key: 'iliski_yonetimi', name: 'İlişki Yönetimi' },
      { key: 'iyi_gecinme', name: 'İyi Geçinme' },
      { key: 'kacinma', name: 'Kaçınma' },
    ],
  },
  deneyime_aciklik: {
    name: 'Deneyime Açıklık',
    nameEn: 'Openness to Experience',
    subDimensions: [
      { key: 'yenilikcilik', name: 'Yenilikçilik' },
      { key: 'ogrenme_yonelimi', name: 'Öğrenme Yönelimi' },
      { key: 'merak', name: 'Merak' },
    ],
  },
};
