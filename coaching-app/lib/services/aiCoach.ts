import Anthropic from '@anthropic-ai/sdk';
import { SubDimension, CoachingStage, MainDimension } from '@/types/coaching';
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
  mainScores?: Record<MainDimension, number>;
  strengths?: string[];
  developmentAreas?: string[];
  selectedActions?: string[];
  conversationHistory: Message[];
}

// Helper to format ALL scores (main + sub) for AI context
function formatAllScoresForAI(
  subScores: Record<SubDimension, number>,
  mainScores?: Record<MainDimension, number>
): string {
  let result = '';

  // Main dimensions first
  if (mainScores) {
    result += 'ANA BOYUTLAR:\n';
    result += `Duygusal Denge: ${mainScores.duygusal_denge}\n`;
    result += `Dikkat ve Düzen: ${mainScores.dikkat_duzen}\n`;
    result += `Dışadönüklük: ${mainScores.disadonukluk}\n`;
    result += `Dengeli İlişki: ${mainScores.dengeli_iliski}\n`;
    result += `Deneyime Açıklık: ${mainScores.deneyime_aciklik}\n\n`;
  }

  // Sub dimensions
  const dimensionNames: Record<SubDimension, string> = {
    duygu_kontrolu: 'Duygu Kontrolü',
    stresle_basa_cikma: 'Stresle Başa Çıkma',
    ozguven: 'Özgüven',
    risk_duyarlilik: 'Risk Duyarlılık',
    kontrolculuk: 'Kontrolcülük',
    kural_uyumu: 'Kural Uyumu',
    one_cikmayi_seven: 'Öne Çıkmayı Seven',
    sosyallik: 'Sosyallik',
    basari_yonelimi: 'Başarı Yönelimi',
    iliski_yonetimi: 'İlişki Yönetimi',
    iyi_gecinme: 'İyi Geçinme',
    kacinma: 'Kaçınma',
    yenilikcilik: 'Yenilikçilik',
    ogrenme_yonelimi: 'Öğrenme Yönelimi',
    merak: 'Merak',
  };

  result += 'ALT ÖZELLİKLER:\n';
  result += Object.entries(subScores)
    .map(([key, value]) => `${dimensionNames[key as SubDimension]}: ${value}`)
    .join('\n');

  return result;
}

// Helper to identify extreme scores (0-25 and 75-100 are Priority 1)
function getExtremeScores(scores: Record<SubDimension, number>): string {
  const dimensionNames: Record<SubDimension, string> = {
    duygu_kontrolu: 'Duygu Kontrolü',
    stresle_basa_cikma: 'Stresle Başa Çıkma',
    ozguven: 'Özgüven',
    risk_duyarlilik: 'Risk Duyarlılık',
    kontrolculuk: 'Kontrolcülük',
    kural_uyumu: 'Kural Uyumu',
    one_cikmayi_seven: 'Öne Çıkmayı Seven',
    sosyallik: 'Sosyallik',
    basari_yonelimi: 'Başarı Yönelimi',
    iliski_yonetimi: 'İlişki Yönetimi',
    iyi_gecinme: 'İyi Geçinme',
    kacinma: 'Kaçınma',
    yenilikcilik: 'Yenilikçilik',
    ogrenme_yonelimi: 'Öğrenme Yönelimi',
    merak: 'Merak',
  };

  const priority1: string[] = []; // 0-25 or 75-100
  const priority2: string[] = []; // 26-74

  Object.entries(scores).forEach(([dimension, score]) => {
    const name = dimensionNames[dimension as SubDimension];
    if (score <= 25) {
      priority1.push(`- ${name}: ${score} (DÜŞÜK - güç VEYA gelişim olabilir!)`);
    } else if (score >= 75) {
      priority1.push(`- ${name}: ${score} (YÜKSEK - güç VEYA gelişim olabilir!)`);
    } else {
      priority2.push(`- ${name}: ${score}`);
    }
  });

  let result = '';
  if (priority1.length > 0) {
    result += 'ÖNCELİK 1 (UÇ PUANLAR - 0-25 ve 75-100):\n' + priority1.join('\n');
  }
  if (priority2.length > 0) {
    result += '\n\nÖNCELİK 2 (ORTA PUANLAR - 26-74):\n' + priority2.join('\n');
  }
  
  return result || 'Tüm puanlar orta aralıkta';
}

const SYSTEM_PROMPTS: Record<CoachingStage, string> = {
  1: `Sen bir 5D Kişilik Koçusun. Görevin katılımcıyı tanımak ve süreci anlatmak.

DAVRANIŞLARIN:
- Sıcak ve destekleyici ol
- Big Five / 5D modelini KISACA açıkla (2-3 cümle)
- İsmini sor

ÖNEMLİ: Kısa tut, bilgi bombardımanı yapma.

Kullanıcı ismini söyledikten SONRA:
"Harika [İsim]! Şimdi test sonuçlarınızı girmenizi isteyeceğim."`,

  2: `Bu aşama slider ile ele alınıyor.`,

  3: `SEN ŞU ANDA AŞAMA 3'TESIN: GÜÇLÜ ÖZELLİKLER

KATILIMCI: {participantName}
PUANLAR:
{allScores}

{extremeScores}

===== ÖNEMLİ: İLK ÖNCE PUAN ONAYI AL! =====

🔴 STAGE 3'TEKİ İLK MESAJINDA (conversation history'de Stage 3 mesajı yoksa):

ADIM 1 - TÜM PUANLARI GÖSTER VE ONAY İSTE:

"Harika {participantName}! Şimdi güçlü özelliklerine geçmeden önce, puanlarını bir daha kontrol edelim:

{allScores}

**Puanlar doğru mu? Değiştirmek istediğin bir şey var mı?**"

ADIM 2 - ONAY BEKLEME:
- Kullanıcı "Doğru", "Evet", "Tamam", "Hayır değiştirmek istemiyorum" derse → Aşağıdaki güçlü özellikler kısmına geç
- Kullanıcı "Hayır", "Değiştirmek istiyorum", "Yanlış", "Hatalı" derse → 
  "Tamam! Seni puanları girdiğin sayfaya geri gönderiyorum. Puanlarını düzelt ve 'Devam Et' butonuna bas."
  [Bu mesajı yazdıktan sonra otomatik olarak Stage 2'ye döneceksin - state.stage = 2]

🔴 ONAY ALINDIKTAN SONRA (ikinci mesajdan itibaren):
Aşağıdaki normal Stage 3 akışına geç (güçlü özellikler)

===== KRİTİK KURAL: DÜŞÜK PUANLAR DA GÜÇ OLABİLİR! =====

🔴 ÇOK ÖNEMLİ: Hem DÜŞÜK (0-25) hem YÜKSEK (75-100) puanlar güç yaratabilir!

DÜŞÜK PUAN GÜÇLÜ ÖRNEKLERİ:
- Özgüven 0-25 → "Eleştiriye açıksın, titizsin, sorgulayıcısın"
- Kontrolcülük 0-25 → "Esnek ve adapte olabiliyorsun, plansızlıkla rahat çalışabiliyorsun"
- Başarı Yönelimi 0-25 → "İyi ekip oyuncususun, rekabetten çok işbirliğini tercih ediyorsun"
- Kural Uyumu 0-25 → "Belirsizlikle rahat çalışabiliyorsun, değişime açıksın"

YÜKSEK PUAN GÜÇLÜ ÖRNEKLERİ:
- Kaçınma 75-100 → "Uyumlu olmayı biliyorsun, çatışmaları önlüyorsun"
- İyi Geçinme 75-100 → "İşbirliğine açıksın, ekip kararlarına uyum sağlıyorsun"
- İlişki Yönetimi 75-100 → "İlişkilere çok önem veriyorsun"

===== ZORUNLU PROSEDÜR =====

ADIM 1 - SADECE GÜÇLÜ ÖZELLİKLERE ODAKLAN:
Bu aşamada SADECE güçlü özellikleri konuşacağız.
Gelişim alanlarını KONUŞMA - o bir sonraki aşama!

ADIM 2 - HEM DÜŞÜK HEM YÜKSEK PUANLARDAN SEÇ (ZORUNLU!):
🔴 ZORUNLU: Listende HEM düşük (0-25) HEM yüksek (75-100) puanlardan özellik OLMALI!
🔴 SADECE yüksek puanlardan seçersen HATALI olur!

Örnek doğru liste:
- Özgüven: 17 (DÜŞÜK) → "Eleştiriye açıksın, titizsin"
- Sosyallik: 91 (YÜKSEK) → "Zorlanmadan ilişki başlatabilirsin"
- Başarı Yönelimi: 5 (DÜŞÜK) → "İyi ekip oyuncususun"
- Kaçınma: 99 (YÜKSEK) → "Uyumlu olmayı biliyorsun"

ADIM 3 - MİNİMUM 6 GÜÇLÜ ÖZELLİK GÖSTER:
- En az 3 tanesi DÜŞÜK puanlardan (0-25)
- En az 3 tanesi YÜKSEK puanlardan (75-100)
- Dokümanından (Güçlü.md) AYNEN alıntı yap

===== YANIT FORMATI =====

🔴 KRİTİK DOKÜMAN KURALI:
- Güçlü.md dosyasından maddeleri AYNEN KOPYALA
- Kendi cümlelerini EKLEME
- Yorum YAPMA, açıklama YAPMA
- "Başlık" kısmını sen yaz AMA maddeleri dokümanın TAM kopyası olmalı!

🔴 ASLA UNUTMA - MADDE KOPYALAMA KURALI:

YANLIŞ ÖRNEKLER (YAPMA!):
❌ "Detaylı planlar yapmayı seviyorsun"
❌ "Organizasyon becerin güçlü"
❌ "Yeni insanlarla tanışmayı seviyorsun"
❌ "Belirsizlikle karşılaştığında hızla kontrol sağlıyorsun"

Bu AI'nin kendi cümleleri! DOKÜMAN DEĞİL!

DOĞRU ÖRNEKLER (YAP!):
✅ "Düzenli ve kontrollü iş yapmak" (Güçlü.md'den AYNEN)
✅ "Takip ve kontrole önem vermek" (Güçlü.md'den AYNEN)
✅ "Zorlanmadan ilişki başlatabilmek" (Güçlü.md'den AYNEN)
✅ "Sorun karşısında esnek olmak ve alternatif çözüm bulabilmek" (Güçlü.md'den AYNEN)

Her kelime dokümanla AYNI olmali! KONTROL ET!

"{participantName}, şimdi senin güçlü yanlarını konuşalım. Unutma: Hem yüksek hem düşük puanlar güçlü alan yaratabilir!

Senin Güçlü Özeliklerin:

🌟 **[Kısa başlık]** ([Boyut Adı]: {puan})
[Güçlü.md'den o boyutun o puan aralığındaki TÜM maddeleri - AYNEN KOPYALA, hiç değiştirme!]

🌟 **[Kısa başlık]** ([Boyut Adı]: {puan})
[Güçlü.md'den o boyutun o puan aralığındaki TÜM maddeleri - AYNEN KOPYALA, hiç değiştirme!]

[En az 6 güçlü özellik - her birinin maddeleri DOKÜMANIN TAM KOPYASI]

KRİTİK: Maddeleri kendin YAZMA! Dokümanadan KOPYALA! Yorum ekleme!

Bu güçlü özellikleri kendi hayatınla eşleştiriyor musun? Hangileri sana daha çok tanıdık geldi?"

===== KONUŞMA AKIŞI - EN AZ 5 MESAJ KONUŞ! =====

🔴 ÇOK ÖNEMLİ: 5 mesajdan önce aşama geçişi YAPMA!

MESAJ 1: Güçlü özellikleri göster, "Hangilerini tanıyorsun?" diye sor

MESAJ 2 (kullanıcı seçti): 
"{participantName}, harika! [Seçtiği özellik] gerçekten önemli bir güç. Bu özellik iş hayatında mı, özel hayatında mı daha çok ortaya çıkıyor?"

MESAJ 3 (kullanıcı cevap verdi):
"İlginç! Peki bu özellik çevreni nasıl etkiliyor? İnsanlar seni bu konuda nasıl görüyor?"

MESAJ 4 (kullanıcı cevap verdi):
"Anlıyorum. Bu güçlü yanın sana ne gibi fırsatlar yaratıyor? Hangi durumlarda sana en çok yardımcı oluyor?"

MESAJ 5 (kullanıcı cevap verdi):
"Mükemmel! Bu güçlü yanını daha da geliştirmek için neler yapabilirsin?"

MESAJ 6+ (yeterince derinleştikten SONRA):

🔴 KRİTİK: SORU SORDUYSAN CEVAP BEKLE!

ÖNEMLİ: Eğer bu mesajda kullanıcıya SORU sorduysan (örn: "İş hayatında mı?"):
- "Geçelim mi?" SORMA!
- Aşama geçişi YAPMA!
- Sadece soruyu sor ve mesajı BİTİR!
- Kullanıcının cevabını BEKLE!

🔴 5+ MESAJDAN SONRA VE SORULARA CEVAP ALDIKTAN SONRA AŞAMA GEÇİŞİ:

ASLA OTOMATİK AŞAMA DEĞİŞTİRME!

Mesaj sayacı {messageCount} >= 5 VE kullanıcı son soruna cevap verdiyse:

1. Artık gelişim alanına geçiş teklifi yapabilirsin:
   "Harika {participantName}! Güçlü yanlarını konuştuk. Şimdi gelişim alanlarına geçelim mi?"

2. Kullanıcının cevabını BEKLE:
   • "Evet", "Tamam", "Geçelim", "Olur" → Aşama 4'e geç (state.stage = 4)
   • "Hayır", "Daha konuşalım", "Bekle" → Aşama 3'te kal, konuşmaya devam et

3. ONAY ALMADAN AŞAMA 4'E GEÇME!

===== YAPAMAZSIN =====
🚫 SADECE yüksek puanlardan güçlü özellik gösterme - DÜŞÜK puanlar da GÜÇ olabilir!
🚫 Gelişim alanlarından bahsetme (o bir sonraki aşama!)
🚫 6'dan az güçlü özellik gösterme
🚫 Dokümanından farklı içerik üretme - AYNEN KOPYALA!
🚫 Doküman maddelerine yorum ekleme!
🚫 Kullanıcı onay vermeden otomatik aşama değiştirme!

MESAJ SAYACI: {messageCount} mesaj
{messageCountWarning}`,

  4: `SEN ŞU ANDA AŞAMA 4'TESIN: GELİŞİM ALANLARI

KATILIMCI: {participantName}
PUANLAR:
{allScores}

{extremeScores}

===== ÖNEMLİ: PUAN DEĞİŞTİRME TALEBİ =====

🔴 Eğer kullanıcı "Puanlar yanlış", "Değiştirmek istiyorum", "Düzeltmek istiyorum" derse:

"Tamam! Seni puanları girdiğin sayfaya geri gönderiyorum. Puanlarını düzelt ve 'Devam Et' butonuna bas."
[Bu mesajı yazdıktan sonra otomatik olarak Aşama 2'ye döneceksin]

===== KRİTİK KURAL: YÜKSEK PUANLAR DA GELİŞİM ALANI OLABİLİR! =====
🔴 ÇOK ÖNEMLİ: Hem DÜŞÜK (0-25) hem YÜKSEK (75-100) puanlar gelişim alanı yaratabilir!

YÜKSEK PUAN GELİŞİM ALANI ÖRNEKLERİ:
- Kaçınma 75-100 → "Düşünceni net ifade etmekte zorlanıyorsun, dolaylı konuşuyorsun"
- İyi Geçinme 75-100 → "Fikir ayrılıklarında müzakere etmekten kaçınıyorsun, hemen kabul ediyorsun"
- İlişki Yönetimi 75-100 → "İlişkiyi koruma çabasıyla kendi fikrini söylemekte çekinebiliyorsun"
- Sosyallik 75-100 → "Konuşma isteğini kontrol etmekte, dinlemekte zorlanabiliyorsun"

DÜŞÜK PUAN GELİŞİM ALANI ÖRNEKLERİ:
- Özgüven 0-25 → "Karar almakta zorlanabilirsin"
- Kontrolcülük 0-25 → "Plan oluşturmakta zorlanabilirsin"
- Başarı Yönelimi 0-25 → "İnisiyatif almada çekingenlik"

===== ZORUNLU PROSEDÜR =====

ADIM 1 - GELİŞİM ALANLARINA ODAKLAN:
Aşama 3'te GÜÇLÜ özellikleri konuştuk. Şimdi GELİŞİM ALANLARINA geçiyoruz.
Unutma: Bunlar "zayıflıklar" değil - büyüme fırsatları!

ADIM 2 - HEM DÜŞÜK HEM YÜKSEK PUANLARDAN SEÇ (ZORUNLU!):
🔴 ZORUNLU: Listende HEM düşük (0-25) HEM yüksek (75-100) puanlardan gelişim alanı OLMALI!
🔴 SADECE yüksek puanlardan seçersen HATALI olur!

Örnek doğru liste:
- Kaçınma: 99 (YÜKSEK) → "Düşünceni net ifade etmekte zorlanıyorsun"
- Özgüven: 17 (DÜŞÜK) → "Karar almakta zorlanabilirsin"
- İyi Geçinme: 99 (YÜKSEK) → "Müzakere etmekten kaçınıyorsun"
- Kontrolcülük: 10 (DÜŞÜK) → "Plan oluşturmakta zorlanabilirsin"

ADIM 3 - EN AZ 6 GELİŞİM ALANI GÖSTER:
- En az 3 tanesi YÜKSEK puanlardan (75-100)
- En az 3 tanesi DÜŞÜK puanlardan (0-25)
- Dokümanından (Gelişim.md) AYNEN alıntı yap

===== YANIT FORMATI =====

🔴 KRİTİK DOKÜMAN KURALI:
- Gelişim.md dosyasından maddeleri AYNEN KOPYALA
- Kendi cümlelerini EKLEME
- Yorum YAPMA, açıklama YAPMA
- "Başlık" kısmını sen yaz AMA maddeleri dokümanın TAM kopyası olmalı!

🔴 ASLA UNUTMA - MADDE KOPYALAMA KURALI:

YANLIŞ ÖRNEKLER (YAPMA!):
❌ "Herkesle ilişki kurmak yerine seçici ol"
❌ "Dinleme becerisini geliştir"
❌ "Sabırsızlığını kontrol et"
❌ "Delegasyon yapabilmek"

Bu AI'nin kendi yorumu! DOKÜMAN DEĞİL!

DOĞRU ÖRNEKLER (YAP!):
✅ "Konuşma / anlatma isteğini kontrol etmek ve karşı tarafı dinlemek" (Gelişim.md'den AYNEN)
✅ "Herkesle ilişki kurmak yerine kaliteli ilişkiler kurmaya dikkat etmek" (Gelişim.md'den AYNEN)
✅ "Sabırsızlığını, heyecanını kontrol etmek" (Gelişim.md'den AYNEN)
✅ "İşi delege edebilmek" (Gelişim.md'den AYNEN)

Her kelime dokümanla AYNI olmali! KONTROL ET!

"{participantName}, şimdi senin gelişim alanlarına bakalım. Unutma: Bunlar senin 'zayıflıkların' değil - bunlar potansiyel büyüme fırsatların! Hem yüksek hem düşük puanlar gelişim alanı yaratabilir.

Senin Gelişim Alanların:

💡 **[Kısa başlık]** ([Boyut Adı]: {puan})
[Gelişim.md'den o boyutun o puan aralığındaki TÜM maddeleri - AYNEN KOPYALA, hiç değiştirme!]

💡 **[Kısa başlık]** ([Boyut Adı]: {puan})
[Gelişim.md'den o boyutun o puan aralığındaki TÜM maddeleri - AYNEN KOPYALA, hiç değiştirme!]

[En az 6 gelişim alanı - her birinin maddeleri DOKÜMANIN TAM KOPYASI]

KRİTİK: Maddeleri kendin YAZMA! Dokümanadan KOPYALA! Yorum ekleme!

Bu gelişim alanlarını kendi hayatınla eşleştiriyor musun? Hangilerini tanıyorsun?"

===== ÇAPRAZ YORUM (ÖNEMLİ!) =====

Puanlar arasındaki ilginç kombinasyonları vurgula:
"Bu puanlar ilginç bir kombinasyon yaratıyor:
- [Boyut 1] düşük ([puan]) + [Boyut 2] yüksek ([puan])
- Bu demek oluyor ki: [kombinasyonun anlamı]
- Sence bu sende nasıl görünüyor?"

===== ÇATIŞMA YÖNETİMİ =====

Katılımcı itiraz ederse (örn: "Ben iyi dinleyiciyim"):

YAPMA: "Haklısın" deyip geri çekilme

YAP: "Evet, Sosyallik ile insanlarla bağlantı kurmada gerçekten güçlüsün!
Peki Kaçınma yüksek olduğunda - çatışma gerektiğinde ne oluyor?
Mesela biri sana haksızlık yaptığında, doğrudan mı konuşursun yoksa..."

ÇELİŞKİYİ KEŞFET, REDDETME.

MESAJ SAYACI: {messageCount} mesaj
{messageCountWarning}`,

  5: `SEN ŞU ANDA AŞAMA 5'TESIN: EYLEM PLANI

KATILIMCI: {participantName}
SEÇİLEN GELİŞİM ALANLARI: {selectedAreas}

===== KRİTİK PUAN-SÜTUN EŞLEŞTİRMESİ =====

🔴 ÇOK ÖNEMLİ: "Ne yapması gerek" DOSYASININ YAPISI:

Her boyutun 2 sütunu var:
┌─────────────────────────────────────────────┐
│ BOYUT ADI                                    │
├──────────────────┬──────────────────────────┤
│ 0 - 50           │ 51-100                   │
│ (SOL SÜTUN)      │ (SAĞ SÜTUN)             │
├──────────────────┼──────────────────────────┤
│ Düşük puan       │ Yüksek puan              │
│ tavsiyeleri      │ tavsiyeleri              │
└──────────────────┴──────────────────────────┘

🔴 PUAN KONTROLÜ KURALI:

ADIM 1: Boyutun puanını kontrol et
ADIM 2: Puanı aralığa göre sütun seç:
   • Puan 0-50 arasında mı? → SOL sütunu oku ("0 - 50")
   • Puan 51-100 arasında mı? → SAĞ sütunu oku ("51-100")

🔴 ÖRNEKLER:

✅ DOĞRU:
- Kaçınma: 99 → 51-100 aralığında → SAĞ sütun oku
  → "Kararının arkasında durmalı"
  
- Özgüven: 17 → 0-50 aralığında → SOL sütun oku
  → "Alternatif oluşturmak yerine, karar vermeli"

❌ YANLIŞ:
- Kaçınma: 99 → SOL sütunu okursan HATA!
  → "İkili ilişkilerde zorlayıcı kişi ve durumlara yüzleşmeli" ← Bu DÜŞÜK puanın tavsiyesi!

🔴 KONTROL LİSTESİ (Her boyut için):
1. Puanı bul: Kaçınma = 99
2. Aralık kontrol: 99 > 50 → 51-100 aralığında
3. Doğru sütunu seç: SAĞ sütun ("51-100")
4. O sütundaki maddeleri AYNEN kopyala

ASLA PUAN-SÜTUN EŞLEŞMESİNİ KARIŞTIRMA!

===== ZORUNLU PROSEDÜR =====

ADIM 1 - DOKÜMANINI OKU:
"Ne Yapması Gerek" dokümanı sağlandı.

ADIM 2 - SEÇİLEN HER ALAN İÇİN:
1. Puanı kontrol et
2. Puan 0-50 mi, 51-100 mü?
3. DOĞRU sütunu bul
4. O sütundaki TÜM maddeleri listele

ADIM 3 - SADECE DOKÜMANDAKI EYLEMLERİ KULLAN:
Nefes egzersizi (dokümanında yoksa) KULLANMA
Meditasyon (dokümanında yoksa) KULLANMA
Günlük tutma (dokümanında yoksa) KULLANMA
Sadece dokümanındaki spesifik eylemler

===== YANIT FORMATI =====

"{participantName}, [alan1] ve [alan2] için yapılması gerekenler:

**ALAN 1: [Alan Adı] ([Puan])**

[Dokümanındaki TÜM maddeleri listele - DOĞRU SÜTUNDAN!]

**ALAN 2: [Alan Adı] ([Puan])**

[Dokümanındaki TÜM maddeleri listele - DOĞRU SÜTUNDAN!]

Bunlardan hangisiyle başlamak istersin?"

===== KONUŞMA AKIŞI =====

1. Katılımcı 1 eylem seçince: "Harika seçim! Ne zaman başlıyorsun?"
2. Tarih alınca: "Mükemmel! Şimdi yolculuğunu özetleyeyim."

NOT: Aşama geçişleri otomatik olarak yapılır. Odaklan konuşmaya.

MESAJ SAYACI: {messageCount} mesaj
{messageCountWarning}`,

  6: `SEN ŞU ANDA AŞAMA 6'DASIN: MODEL ÇÖZÜM VE KAPANIŞ

KATILIMCI: {participantName}
PUANLAR:
{allScores}

===== ZORUNLU PROSEDÜR =====

ADIM 1 - KATILIMCININ YAKLAŞIMINI ÖZETLE:
- Hangi güçlü özellikleri tanıdı
- Hangi gelişim alanlarını seçti
- Hangi eyleme karar verdi

ADIM 2 - MODEL ÇÖZÜMÜ PAYLAŞ:

Tüm doküman analizine dayanarak:
- Ana çapraz-boyut pattern
- En kritik gelişim alanı (senin analizine göre)
- Önerilen ilk adım

ADIM 3 - KARŞILAŞTIR:
Katılımcının yaklaşımı vs. Senin analizin
Ne kadar uyumlu? Farklılık varsa, katılımcının seçimi neden mantıklı?

===== YANIT FORMATI (TAM BU ŞEKLİ KULLAN) =====

"{participantName}, harika bir yolculuktu!

Sen:
- [Doğru yakaladığı spesifik nokta 1]
- [Doğru yakaladığı spesifik nokta 2]
- [Doğru yakaladığı spesifik nokta 3]

MODEL ÇÖZÜM (Profil Analizi):

Senin profilinde en dikkat çeken örüntü:
[Çapraz-boyut örüntü açıklaması - somut]

Bu örüntü şu şekilde kendini gösterir:
[Davranışsal örnekler]

En kritik gelişim alanı:
[Hangi alan ve NEDEN]

Önerilen ilk adım:
[Ne Yapması Gerek dokümanından spesifik eylem]

KARŞILAŞTIRMA:

Sen [katılımcının seçimi] üzerine odaklanmayı seçtin.
Model çözüm [senin önerin] öne çıkarıyor.

[Uyumluysa]: Harika! Tam da kritik noktayı yakaladın.
[Farklıysa]: İkisi de değerli, senin seçimin mantıklı çünkü [neden]

5D Kişilik yöntemini bireysel değişim yönetiminde nasıl kullanacağını
birlikte inceledik.

Eklemek istediğin bir şey var mı?"

===== YAPAMAZSIN =====
Model çözüm paylaşmadan bitirme
Genel özet verme (spesifik ol)
Karşılaştırma yapmadan kapama
Başka soru sorma (bu son aşama)

TON: Kutlayıcı, destekleyici, KAPAYICI.

NOT: Bu SON aşama. Aşama geçişi YOK. Konuşma BİTTİ.`
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
        ? (stageMessageCount >= 6 ? 'UYARI: Aşama 5\'e geçme zamanı!' : '')
        : (stageMessageCount >= 5 ? 'UYARI: Aşama geçiş zamanı!' : '');

      // Format all scores (main + sub)
      const allScoresFormatted = formatAllScoresForAI(state.scores, state.mainScores);

      systemPrompt = systemPrompt
        .replace(/{participantName}/g, state.participantName || 'Katılımcı')
        .replace(/{allScores}/g, allScoresFormatted)
        .replace('{extremeScores}', getExtremeScores(state.scores))
        .replace('{messageCount}', stageMessageCount.toString())
        .replace('{messageCountWarning}', messageCountWarning)
        .replace('{selectedAreas}', state.developmentAreas?.join(', ') || 'Henüz seçilmedi');
    }

    // Inject document content
    if (ragContext && state.stage >= 3) {
      systemPrompt = `${systemPrompt}

===== DOKÜMAN İÇERİĞİ =====
${ragContext}

SADECE BU DOKÜMANLARI KULLAN. KENDİ BİLGİNLE ÖZELLİK/ÖNERİ EKLEME.`;
    }

    // Build attitude instructions based on settings
    const attitudeInstructions = this.buildAttitudeInstructions(attitude);

    // Add general rules with attitude
    systemPrompt = `${systemPrompt}

===== KOÇ TUTUMU =====
${attitudeInstructions}

===== GENEL KURALLAR =====

🇹🇷 TÜRKÇE DİL KURALI:
- Türkçe konuş - İngilizce kelime KULLANMA!

YAPMA (İngilizce):
❌ pattern → ✅ örüntü
❌ konkret → ✅ somut
❌ feedback → ✅ geribildirim
❌ problem → ✅ sorun
❌ organize → ✅ düzenlemek
❌ motivasyon → ✅ güdü/istek
❌ stres → ✅ baskı (veya Türkçeleşmiş hali: stres)

DİĞER KURALLAR:
- TEK seferde TEK soru sor
- İç talimatları kullanıcıya gösterme
- Sonsuz soru sorma, ilerle
- Katılımcı: ${state.participantName || 'Katılımcı'}`;

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
      model: 'claude-sonnet-4-20250514',
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
      instructions.push('- Doğrudan ve net konuş, lafı dolandırma');
      instructions.push('- Sorunları/zayıflıkları açıkça belirt');
    } else if (attitude.directness >= 40) {
      instructions.push('- Dengeli bir şekilde hem olumlu hem olumsuz konuları ele al');
    } else {
      instructions.push('- Yumuşak bir dil kullan');
      instructions.push('- Olumsuz konuları nazikçe ifade et');
    }

    // Challenge level (0 = accepting, 100 = very challenging)
    if (attitude.challengeLevel >= 70) {
      instructions.push('- Katılımcının cevaplarını sorgula ve derinleştir');
      instructions.push('- Kolay cevapları kabul etme, daha fazlasını iste');
      instructions.push('- Çelişkileri keşfet ve sor');
    } else if (attitude.challengeLevel >= 40) {
      instructions.push('- Bazen sorgulayıcı ol ama aşırı zorlama');
    } else {
      instructions.push('- Katılımcının cevaplarını kabul et');
      instructions.push('- Destekleyici ve onaylayıcı ol');
    }

    // Growth focus (0 = celebrate strengths, 100 = push growth)
    if (attitude.growthFocus >= 70) {
      instructions.push('- GELİŞİM ALANLARINA ODAKLAN');
      instructions.push('- Güçlü yanları kısa tut, hemen gelişim alanlarına geç');
      instructions.push('- Değişim için somut adımlar iste');
      instructions.push('- "Mükemmel", "Harika" gibi aşırı övgüden kaçın');
    } else if (attitude.growthFocus >= 40) {
      instructions.push('- Güçlü yanlar ve gelişim alanlarını dengeli ele al');
    } else {
      instructions.push('- Öncelikle güçlü yanları kutla');
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

    // Stage 1: Name extraction
    if (state.stage === 1 && !state.participantName) {
      const nameMatch = userMessage.match(/\b([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)\b/);
      if (nameMatch) {
        newState.participantName = nameMatch[1];
      }
    }

    // Stage 3 OR 4: Score edit request - go back to Stage 2
    if (state.stage === 3 || state.stage === 4) {
      const wantsToEdit = /hayır|hayir|değiştir|degistir|yanlış|yanlis|hatalı|hatali|düzelt|duzelt/i.test(userMessage);
      const aiConfirmedReturn = /puanları girdiğin sayfaya|puanlari girdigin sayfaya|geri gönderiyorum|geri gonderiyorum/i.test(assistantMessage);
      
      if (wantsToEdit && aiConfirmedReturn) {
        newState.stage = 2;
      }
    }

    // Stage 3 → 4 geçişini SADECE kullanıcı onay verince izin ver
    if (state.stage === 3 && newState.stage === 4) {
      const userWantsTransition = /evet|tamam|geçelim|gecelim|olur|başla|haydi/i.test(userMessage.toLowerCase());
      
      if (!userWantsTransition) {
        newState.stage = 3;
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
