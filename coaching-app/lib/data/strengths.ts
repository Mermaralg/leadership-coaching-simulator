import { SubDimension } from '@/types/coaching';

export interface StrengthData {
  dimension: SubDimension;
  scoreRange: 'low' | 'high'; // 0-50 or 51-100
  strengths: string[];
}

// Data from "_5D güçlü gelişim - Güçlü.pdf"
export const STRENGTH_DATA: StrengthData[] = [
  // DUYGU KONTROLÜ
  {
    dimension: 'duygu_kontrolu',
    scoreRange: 'low',
    strengths: [
      'Duygularını ifade edebilmek',
      'Karşı tarafın duygusunu fark edebilmek',
      'İlişkilerde duygunun da etkilerini görmek',
      'Başkaları üzerinde yarattığı etkiye göre davranışını düzenlemek',
    ],
  },
  {
    dimension: 'duygu_kontrolu',
    scoreRange: 'high',
    strengths: [
      'Olumsuzluklar karşısında sakin kalmak ve duygusunu yönetmek',
      'Sorunları olduğundan daha fazla büyütmemek',
      'Çevresinde kişilerin duygusunu sakinliğiyle yatıştırmak',
      'Olumlu ve pozitif düşünmek',
    ],
  },
  // STRESLE BAŞA ÇIKMA
  {
    dimension: 'stresle_basa_cikma',
    scoreRange: 'low',
    strengths: [
      'Kriz olabilecek durumları çabuk farketmek',
      'Stresli durumlarda önlem almaya odaklanmak',
      'Stresli durumlarda gereksiz risklerden kaçınmak',
      'Çevresindeki kişilerden destek alabilmek',
    ],
  },
  {
    dimension: 'stresle_basa_cikma',
    scoreRange: 'high',
    strengths: [
      'Baskı ve stresi yönetebilmek',
      'Zorlu ve stresli durumlarda soğukkanlı kalmak',
      'Belirsizlikleri kolay yönetmek',
      'Kriz durumuna odaklanmak yerine sorunu çözmeye odaklanmak',
    ],
  },
  // ÖZGÜVEN
  {
    dimension: 'ozguven',
    scoreRange: 'low',
    strengths: [
      'Eleştiriye ve geribildirimlere açık olmak',
      'Kendisinin güçlü ve gelişim alanlarını fark etmek',
      'Titiz ve mükemmeliyetçi olmak',
      'Ayrıntılı sorgulama yapmak',
      'Kendisine verilen geribildirimleri dikkate almak',
    ],
  },
  {
    dimension: 'ozguven',
    scoreRange: 'high',
    strengths: [
      'Kendine güvenmek',
      'Karar almak ve aldığı kararın arkasında durmak',
      'Hata yapmaktan kaçınmamak, deneyim olarak görmek',
      'Zorlu görevlerin üstesinden gelebileceğine inanmak',
    ],
  },
  // RİSK DUYARLILIK
  {
    dimension: 'risk_duyarlilik',
    scoreRange: 'low',
    strengths: [
      'Kolay ve hızlı harekete geçebilmek',
      'Yeni fikirlerin uygulanabilirliğine odaklanmak',
      'Analizden eyleme geçebilmek',
      'Fırsatları görmek ve denemekten kaçınmamak',
    ],
  },
  {
    dimension: 'risk_duyarlilik',
    scoreRange: 'high',
    strengths: [
      'Risk olabilecek durumları önceden fark etmek',
      'Anlık ve dürtüsel hareketlerden kaçınmak',
      'Olası riskler karşısında alternatif planlar oluşturmak',
      'Kaliteli ve yüksek standartta iş yapmaya dikkat etmek',
    ],
  },
  // KONTROLCÜLÜK
  {
    dimension: 'kontrolculuk',
    scoreRange: 'low',
    strengths: [
      'Sorun karşısında esnek olmak ve alternatif çözüm bulabilmek',
      'Plansızlık karşısında rahat olmak',
      'Herşeyi kontrol edemeyeceklerini düşünüp kaygıyı yönetmek ve sakin kalmak',
      'Yeni fikirlerin denenmesi için cesaretli olmak',
    ],
  },
  {
    dimension: 'kontrolculuk',
    scoreRange: 'high',
    strengths: [
      'Takip ve kontrole önem vermek',
      'Düzenli ve kontrollü iş yapmak',
      'Kontrol gerektiren işleri üstlenmek',
      'Hatasız iş yapmaya dikkat etmek',
    ],
  },
  // KURAL UYUMU
  {
    dimension: 'kural_uyumu',
    scoreRange: 'low',
    strengths: [
      'Belirsiz durumlarda çalışmak',
      'Esnek ve değişime açık görünmek',
      'Sonuç odaklı davranmak',
      'Kuralların olmadığı durumları normal görmek ve hızla uyum sağlamak',
    ],
  },
  {
    dimension: 'kural_uyumu',
    scoreRange: 'high',
    strengths: [
      'Tam olarak kuralına ve beklentiye uygun iş yapmak',
      'Güvenilir algılanmak',
      'Süreç ve sistem odaklı olmak',
      'Şirket kurallarına, prosedürlerine uymak',
    ],
  },
  // ÖNE ÇIKMAYI SEVEN
  {
    dimension: 'one_cikmayi_seven',
    scoreRange: 'low',
    strengths: [
      'İyi bir ekip oyuncusu olmayı istemek',
      'Topluluk içerisinde uyumlu gözükmek istemek',
      'Ekibin başarısına odaklanmak',
      'Uzun süreli, kaliteli ilişki kurmak',
      'Etkin dinlemek',
    ],
  },
  {
    dimension: 'one_cikmayi_seven',
    scoreRange: 'high',
    strengths: [
      'Öne çıkma isteğini yansıtmak',
      'Her durumda konuşmak, kendini göstermeyi istemek',
      'Sunum yapmaktan, düşüncesini aktarmaktan kaçınmamak',
      'Bilmediği ortamlarda rahat davranmak',
    ],
  },
  // SOSYALLİK
  {
    dimension: 'sosyallik',
    scoreRange: 'low',
    strengths: [
      'Kendi başına çalışmayı tercih etmek',
      'Seçerek ve amaca yönelik ilişki kurmak',
      'İşle ilişki kurmayı dengede tutmak',
    ],
  },
  {
    dimension: 'sosyallik',
    scoreRange: 'high',
    strengths: [
      'Zorlanmadan ilişki başlatabilmek',
      'Geniş bir çevreye sahip olmak',
      'Birbirinden farklı insanlarla kolay ilişki kurmak',
      'Konuşkan, enerjik görünmek',
      'Hızlı iletişim gerektiren/ilk adım atılması gereken durumlarda rahatlıkla harekete geçebilmek',
    ],
  },
  // BAŞARI YÖNELİMİ
  {
    dimension: 'basari_yonelimi',
    scoreRange: 'low',
    strengths: [
      'İyi yaptığını bildiği ve emin olduğu işleri yapmak',
      'Başkalarının verdiği kararlara kolaylıkla uymak',
      'Yersiz rekabetten kaçınmak',
      'İyi bir ekip oyuncusu olmayı istemek',
    ],
  },
  {
    dimension: 'basari_yonelimi',
    scoreRange: 'high',
    strengths: [
      'Zorlu işler/projelerde inisiyatif almak',
      'Karar verici olmayı ve yönetmeyi istemek',
      'Rekabeti sevmek',
      'Hedef ve sonuç odaklı olmak',
    ],
  },
  // İLİŞKİ YÖNETİMİ
  {
    dimension: 'iliski_yonetimi',
    scoreRange: 'low',
    strengths: [
      'Konuşulması gereken konuyu önceliklendirmek',
      'Önce işin ele alınmasını sağlamak',
      'İş ve ilişki arasında ayrım yapmak',
      'Geniş bir çevre yerine, mevcut ilişkilerini sürdürmeye dikkat etmek',
      'Sorun çıktığında müdahale etmeyi tercih etmek',
    ],
  },
  {
    dimension: 'iliski_yonetimi',
    scoreRange: 'high',
    strengths: [
      'Diğerlerinin ihtiyaçlarını fark etmek ve insanları memnun etmek için çabalamak',
      'Tartışma durumlarında çözüm bulmaya önem vermek',
      'Çevresindeki kişilerle bağ kurmaya önem vermek',
      'Sorunları çözerken sadece sonuca değil, ilişkiyi de korumaya dikkat etmek',
    ],
  },
  // İYİ GEÇİNME
  {
    dimension: 'iyi_gecinme',
    scoreRange: 'low',
    strengths: [
      'Kaçınmadan çatışma gerektiren durumları yönetmek',
      'Düşüncesini savunmak ve ikna etmek için çabalamak',
      'Hatayı konuşabilmek',
      'Karşı tarafı sorgulanmaktan kaçınmamak',
    ],
  },
  {
    dimension: 'iyi_gecinme',
    scoreRange: 'high',
    strengths: [
      'Kurduğu ilişkilerin uzun süreli olmasına önem vermek',
      'İşbirliğine açık olmak',
      'Ekip kararlarına kolay uyum sağlamak, destek vermek',
      'Çevresindeki kişilere önyargısız yaklaşmak, güven duymak',
    ],
  },
  // KAÇINMA
  {
    dimension: 'kacinma',
    scoreRange: 'low',
    strengths: [
      'Düşüncesini net, doğrudan ifade etmek',
      'Zorlayıcı durumlardan ne olması gerektiğini konuşmak',
      'Açık ve net geribildirim vermek',
      'İşin yapılması için beklentisini tanımlamak',
    ],
  },
  {
    dimension: 'kacinma',
    scoreRange: 'high',
    strengths: [
      'Sıcak ve sevilen kişi olmak',
      'Gereksiz çatışmalardan kaçınmak, uyumlu olmayı tercih etmek',
      'Beklentisini ifade ederken karşı tarafın durumuna uygun ilerlemek',
      'Çatışma gerektiren durumlarda çözüm için sorumluluk almak',
    ],
  },
  // YENİLİKÇİLİK
  {
    dimension: 'yenilikcilik',
    scoreRange: 'low',
    strengths: [
      'Rutin işleri sıkılmadan yapmak',
      'Sorunları pratik çözmek',
      'Bildiği ve emin olduğu yolları tercih etmek',
      'Başkalarının ürettiği çözümleri kolay sahiplenmek',
    ],
  },
  {
    dimension: 'yenilikcilik',
    scoreRange: 'high',
    strengths: [
      'Farklı deneyimlere açık olmak',
      'Büyük resmi görmek',
      'Yeni fırsatları/seçenekleri değerlendirmek istemek',
      'Farklı ve heyecanlı ortamlarda olmayı istemek',
    ],
  },
  // ÖĞRENME YÖNELİMİ
  {
    dimension: 'ogrenme_yonelimi',
    scoreRange: 'low',
    strengths: [
      'İlgi alanlarına yönelik kendini geliştirmek ve araştırmak',
      'Tecrübesini kullanmayı tercih etmek',
      'Amaca yönelik bilgiyi öğrenmeyi tercih etmek',
      'Öğrendiklerini pratik olarak uygulamaya almak',
    ],
  },
  {
    dimension: 'ogrenme_yonelimi',
    scoreRange: 'high',
    strengths: [
      'Bir işe başlamadan önce detaylı bir hazırlık yapmak',
      'Eğitim/gelişimden keyif almak, önem vermek',
      'Bilge görünmek',
      'Kendi gelişimine ve birlikte çalıştığı kişilerin eğitimine önem vermek',
      'Ayrınıtılı analiz yapmak, veriyle konuşmak',
    ],
  },
  // MERAK
  {
    dimension: 'merak',
    scoreRange: 'low',
    strengths: [
      'Uygulayarak/sorarak öğrenmeyi tercih etmek',
      'Gereksiz risklerden, zaman kaybından kaçınmak',
      'Başarılı olduğu yöntemleri tercih etmek',
      'Yeni fikri denemeden önce olasılıkları öğrenmeye çalışmak',
    ],
  },
  {
    dimension: 'merak',
    scoreRange: 'high',
    strengths: [
      'Farklı konularda öğrenmeyi ve araştırmayı sevmek',
      'İş ve teknoloji dünyasındaki en son gelişmeleri takip etmek',
      'Değişen koşullara hızla uyum sağlamak',
      'Bildiğinin dışına çıkıp kendini güncellemek',
    ],
  },
];
