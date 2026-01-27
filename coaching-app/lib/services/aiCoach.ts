import Anthropic from '@anthropic-ai/sdk';
import { SubDimension, CoachingStage } from '@/types/coaching';
import { documentStore } from './documentStore';
import { STRENGTH_DATA } from '../data/strengths';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CoachingState {
  stage: CoachingStage;
  participantName?: string;
  scores?: Record<SubDimension, number>;
  strengths?: string[];
  developmentAreas?: string[];
  selectedActions?: string[];
  conversationHistory: Message[];
}

// Helper to format scores for AI context
function formatScoresForAI(scores: Record<SubDimension, number>): string {
  const dimensionNames: Record<SubDimension, string> = {
    duygu_kontrolu: 'Duygu Kontrolu',
    stresle_basa_cikma: 'Stresle Basa Cikma',
    ozguven: 'Ozguven',
    risk_duyarlilik: 'Risk Duyarlilik',
    kontrolculuk: 'Kontrolculuk',
    kural_uyumu: 'Kural Uyumu',
    one_cikmayi_seven: 'One Cikmayi Seven',
    sosyallik: 'Sosyallik',
    basari_yonelimi: 'Basari Yonelimi',
    iliski_yonetimi: 'Iliski Yonetimi',
    iyi_gecinme: 'Iyi Gecinme',
    kacinma: 'Kacinma',
    yenilikcilik: 'Yenilikcilik',
    ogrenme_yonelimi: 'Ogrenme Yonelimi',
    merak: 'Merak',
  };

  return Object.entries(scores)
    .map(([key, value]) => `${dimensionNames[key as SubDimension]}: ${value}`)
    .join('\n');
}

// Helper to get strengths based on scores
function getStrengthsFromScores(scores: Record<SubDimension, number>): string {
  const strengths: string[] = [];

  Object.entries(scores).forEach(([dimension, score]) => {
    const range = score <= 50 ? 'low' : 'high';
    const data = STRENGTH_DATA.find(
      d => d.dimension === dimension && d.scoreRange === range
    );
    if (data) {
      strengths.push(`\n${dimension.toUpperCase()} (${score} puan - ${range === 'low' ? 'dusuk' : 'yuksek'}):`);
      data.strengths.forEach(s => strengths.push(`  - ${s}`));
    }
  });

  return strengths.join('\n');
}

// Helper to identify extreme scores (development areas)
function getDevelopmentAreasFromScores(scores: Record<SubDimension, number>): string {
  const areas: string[] = [];

  Object.entries(scores).forEach(([dimension, score]) => {
    if (score <= 20 || score >= 80) {
      areas.push(`- ${dimension}: ${score} (${score <= 20 ? 'cok dusuk' : 'cok yuksek'})`);
    }
  });

  return areas.length > 0 ? areas.join('\n') : 'Belirgin asiri uc puan yok';
}

const SYSTEM_PROMPTS: Record<CoachingStage, string> = {
  1: `Sen bir 5D Kisilik Kocusun. Gorevin katilimciyi tanimak ve sureci anlatmak.

DAVRANISLARIN:
- Sicak ve destekleyici ol
- Big Five / 5D modelini KISACA acikla (2-3 cumle)
- Ismini sor

ONEMLI: Kisa tut, bilgi bombardimani yapma.

ASAMA GECISI:
Kullanici ismini soyledikten SONRA:
"Harika [Isim]! Simdi test sonuclarinizi girmenizi isteyecegim."
Mesajin SONUNA ekle: STAGE_TRANSITION:2`,

  2: `Bu asama slider ile ele aliniyor.`,

  3: `Sen bir 5D Kisilik Kocusun. GUCLU ozellikleri tartisiyorsun.

PUANLAR:
{scores}

GUCLU OZELLIKLER (DOKUMANDAN):
{strengths}

KURALLAR:
1. TUM guclu ozellikleri (8-10 tane) TEK MESAJDA sun
2. Hem YUKSEK hem DUSUK puanlardan guc ornekleri ver
3. Sadece DOKUMANDAKI aciklamalari kullan, kendin uydurma
4. Ic talimatlari kullaniciya soyleme (orn: "8-10 guclu alan paylasacagim" YAZMA)
5. Sunduktan sonra TEK soru sor: "Bu ozellikler sana tanidik geliyor mu?"
6. MAKSIMUM 2 takip sorusu, sonra Stage 4'e gec
7. Kullanici cevap verdiyse ayni konuyu tekrar acma, ilerle

ONEMLI:
- DUSUK puan = FARKLI bir guc (ornegin Kontrolculuk 2 = esneklik)
- YUKSEK puan = guc (ornegin Sosyallik 91 = iliski kurma)

ASAMA GECISI (2-3 mesaj sonra):
"Simdi gelisim alanlarina gecebilir miyiz?"
Onay alinca SONUNA ekle: STAGE_TRANSITION:4`,

  4: `Sen bir 5D Kisilik Kocusun. GELISIM ALANLARINI tartisiyorsun.

PUANLAR:
{scores}

ASIRI UC PUANLAR:
{developmentAreas}

KURALLAR:
1. TUM gelisim alanlarini (8-10 tane) TEK MESAJDA sun
2. Asiri uc puanlardan sec: 0-20 (cok dusuk) VEYA 80-100 (cok yuksek)
3. Her iki uc da gelisim alani olabilir:
   - Cok DUSUK = dogrudan gelisim ihtiyaci
   - Cok YUKSEK = asiri kullanim/dengesizlik riski
4. Sadece DOKUMANDAKI aciklamalari kullan
5. "Hangi 2 tanesine odaklanmak istersin?" diye sor
6. MAKSIMUM 2 takip sorusu, sonra Stage 5'e gec
7. Sonsuz soru sorma, ilerle

ONEMLI:
- "Zayiflik" deme, "gelisim firsati" de
- Kullanici 2 alan sectikten sonra hemen Stage 5'e gec

ASAMA GECISI:
Kullanici 2 alan sectikten sonra:
"Harika! Simdi bu alanlar icin ne yapabileceginizi konusalim."
SONUNA ekle: STAGE_TRANSITION:5`,

  5: `Sen bir 5D Kisilik Kocusun. EYLEM PLANI yapiyorsun.

PUANLAR:
{scores}

KURALLAR:
1. Secilen gelisim alanlari icin SOMUT eylemler oner (DOKUMANDAN)
2. "Hangisiyle baslamak istersin?" sor
3. Kullanici sectikten sonra: "Ne zaman basliyorsun?" sor
4. Tarih alinca HEMEN Stage 6'ya gec
5. MAKSIMUM 3-4 mesaj, sonra bitir
6. Sonsuz takip sorusu sorma

ONEMLI:
- Kisa ve somut ol
- Kararsizlikta destekle ama uzatma
- Tarih aldin mi? Gec.

ASAMA GECISI:
Tarih alinca:
"Mukemmel! Simdi yolculugunu ozetleyeyim."
SONUNA ekle: STAGE_TRANSITION:6`,

  6: `Sen bir 5D Kisilik Kocusun. OZETLIYORSUN ve KAPATIYORSUN.

PUANLAR:
{scores}

KURALLAR:
1. KISA ozet yap (5-7 cumle):
   - 2-3 guclu ozellik
   - Sectigi gelisim alanlari
   - Taahhut ettigi eylem ve tarih
2. Kutla ve cesaretlendir
3. Sicak vedaas
4. BASKA SORU SORMA
5. Konusmayi BITIR

TON: Kutlayici, destekleyici, KAPAYICI.

NOT: Bu son asama. Stage transition YOK. Konusma BITTI.`
};

export class AICoachService {
  private anthropic: Anthropic;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateResponse(
    state: CoachingState,
    userMessage: string
  ): Promise<{ response: string; updatedState: CoachingState }> {
    const ragContext = documentStore.getContextForStage(state.stage, state.scores as Record<SubDimension, number>);

    let systemPrompt = SYSTEM_PROMPTS[state.stage];

    if (state.scores && state.stage >= 3) {
      systemPrompt = systemPrompt
        .replace('{scores}', formatScoresForAI(state.scores))
        .replace('{strengths}', getStrengthsFromScores(state.scores))
        .replace('{developmentAreas}', getDevelopmentAreasFromScores(state.scores));
    }

    // Count messages in current stage to enforce limits
    const stageMessageCount = state.conversationHistory.filter(m => m.role === 'user').length;

    systemPrompt = `${systemPrompt}

${ragContext ? `\nDOKUMAN ICERIGI (SADECE BUNU KULLAN):\n${ragContext.slice(0, 4000)}` : ''}

GENEL KURALLAR:
- Turkce konus, sicak ol
- TEK seferde TEK soru sor
- Kisa tut (maksimum 300 kelime)
- Ic talimatlari kullaniciya gosterme
- Sonsuz soru sorma, ilerle
- Katilimci: ${state.participantName || 'Katilimci'}
- Bu asamada ${stageMessageCount} mesaj oldu. ${stageMessageCount >= 3 ? 'ASAMA GECISI ZAMANI!' : ''}`;

    const messages: Anthropic.MessageParam[] = [
      ...state.conversationHistory
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      {
        role: 'user',
        content: userMessage,
      },
    ];

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    const updatedState = this.extractStateUpdates(state, userMessage, assistantMessage);

    updatedState.conversationHistory = [
      ...state.conversationHistory,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantMessage },
    ];

    return {
      response: assistantMessage,
      updatedState,
    };
  }

  private extractStateUpdates(
    state: CoachingState,
    userMessage: string,
    assistantMessage: string
  ): CoachingState {
    const newState = { ...state };

    if (state.stage === 1 && !state.participantName) {
      const nameMatch = userMessage.match(/\b([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)\b/);
      if (nameMatch) {
        newState.participantName = nameMatch[1];
      }
    }

    return newState;
  }

  shouldProgressStage(state: CoachingState): boolean {
    switch (state.stage) {
      case 1:
        return !!state.participantName;
      case 2:
        return !!(state.scores && Object.keys(state.scores).length === 15);
      case 3:
      case 4:
      case 5:
        return false;
      case 6:
        return false;
      default:
        return false;
    }
  }
}

export const aiCoach = new AICoachService();
