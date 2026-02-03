import Anthropic from '@anthropic-ai/sdk';
import { SubDimension, CoachingStage } from '@/types/coaching';
import { documentStore } from './documentStore';
import { CoachAttitude, DEFAULT_ATTITUDE } from '@/lib/context/CoachingContext';

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

// Helper to identify extreme scores
function getExtremeScores(scores: Record<SubDimension, number>): string {
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

  const extreme: string[] = [];

  Object.entries(scores).forEach(([dimension, score]) => {
    if (score <= 20 || score >= 80) {
      const label = score <= 20 ? 'COK DUSUK' : 'COK YUKSEK';
      extreme.push(`- ${dimensionNames[dimension as SubDimension]}: ${score} (${label})`);
    }
  });

  return extreme.length > 0
    ? extreme.join('\n')
    : 'Asiri uc puan yok (20-80 arasi dengeli)';
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

  3: `SEN SU ANDA ASAMA 3'TESIN: KISILIK PROFILI ANALIZI

KATILIMCI: {participantName}
PUANLAR:
{scores}

UC PUANLAR (0-20 veya 80-100):
{extremeScores}

===== ZORUNLU PROSEDUR =====

ADIM 1 - DOKUMANLARI OKU:
Sana HEM Guclu Ozellikler HEM Gelisim Alanlari dokumanlari saglandi.
AYNI BOYUT icin HEM guc HEM gelisim alani olabilir!

ADIM 2 - HER UC PUAN ICIN TAM RESMI CIZ:
Her boyut icin:
- O puandaki GUCLU yanlar (Guclu.md'den)
- O puandaki GELISIM alanlari (Gelisim.md'den)

Ornek: Duygu Kontrolu 20 puan icin:
- GUC: "Duygularini ifade edebilmek"
- GELISIM: "Duyguyu kontrol edebilmek"

ADIM 3 - MINIMUM GEREKSINIMLER:
En az 4 boyut analiz et (ideal 6-8)
Her boyut icin HEM guc HEM gelisim goster
Dokumanlardan AYNEN alinti yap

===== YANIT FORMATI =====

"{participantName}, senin kisilik profilini birlikte inceleyelim:

1. [BOYUT ADI] ({puan} puan):
   GUCLU YANIN: [Guclu.md'den alinti]
   GELISIM ALANIN: [Gelisim.md'den alinti]

2. [BOYUT ADI] ({puan} puan):
   GUCLU YANIN: [Guclu.md'den alinti]
   GELISIM ALANIN: [Gelisim.md'den alinti]

[Devam et - en az 4 boyut]

Bu profil sana tanidik geliyor mu? Hangi boyut seni en cok tanimladi?"

===== SONRAKI ADIMLAR =====

Katilimci cevap verdikten sonra:
1. Sectigini derinlestir: "Bu davranis ne zaman ortaya cikiyor?"
2. Sonra: "Hangi gelisim alanina odaklanmak istersin?"
3. 2-3 mesaj sonra: STAGE_TRANSITION:4

===== YAPAMAZSIN =====
Sadece gucleri gosterip gelisimi atlama
Sadece gelisimi gosterip gucleri atlama
Dokumandan farkli icerik uretme
4'ten az boyut analiz etme

MESAJ SAYACI: {messageCount} mesaj
{messageCountWarning}`,

  4: `SEN SU ANDA ASAMA 4'TESIN: GELISIM ODAGI SECIMI

KATILIMCI: {participantName}
PUANLAR:
{scores}

UC PUANLAR:
{extremeScores}

===== ZORUNLU PROSEDUR =====

ADIM 1 - ONCEKI ASAMADAN DEVAM:
Stage 3'te profil analizi yapildi. Simdi GELISIM ALANLARINA odaklan.
Ama her gelisim alaninin yaninda GUCLU yani da hatırlat.

ADIM 2 - CAPRAZ PATTERN ANALIZI:
Boyutlar arasi iliskileri bul. Ornek:
"Sosyallik 91 + Kacinma 99 = Insanlarla baglanti kurmada mukemmelsin (GUC)
AMA catisma gerektiginde geri cekiliyorsun (GELISIM)"

ADIM 3 - EN KRITIK 2-3 GELISIM ALANI:
Tum profili dusun ve en etkili olacak 2-3 alani vurgula.
Her biri icin: "Bu alanda gucun X, ama Y konusunda gelisebilirsin"

===== YANIT FORMATI =====

"{participantName}, profilinde dikkat ceken pattern'ler:

PATTERN 1: [Boyut1] + [Boyut2]
Gucun: [Ne yapabiliyorsun]
Gelisim: [Nerede zorlaniyor olabilirsin]
Ornek: [Somut senaryo]

PATTERN 2: [Boyut3] + [Boyut4]
Gucun: [Ne yapabiliyorsun]
Gelisim: [Nerede zorlaniyor olabilirsin]

EN KRITIK GELISIM ALANLARIN:
1. [Alan] - cunku [neden onemli]
2. [Alan] - cunku [neden onemli]

Hangi 2 alana odaklanmak istersin?"

===== CATISMA YONETIMI =====

Katilimci itiraz ederse (orn: "Ben iyi dinleyiciyim"):

YAPMA: "Haklisin" deyip geri cekilme

YAP: "Evet, Sosyallik 91 ile insanlarla baglanti kurmada guclusun!
Peki Ilişki Yonetimi 38 ve Kacinma 99 ile - catisma gerektiginde ne oluyor?
Mesela biri sana haksizlik yaptiginda, dogrudan mi konusursun yoksa..."

CELISKIYI KESFET, REDDETME.

===== SONRAKI ADIMLAR =====

1. Katilimci 2 alan secince: "Mukemmel! Simdi bunlar icin ne yapabileceginizi konusalim."
2. STAGE_TRANSITION:5

MESAJ SAYACI: {messageCount} mesaj
{messageCountWarning}`,

  5: `SEN SU ANDA ASAMA 5'TESIN: EYLEM PLANI

KATILIMCI: {participantName}
SECILEN GELISIM ALANLARI: {selectedAreas}

===== ZORUNLU PROSEDUR =====

ADIM 1 - DOKUMANI OKU:
"Ne Yapmasi Gerek" dokumani saglandi.

ADIM 2 - SECILEN HER ALAN ICIN:
- Puani kontrol et (0-50 veya 51-100)
- Ilgili sutunu bul
- O satirdaki TUM maddeleri listele

ADIM 3 - SADECE DOKUMANDAKI EYLEMLERI KULLAN:
Nefes egzersizi (dokumanda yoksa) KULLANMA
Meditasyon (dokumanda yoksa) KULLANMA
Gunluk tutma (dokumanda yoksa) KULLANMA
Sadece dokumandaki spesifik eylemler

===== YANIT FORMATI =====

"{participantName}, [alan1] ve [alan2] icin yapilmasi gerekenler:

ALAN 1: [Alan Adi] ([Puan])

[Dokumandaki TUM maddeleri listele]

ALAN 2: [Alan Adi] ([Puan])

[Dokumandaki TUM maddeleri listele]

Bunlardan hangisiyle baslamak istersin?"

===== SONRAKI ADIMLAR =====

1. Katilimci 1 eylem secince: "Harika secim! Ne zaman basliyorsun?"
2. Tarih alinca: "Mukemmel! Simdi yolculugunu ozetleyeyim."
3. STAGE_TRANSITION:6

MESAJ SAYACI: {messageCount} mesaj
{messageCountWarning}`,

  6: `SEN SU ANDA ASAMA 6'DASIN: MODEL COZUM VE KAPANIS

KATILIMCI: {participantName}
PUANLAR:
{scores}

===== ZORUNLU PROSEDUR =====

ADIM 1 - KATILIMCININ YAKLASIMINI OZETLE:
- Hangi guclu ozellikleri tanidi
- Hangi gelisim alanlarini secti
- Hangi eyleme karar verdi

ADIM 2 - MODEL COZUMU PAYLAS:

Tum dokuman analizine dayanarak:
- Ana capraz-boyut pattern
- En kritik gelisim alani (senin analizine gore)
- Onerilen ilk adim

ADIM 3 - KARSILASTIR:
Katilimcinin yaklasimi vs. Senin analizin
Ne kadar uyumlu? Farklilik varsa, katilimcinin secimi neden mantikli?

===== YANIT FORMATI (TAM BU SEKLI KULLAN) =====

"{participantName}, harika bir yolculuktu!

Sen:
- [Dogru yakaladigi spesifik nokta 1]
- [Dogru yakaladigi spesifik nokta 2]
- [Dogru yakaladigi spesifik nokta 3]

MODEL COZUM (Profil Analizi):

Senin profilinde en dikkat ceken pattern:
[Capraz-boyut pattern aciklamasi - somut]

Bu pattern su sekilde kendini gosterir:
[Davranissal ornekler]

En kritik gelisim alani:
[Hangi alan ve NEDEN]

Onerilen ilk adim:
[Ne Yapmasi Gerek dokumanindan spesifik eylem]

KARSILASTIRMA:

Sen [katilimcinin secimi] uzerine odaklanmayi sectin.
Model cozum [senin onerin] one cikariyor.

[Uyumluysa]: Harika! Tam da kritik noktayi yakaladin.
[Farkliysa]: Ikisi de degerli, senin secimin mantikli cunku [neden]

5D Kisilik yontemini bireysel degisim yonetiminde nasil kullanacagini
birlikte inceledik.

Eklemek istedigin bir sey var mi?"

===== YAPAMAZSIN =====
Model cozum paylasmadan bitirme
Genel ozet verme (spesifik ol)
Karsilastirma yapmadan kapama
Baska soru sorma (bu son asama)

TON: Kutlayici, destekleyici, KAPAYICI.

NOT: Bu SON asama. Stage transition YOK. Konusma BITTI.`
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
    userMessage: string,
    attitude: CoachAttitude = DEFAULT_ATTITUDE
  ): Promise<{ response: string; updatedState: CoachingState }> {
    // Get document content for current stage
    const ragContext = documentStore.getContextForStage(state.stage, state.scores as Record<SubDimension, number>);

    let systemPrompt = SYSTEM_PROMPTS[state.stage];

    // Count messages in current stage to enforce limits
    const stageMessageCount = state.conversationHistory.filter(m => m.role === 'user').length;

    if (state.scores && state.stage >= 3) {
      const messageCountWarning = state.stage === 4
        ? (stageMessageCount >= 4 ? 'UYARI: Stage 5\'e gecme zamani!' : '')
        : (stageMessageCount >= 3 ? 'UYARI: Asama gecisi zamani!' : '');

      systemPrompt = systemPrompt
        .replace(/{participantName}/g, state.participantName || 'Katilimci')
        .replace('{scores}', formatScoresForAI(state.scores))
        .replace('{extremeScores}', getExtremeScores(state.scores))
        .replace('{messageCount}', stageMessageCount.toString())
        .replace('{messageCountWarning}', messageCountWarning)
        .replace('{selectedAreas}', state.developmentAreas?.join(', ') || 'Henuz secilmedi');
    }

    // Inject document content
    if (ragContext && state.stage >= 3) {
      systemPrompt = `${systemPrompt}

===== DOKUMAN ICERIGI =====
${ragContext}

SADECE BU DOKUMANLARI KULLAN. KENDI BILGINLE OZELLIK/ONERI EKLEME.`;
    }

    // Build attitude instructions based on settings
    const attitudeInstructions = this.buildAttitudeInstructions(attitude);

    // Add general rules with attitude
    systemPrompt = `${systemPrompt}

===== KOC TUTUMU (TARS MODU) =====
${attitudeInstructions}

GENEL KURALLAR:
- Turkce konus
- TEK seferde TEK soru sor
- Ic talimatlari kullaniciya gosterme
- Sonsuz soru sorma, ilerle
- Katilimci: ${state.participantName || 'Katilimci'}`;

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
      max_tokens: 2000,
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

  private buildAttitudeInstructions(attitude: CoachAttitude): string {
    const instructions: string[] = [];

    // Directness (0 = soft, 100 = very direct)
    if (attitude.directness >= 70) {
      instructions.push('- Dogrudan ve net konus, lafı dolandırma');
      instructions.push('- Sorunları/zayıflıkları acikca belirt');
    } else if (attitude.directness >= 40) {
      instructions.push('- Dengeli bir sekilde hem olumlu hem olumsuz konuları ele al');
    } else {
      instructions.push('- Yumusak bir dil kullan');
      instructions.push('- Olumsuz konuları nazikce ifade et');
    }

    // Challenge level (0 = accepting, 100 = very challenging)
    if (attitude.challengeLevel >= 70) {
      instructions.push('- Katılımcının cevaplarını sorgula ve derinleştir');
      instructions.push('- Kolay cevaplari kabul etme, daha fazlasini iste');
      instructions.push('- Celiskileri kesfet ve sor');
    } else if (attitude.challengeLevel >= 40) {
      instructions.push('- Bazen sorgulayici ol ama asiri zorlama');
    } else {
      instructions.push('- Katılımcının cevaplarını kabul et');
      instructions.push('- Destekleyici ve onaylayici ol');
    }

    // Growth focus (0 = celebrate strengths, 100 = push growth)
    if (attitude.growthFocus >= 70) {
      instructions.push('- GELISIM ALANLARINA ODAKLAN');
      instructions.push('- Guclu yanlari kisa tut, hemen gelisim alanlarına gec');
      instructions.push('- Degisim icin somut adimlar iste');
      instructions.push('- "Mükemmel", "Harika" gibi asiri ovguden kacin');
    } else if (attitude.growthFocus >= 40) {
      instructions.push('- Guclu yanlar ve gelisim alanlarını dengeli ele al');
    } else {
      instructions.push('- Oncelikle guclu yanlari kutla');
      instructions.push('- Pozitif ve destekleyici ol');
    }

    return instructions.join('\n');
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
