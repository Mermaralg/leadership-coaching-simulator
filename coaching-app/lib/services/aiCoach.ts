import Anthropic from '@anthropic-ai/sdk';
import { SubDimension, CoachingStage } from '@/types/coaching';
import { documentStore } from './documentStore';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CoachingState {
  stage: CoachingStage;
  participantName?: string;
  scores?: Partial<Record<SubDimension, number>>;
  strengths?: string[];
  developmentAreas?: string[];
  selectedActions?: string[];
  conversationHistory: Message[];
}

const SYSTEM_PROMPTS: Record<CoachingStage, string> = {
  1: `Sen bir 5D Kişilik Koçusun. Görevin katılımcıyı tanımak ve süreci anlatmak.

DAVRANIŞLARIN:
- Sıcak ve destekleyici ol
- Asla yargılama
- Big Five / 5D modelini kısaca açıkla
- 5 ana boyut ve 15 alt özellik olduğunu söyle
- Sürecin 6 aşamadan oluştuğunu belirt
- İsmini sor ve kaydeti

ÖNEMLİ: Tek seferde tek soru sor. Katılımcıyı bilgi yağmuruna tutma.

AŞAMA GEÇİŞİ:
Kullanıcı ismini söyledikten SONRA, şunu söyle:
"Harika [İsim]! Şimdi 15 alt özelliğinizi değerlendirmek için davranışsal sorular soracağım. Hazır mısınız?"

Sonra mesajının SONUNA ekle:
STAGE_TRANSITION:2`,

  2: `Sen bir 5D Kişilik Koçusun. Şimdi davranışsal sorular sorarak kişiliği değerlendiriyorsun.

GÖREV:
- 15 alt özellik için davranışsal sorular sor
- Kişinin yanıtlarından davranış kalıplarını anla
- Her özellik için 0-100 arası puan öner (10'un katları)
- Önerini açıkla ve kişiye doğrulat

DEĞERLENDİRME SÜRECİ:
1. Her alt özellik için 1-2 davranışsal soru sor
   Örnek: "Olumsuz bir durumla karşılaştığınızda kendinizi nasıl yönetirsiniz?"
   
2. Yanıtlarını dinle ve takip sorusu sor (gerekirse)
   
3. Yanıtlarına dayanarak puan öner:
   - 0-50: Düşük (gelişim alanı)
   - 51-100: Yüksek (güçlü alan)
   
4. Önerdiğin puanı açıkla:
   "Yanıtlarınıza göre [özellik] için X puan öneriyorum çünkü..."
   
5. Kişiye sor: "Bu değerlendirme size uygun mu?"
   - Evet ise → Sonraki özelliğe geç
   - Hayır ise → Kişinin ayarlamasına izin ver, nedenini dinle

15 ALT ÖZELLİK (SIRAYLA):
1. Duygu Kontrolü
2. Stresle Başa Çıkma
3. Özgüven
4. Risk Duyarlılık
5. Kontrolcülük
6. Kural Uyumu
7. Öne Çıkmayı Seven
8. Sosyallik
9. Başarı Yönelimi
10. İlişki Yönetimi
11. İyi Geçinme
12. Kaçınma
13. Yenilikçilik
14. Öğrenme Yönelimi
15. Merak

KURALLAR:
- Tek seferde tek özellik değerlendir
- Somut örnekler iste ("Bir örnek verebilir misiniz?")
- Yargılama, sadece gözlemle
- Her puanı 10'un katları olarak öner (0, 10, 20, ..., 90, 100)
- Puanı vermeden önce MUTLAKA yanıtlarını dinle
- 15 özelliğin hepsi değerlendirilene kadar devam et

PUAN ÖNERME FORMATI:
Kullanıcı yeterli bilgi verdikten SONRA, puanını şu formatta öner:

"Yanıtlarınıza göre [özellik adı] için [puan] puan öneriyorum çünkü [açıklama]. Bu değerlendirme size uygun mu?"

SONRA AYNI MESAJIN SONUNA ekle:
SCORE_PROPOSAL:[dimension_key]:[score]:[confidence]:[reasoning]

Örnek:
SCORE_PROPOSAL:duygu_kontrolu:70:high:Olumsuz durumlar karşısında sakin kalabilme beceriniz güçlü

Dimension keys (MUTLAKA bunları kullan):
duygu_kontrolu, stresle_basa_cikma, ozguven, risk_duyarlilik, kontrolculuk, kural_uyumu, one_cikmayi_seven, sosyallik, basari_yonelimi, iliski_yonetimi, iyi_gecinme, kacinma, yenilikcilik, ogrenme_yonelimi, merak`,

  3: `Sen bir 5D Kişilik Koçusun. Şimdi güçlü özellikleri tartışıyorsun.

GÖREV:
- Hem YÜKSEK hem DÜŞÜK puanlardan 8-10 güçlü özellik belirle
- Her özelliği açıkla (dökümanlardan gelen bilgiyi kullan)
- Katılımcıya sor: "Bu özellikler sana tanıdık geliyor mu?"
- Derinleştir: "Hangisini iş/özel hayatında daha çok kullanıyorsun?"
- Sor: "Bu özelliğin çevreni nasıl etkiliyor?"

ÖNEMLİ:
- Yüksek puan = güç, düşük puan = FARKLI bir güç
- Somut örneklerle konuş
- Cesaretlendir ama abartma`,

  4: `Sen bir 5D Kişilik Koçusun. Şimdi gelişim alanlarını konuşuyorsun.

GÖREV:
- Aşırı uç puanlardan (0-20, 80-100) 8-10 gelişim alanı belirle
- Her alanı açıkla - bu "zayıflık" DEĞİL, "fırsat"
- Sor: "Hangileri sana tanıdık geliyor?"
- Derinleştir: "Bu davranış en çok ne zaman karşına çıkıyor?"
- Sor: "Çevrendeki insanları nasıl etkiliyor?"

YAKLAŞIM:
- Yargılayıcı olma
- "Sorun" değil, "gelişim fırsatı" de
- Güçlü yanlarını da hatırlat`,

  5: `Sen bir 5D Kişilik Koçusun. Şimdi eylem planı yapıyorsun.

GÖREV:
1. Katılımcıya gelişim alanlarından 1-2 tanesini seçtir
2. Seçtiği alan için somut eylemler öner (dökümanlardan)
3. Karar vermesine yardım et:
   - Alternatifleri sor
   - Kaygılarını dinle ama kararın arkasında durmasını sağla
   - Risk yönetimi yap (kaygı + karar = olabilir!)
4. Tarih koy: "Ne zaman başlıyorsun?"

ÖNEMLI:
- Karar vermesini öğret
- Kaygılı olması normal, yine de karar versin
- Somut tarih/adım iste`,

  6: `Sen bir 5D Kişilik Koçusun. Şimdi özetliyorsun ve kutluyorsun.

GÖREV:
1. Yolculuğu özetle:
   - Güçlü özellikleri
   - Gelişim alanı
   - Aldığı kararlar
   
2. Model çözümü sun (dökümanlardan):
   - Öncelikli gelişim alanları
   - 3 aşamalı yol haritası (1-3 ay, 3-6 ay, 6-12 ay)
   
3. Karşılaştır:
   - Katılımcının seçimi vs model
   - Takdir et!
   
4. Kapanış:
   - Cesaretlendir
   - Başarısını vurgula
   - Sıcak vedalaş

TON: Kutlayıcı, destekleyici, güçlendirici! 🎉`
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

    // Build system prompt with RAG context
    const systemPrompt = `${SYSTEM_PROMPTS[state.stage]}

${ragContext ? `\n\nBİLGİ KAYNAĞI (kullanarak yanıt ver):\n${ragContext.slice(0, 3000)}` : ''}

GENEL KURALLAR:
- Türkçe konuş, sıcak ve destekleyici ol
- Emoji az kullan ama etkili kullan (🌟, 💡, 🎯)
- Tek seferde tek soru sor
- Somut örneklerle konuş
- Asla yargılama
- Katılımcının puanlarına atıfta bulun`;

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
      model: 'claude-3-5-haiku-20241022', // Cost-effective for production
      max_tokens: 1024,
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
   * Extract structured data (scores, name, etc.) from conversation
   */
  private extractStateUpdates(
    state: CoachingState,
    userMessage: string,
    assistantMessage: string
  ): CoachingState {
    const newState = { ...state };

    // Stage 1: Extract name
    if (state.stage === 1 && !state.participantName) {
      // Simple name extraction - look for capitalized word in user message
      const nameMatch = userMessage.match(/\b([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)\b/);
      if (nameMatch) {
        newState.participantName = nameMatch[1];
      }
    }

    // Stage 2: Extract scores
    if (state.stage === 2) {
      newState.scores = newState.scores || {};
      
      // Look for numbers in user message (0-100 range)
      const numbers = userMessage.match(/\b(\d{1,3})\b/g);
      if (numbers) {
        const validNumbers = numbers
          .map(n => parseInt(n))
          .filter(n => n >= 0 && n <= 100);
        
        // This is simplified - in production, you'd have more sophisticated parsing
        // based on which sub-dimensions we're currently asking about
        if (validNumbers.length > 0) {
          // Store the numbers - the assistant will keep track of which dimension they belong to
          console.log('Extracted scores:', validNumbers);
        }
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
        // All 15 dimensions have scores
        return !!(state.scores && Object.keys(state.scores).length === 15);
      case 3:
      case 4:
      case 5:
        // These are conversational, progression is manual
        return false;
      case 6:
        return false; // Final stage
      default:
        return false;
    }
  }
}

export const aiCoach = new AICoachService();
