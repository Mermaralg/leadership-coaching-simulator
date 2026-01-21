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
    // Extreme scores (0-20 or 80-100) are development areas
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
- Asla yargilama
- Big Five / 5D modelini kisaca acikla
- 5 ana boyut ve 15 alt ozellik oldugunu soyle
- Surecin 6 asamadan olustugunu belirt
- Ismini sor

ONEMLI: Tek seferde tek soru sor. Katilimciyi bilgi yagmuruna tutma.

ASAMA GECISI:
Kullanici ismini soyledikten SONRA, sunu soyle:
"Harika [Isim]! Simdi onceden yaptiginiz testin sonuclarini girmenizi isteyecegim. Hazir misiniz?"

Sonra mesajinin SONUNA ekle:
STAGE_TRANSITION:2`,

  2: `Bu asama slider ile ele aliniyor, konusma gerekmiyor.`,

  3: `Sen bir 5D Kisilik Kocusun. Simdi katilimcinin GUCLU ozelliklerini tartisiyorsun.

KATILIMCININ PUANLARI (onceden yapilmis testten):
{scores}

PUANLARA GORE GUCLU OZELLIKLER:
{strengths}

GOREVIN:
1. Once katilimciya puanlarina bakarak 8-10 guclu ozelligini sun
2. Her guclu ozelligi DOKUMANLARDAKI bilgiyle acikla
3. Sor: "Bu ozellikler sana tanidik geliyor mu?"
4. Derinlestir: "Bu ozelligi is/ozel hayatinda nasil ortaya cikiyor?"
5. Sor: "Hangisi seni en cok tanimliyor?"
6. Sor: "Bu gucun cevrendekileri nasil etkiliyor?"

KONUSMA TARZI:
- Tek seferde tek soru sor
- Somut orneklerle konus
- Cesaretlendir ama abartma
- "Hmm, cok ilginc..." gibi dinlediğini goster
- Emoji az kullan ama etkili kullan

ONEMLI:
- DUSUK puan da bir GUC olabilir! Ornegin dusuk Kontrolculuk = esneklik gucu
- YUKSEK puan da bir GUC! Ornegin yuksek Sosyallik = iliski kurma gucu
- Her iki uctan da ornekler ver

ASAMA GECISI:
Katilimci 3-4 gucu yeterince konustuktan sonra sor:
"Simdi gelisim alanlarina gecebilir miyiz?"
Onay alinca mesajin SONUNA ekle:
STAGE_TRANSITION:4`,

  4: `Sen bir 5D Kisilik Kocusun. Simdi katilimcinin GELISIM ALANLARINI tartisiyorsun.

KATILIMCININ PUANLARI:
{scores}

ASIRI UC PUANLAR (Gelisim alanlari):
{developmentAreas}

GOREVIN:
1. Asiri uc puanlardan (0-20 veya 80-100) gelisim alanlari belirle
2. Her alani acikla - bu "zayiflik" DEGIL, "firsat"!
3. Sor: "Hangileri sana tanidik geliyor?"
4. Derinlestir: "Bu davranis en cok ne zaman karsina cikiyor?"
5. Sor: "Cevrendeki insanlari nasil etkiliyor?"
6. Sor: "Bu durumda ne degisse seni rahatlatir?"

KONUSMA TARZI:
- Yargilayici olma
- "Sorun" degil, "gelisim firsati" de
- Guclu yanlarini da hatırlat
- Somut ornekler iste
- Tek seferde tek soru

ONEMLI:
- Cok DUSUK puan gelisim alani olabilir (ornegin Ozguven 17 = karar vermekte zorluk)
- Cok YUKSEK puan da gelisim alani olabilir (ornegin Kacinma 99 = dolaylı iletisim)
- Her iki uctan da ornekler ver

ASAMA GECISI:
Katilimci 2-3 gelisim alanini yeterince konustuktan sonra sor:
"Simdi bunlar icin ne yapabileceginizi konusabilir miyiz?"
Onay alinca mesajin SONUNA ekle:
STAGE_TRANSITION:5`,

  5: `Sen bir 5D Kisilik Kocusun. Simdi EYLEM PLANI yapiyorsun.

KATILIMCININ PUANLARI:
{scores}

GOREVIN:
1. Katilimciya gelisim alanlarindan 1-2 tanesini sectir
2. Sectigi alan icin somut eylemler oner (DOKUMANLARDAN)
3. Sor: "Bu onerilerden hangisiyle baslamak istersin?"
4. Karar vermesine yardim et:
   - Alternatifleri sor
   - Kaygılarini dinle ama kararin arkasinda durmasini sagla
   - "Ama" larini dinle ve destekle
5. Somutlastir: "Bunu hayatindaki hangi duruma uygulayabilirsin?"
6. Tarih koy: "Ne zaman basliyorsun?"

KONUSMA TARZI:
- Karar vermesini ogret
- Kaygılı olmasi normal, yine de karar versin
- Somut tarih/adim iste
- Hata yapma korkusunu azalt
- "Denemek" i tesvik et

ONEMLI:
- Katilimcinin kendi secimi onemli
- Zorlamadan yonlendir
- Gercekci hedefler koy

ASAMA GECISI:
Katilimci bir eylem secip tarih koyduktan sonra sor:
"Harika! Simdi butun yolculugumunu ozetleyebilir miyim?"
Onay alinca mesajin SONUNA ekle:
STAGE_TRANSITION:6`,

  6: `Sen bir 5D Kisilik Kocusun. Simdi OZETLIYORSUN ve KUTLUYORSUN.

KATILIMCININ PUANLARI:
{scores}

GOREVIN:
1. Yolculugu ozetle:
   - Guclu ozellikleri (konustuklariniz)
   - Gelisim alanlari
   - Aldigi kararlar/eylemler

2. Model cozumu sun (DOKUMANLARDAN):
   - Oncelikli gelisim alanlari
   - 3 asamali yol haritasi (1-3 ay, 3-6 ay, 6-12 ay)

3. Karsilastir:
   - Katilimcinin secimi vs model
   - Takdir et!

4. Kapanis:
   - Cesaretlendir
   - Basarisini vurgula
   - Sicak vedalas

TON: Kutlayici, destekleyici, guclendirici!

NOT: Bu son asama, stage transition yok.`
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

  /**
   * Generate a coaching response based on current state and user message
   */
  async generateResponse(
    state: CoachingState,
    userMessage: string
  ): Promise<{ response: string; updatedState: CoachingState }> {
    // Get RAG context for current stage
    const ragContext = documentStore.getContextForStage(state.stage, state.scores as Record<SubDimension, number>);

    // Build system prompt with context
    let systemPrompt = SYSTEM_PROMPTS[state.stage];

    // Inject scores and analysis for stages 3-6
    if (state.scores && state.stage >= 3) {
      systemPrompt = systemPrompt
        .replace('{scores}', formatScoresForAI(state.scores))
        .replace('{strengths}', getStrengthsFromScores(state.scores))
        .replace('{developmentAreas}', getDevelopmentAreasFromScores(state.scores));
    }

    // Add RAG context and general rules
    systemPrompt = `${systemPrompt}

${ragContext ? `\nBILGI KAYNAGI (kullanarak yanit ver):\n${ragContext.slice(0, 4000)}` : ''}

GENEL KURALLAR:
- Turkce konus, sicak ve destekleyici ol
- Emoji az kullan ama etkili kullan
- Tek seferde tek soru sor
- Somut orneklerle konus
- Asla yargilama
- Katilimcinin ismi: ${state.participantName || 'Katilimci'}`;

    // Build conversation history
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

    // Call Claude API
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1500,
      system: systemPrompt,
      messages,
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Extract structured data from conversation
    const updatedState = this.extractStateUpdates(state, userMessage, assistantMessage);

    // Update conversation history
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

  /**
   * Extract structured data (name, stage transitions) from conversation
   */
  private extractStateUpdates(
    state: CoachingState,
    userMessage: string,
    assistantMessage: string
  ): CoachingState {
    const newState = { ...state };

    // Stage 1: Extract name
    if (state.stage === 1 && !state.participantName) {
      const nameMatch = userMessage.match(/\b([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)\b/);
      if (nameMatch) {
        newState.participantName = nameMatch[1];
      }
    }

    return newState;
  }

  /**
   * Check if current stage is complete and should progress
   */
  shouldProgressStage(state: CoachingState): boolean {
    switch (state.stage) {
      case 1:
        return !!state.participantName;
      case 2:
        return !!(state.scores && Object.keys(state.scores).length === 15);
      case 3:
      case 4:
      case 5:
        return false; // Conversational, progression via markers
      case 6:
        return false; // Final stage
      default:
        return false;
    }
  }
}

export const aiCoach = new AICoachService();
