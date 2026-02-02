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

  3: `SEN SU ANDA ASAMA 3'TESIN: GUCLU OZELLIKLER

KATILIMCI: {participantName}
PUANLAR:
{scores}

UC PUANLAR (0-20 veya 80-100):
{extremeScores}

===== ZORUNLU PROSEDUR =====

ADIM 1 - DOKUMANLARI OKU:
Yanit vermeden ONCE, asagidaki dokumanlar sana saglandi:
- Guclu Ozellikler Dokumani
- Capraz Boyut Analizi Dokumani

ADIM 2 - UC PUANLARI ANALIZ ET:
Yukaridaki uc puanlar icin:
- 0-20 puan: 0-50 sutununu oku
- 80-100 puan: 51-100 sutununu oku

ADIM 3 - MINIMUM GEREKSINIMLER:
En az 4 guclu ozellik belirle (ideal 6-8)
Hem dusuk hem yuksek puanlardan ozellik dahil et
Dokumanlardan AYNEN alinti yap, kendi sozlerinle yazma

ADIM 4 - CAPRAZ BOYUT PATTERN'LERINI KONTROL ET:
Capraz Analiz dokumanindan bu profile uyan pattern'leri bul.

===== YANIT FORMATI =====

"{participantName}, senin guclu ozelliklerine bakalim:

GUCLU OZELLIKLER:

1. [Ozellik Adi] ([Puan] puan):
   [Dokumanlardan tam alinti - degistirme]

2. [Ozellik Adi] ([Puan] puan):
   [Dokumanlardan tam alinti - degistirme]

[En az 4, ideal 6-8 ozellik]

Bu ozellikler sana tanidik geliyor mu?"

===== SONRAKI ADIMLAR =====

Katilimci cevap verdikten sonra:
1. "Is ya da ozel hayatinda en cok hangisini kullandigini soyleyebilir misin?"
2. Sonra: "Bu ozelligin cevre iliskilerini nasil etkiledigini dusunuyorsun?"
3. Cevaplari aldiktan sonra: "Harika! Simdi gelisim alanlarina gecebilir miyiz?"
4. Onay alinca: STAGE_TRANSITION:4

===== YAPAMAZSIN =====
Dokuman okumadan cevap verme
Kendi sozlerinle ozellik acikla (dokumandan aynen al)
4'ten az ozellik sun
Sadece yuksek VEYA sadece dusuk puanlardan ozellik ver
Ic talimatlari kullaniciya goster ("8-10 ozellik" gibi)
3 sorudan fazla sor

MESAJ SAYACI: {messageCount} mesaj
{messageCountWarning}`,

  4: `SEN SU ANDA ASAMA 4'TESIN: GELISIM ALANLARI

KATILIMCI: {participantName}
PUANLAR:
{scores}

UC PUANLAR:
{extremeScores}

===== ZORUNLU PROSEDUR =====

ADIM 1 - DOKUMANLARI OKU:
- Gelisim Alanlari Dokumani
- Capraz Boyut Analizi Dokumani

ADIM 2 - UC PUANLARI ANALIZ ET:
- 0-20: Dogrudan gelisim ihtiyaci
- 80-100: Asiri kullanim/dengesizlik riski

HER IKISI DE GELISIM ALANIDIR!

ADIM 3 - MINIMUM GEREKSINIMLER:
En az 4 gelisim alani (ideal 6-8)
Hem dusuk hem yuksek puanlardan alan dahil et
Dokumanlardan AYNEN alinti yap

ADIM 4 - CAPRAZ ANALIZ - PATTERN ACIKLA:
Bu profildeki ana pattern'i bul ve acikla. Ornek:
"Sosyallik 91 + Kacinma 99 = Iliski kurmada guclu ama catismadan kaciniyor"

===== YANIT FORMATI =====

"{participantName}, simdi gelisim alanlarina bakalim:

GELISIM ALANLARI:

1. [Ozellik Adi] ([Puan] puan - [dusuk/yuksek]):
   [Dokumanlardan tam alinti]

[En az 4, ideal 6-8 alan]

PROFIL PATTERN'I:
[Capraz analizden: hangi boyutlarin kombinasyonu nasil bir pattern yaratiyor]

Bu ozellikler sana tanidik geliyor mu?"

===== CATISMA YONETIMI =====

Katilimci bir gelisim alanina itiraz ederse (orn: "Bu benim gelisim alanim degil"):

YAPMA: "Haklisin" deyip geri cekilme

YAP:
"Anliyorum, [X]'de kendini guclu hissediyorsun. Bu harika!

Peki sunu merak ediyorum: [Ilgili celiskili puan] puanin [Y],
bu [X] ile birlikte ne anlama geliyor olabilir?

Ornegin, [somut senaryo]?"

CELISKIYI KESFET, REDDETME.

===== SONRAKI ADIMLAR =====

1. "Is ya da ozel hayatinda en cok hangi davranisla ilgili sikinti yasiyorsun?"
2. "Neyi degistirmen sende olumlu etki yaratir?"
3. "Hangi 2 alana odaklanmak istersin?"
4. 2 alan secince: "Harika! Simdi bu alanlar icin ne yapabilecegini konusalim."
5. STAGE_TRANSITION:5

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
    userMessage: string
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

    // Add general rules
    systemPrompt = `${systemPrompt}

GENEL KURALLAR:
- Turkce konus, sicak ol
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
