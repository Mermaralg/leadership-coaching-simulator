import { SubDimension } from '@/types/coaching';

export interface DevelopmentData {
  dimension: SubDimension;
  scoreRange: 'low' | 'high'; // 0-25 or 75-100 (extreme scores)
  developments: string[];
}

// Development areas - Note: Both LOW and HIGH scores can be development areas!
// Based on "Gelişim.pdf" and HTML coaching approach
export const DEVELOPMENT_DATA: DevelopmentData[] = [
  // DUYGU KONTROLÜ
  {
    dimension: 'duygu_kontrolu',
    scoreRange: 'low',
    developments: [
      'Duygusal tepkilerin iş ortamını olumsuz etkileyebilir',
      'Stresli anlarda kontrolü kaybetme riski',
      'Duygusal kararlar alma eğilimi',
      'Başkalarını duygusal olarak etkileyebilme',
    ],
  },
  {
    dimension: 'duygu_kontrolu',
    scoreRange: 'high',
    developments: [
      'Duyguları bastırma ve ifade etmeme',
      'Soğuk veya mesafeli algılanabilme',
      'Başkalarının duygusal ihtiyaçlarını fark edememe',
      'Empati kurmada zorlanma',
    ],
  },
  // STRESLE BAŞA ÇIKMA
  {
    dimension: 'stresle_basa_cikma',
    scoreRange: 'low',
    developments: [
      'Baskı altında performans düşüklüğü',
      'Belirsizlik karşısında kaygı yaşama',
      'Kriz anlarında donup kalma',
      'Stresli ortamlarda karar vermede zorlanma',
    ],
  },
  {
    dimension: 'stresle_basa_cikma',
    scoreRange: 'high',
    developments: [
      'Riskleri hafife alma',
      'Başkalarının stresini anlayamama',
      'Aşırı rahat görünüp ciddiyetsiz algılanma',
      'Önlem almayı ihmal etme',
    ],
  },
  // ÖZGÜVEN
  {
    dimension: 'ozguven',
    scoreRange: 'low',
    developments: [
      'Karar almakta zorlanma',
      'Sürekli onay arama ihtiyacı',
      'Fırsatları değerlendirememe',
      'Kendi fikirlerini savunmada çekingenlik',
      'Hata yapma korkusuyla hareket edememe',
    ],
  },
  {
    dimension: 'ozguven',
    scoreRange: 'high',
    developments: [
      'Geribildirimlere kapalı olma',
      'Kibirli veya kendini beğenmiş algılanma',
      'Başkalarının fikirlerini küçümseme',
      'Hatalarını kabul etmekte zorlanma',
    ],
  },
  // RİSK DUYARLILIK
  {
    dimension: 'risk_duyarlilik',
    scoreRange: 'low',
    developments: [
      'Düşünmeden hareket etme',
      'Gereksiz riskler alma',
      'Detayları gözden kaçırma',
      'Sonuçları öngörememe',
    ],
  },
  {
    dimension: 'risk_duyarlilik',
    scoreRange: 'high',
    developments: [
      'Analiz felci - karar verememe',
      'Fırsatları kaçırma',
      'Aşırı temkinli olup ilerleme sağlayamama',
      'Yeni fikirleri denememekten kaçınma',
    ],
  },
  // KONTROLCÜLÜK
  {
    dimension: 'kontrolculuk',
    scoreRange: 'low',
    developments: [
      'Plan oluşturmakta zorlanma',
      'Takip ve kontrolü ihmal etme',
      'Düzensiz iş yapma',
      'Sonuçları ölçmede eksiklik',
    ],
  },
  {
    dimension: 'kontrolculuk',
    scoreRange: 'high',
    developments: [
      'Yetki devretmekte zorlanma (mikroyönetim)',
      'Esnek olamamak',
      'Başkalarına güvenmeme',
      'Değişime direnç gösterme',
    ],
  },
  // KURAL UYUMU
  {
    dimension: 'kural_uyumu',
    scoreRange: 'low',
    developments: [
      'Kurallara uymamak veya görmezden gelmek',
      'Tutarsız davranışlar sergileme',
      'Güvenilmez algılanma riski',
      'Süreçleri atlama eğilimi',
    ],
  },
  {
    dimension: 'kural_uyumu',
    scoreRange: 'high',
    developments: [
      'Aşırı katı ve bürokratik olma',
      'Yaratıcı çözümlerden kaçınma',
      'Kuralların amacını sorgulamadan uyma',
      'Esneklik gerektiren durumlarda zorlanma',
    ],
  },
  // ÖNE ÇIKMAYI SEVEN
  {
    dimension: 'one_cikmayi_seven',
    scoreRange: 'low',
    developments: [
      'Fikirlerini paylaşmakta çekingenlik',
      'Görünmez kalma, fark edilmeme',
      'Liderlik fırsatlarını kaçırma',
      'Toplantılarda sessiz kalma',
    ],
  },
  {
    dimension: 'one_cikmayi_seven',
    scoreRange: 'high',
    developments: [
      'Başkalarının sözünü kesme',
      'İlgi odağı olma çabası',
      'Ekip oyuncusu olarak algılanmama',
      'Dinlemede zorlanma',
    ],
  },
  // SOSYALLİK
  {
    dimension: 'sosyallik',
    scoreRange: 'low',
    developments: [
      'İlişki ağı oluşturmada zorlanma',
      'İzole görünme',
      'Takım çalışmasında zorlanma',
      'İletişim fırsatlarını kaçırma',
    ],
  },
  {
    dimension: 'sosyallik',
    scoreRange: 'high',
    developments: [
      'Konuşma isteğini kontrol etmekte zorlanma',
      'Dinlemede zorlanma',
      'Yüzeysel ilişkiler kurma',
      'Odaklanmada zorlanma (sosyal dikkat dağılması)',
    ],
  },
  // BAŞARI YÖNELİMİ
  {
    dimension: 'basari_yonelimi',
    scoreRange: 'low',
    developments: [
      'İnisiyatif almada çekingenlik',
      'Hedef koymada zorlanma',
      'Zorlayıcı görevlerden kaçınma',
      'Pasif kalma eğilimi',
    ],
  },
  {
    dimension: 'basari_yonelimi',
    scoreRange: 'high',
    developments: [
      'Aşırı rekabetçi olma',
      'İş-yaşam dengesini kuramamak',
      'Başkalarını ezip geçme riski',
      'Ekip uyumunu bozma',
    ],
  },
  // İLİŞKİ YÖNETİMİ
  {
    dimension: 'iliski_yonetimi',
    scoreRange: 'low',
    developments: [
      'İlişkileri ihmal etme',
      'Soğuk veya mesafeli algılanma',
      'Çatışma çözümünde zorlanma',
      'Ekip bağlılığı oluşturamama',
    ],
  },
  {
    dimension: 'iliski_yonetimi',
    scoreRange: 'high',
    developments: [
      'İlişkiyi koruma çabasıyla kendi fikrini söyleyememe',
      'Zor kararları erteleme',
      'Performans sorunlarını görmezden gelme',
      'Popülerlik peşinde koşma',
    ],
  },
  // İYİ GEÇİNME
  {
    dimension: 'iyi_gecinme',
    scoreRange: 'low',
    developments: [
      'Çatışmacı algılanma',
      'İş birliği kurmada zorlanma',
      'Eleştiri kaldıramama',
      'Ekip uyumunu bozma',
    ],
  },
  {
    dimension: 'iyi_gecinme',
    scoreRange: 'high',
    developments: [
      'Fikir ayrılıklarında müzakere etmekten kaçınma',
      'Hemen kabul etme, uyma',
      'Kendi sınırlarını koruyamama',
      'Çatışma gerektiren durumlardan kaçınma',
    ],
  },
  // KAÇINMA
  {
    dimension: 'kacinma',
    scoreRange: 'low',
    developments: [
      'Çok doğrudan olup ilişkileri zedeleme',
      'Hassasiyetleri görmezden gelme',
      'Kırıcı gelebilecek geribildirimler verme',
      'Diplomasiden yoksun algılanma',
    ],
  },
  {
    dimension: 'kacinma',
    scoreRange: 'high',
    developments: [
      'Düşüncesini net ifade etmekte zorlanma',
      'Dolaylı konuşma',
      'Geribildirim vermekten kaçınma',
      'Beklentilerini açıkça söyleyememe',
      'Gerektiğinde hayır diyememe',
    ],
  },
  // YENİLİKÇİLİK
  {
    dimension: 'yenilikcilik',
    scoreRange: 'low',
    developments: [
      'Değişime direnç',
      'Yeni fikirlere kapalı olma',
      'Rutinden çıkamama',
      'İnovasyon fırsatlarını kaçırma',
    ],
  },
  {
    dimension: 'yenilikcilik',
    scoreRange: 'high',
    developments: [
      'Çok fazla fikir, az uygulama',
      'Mevcut işleri tamamlamadan yenisine başlama',
      'Rutinleri ihmal etme',
      'Pratik olmayan fikirler üretme',
    ],
  },
  // ÖĞRENME YÖNELİMİ
  {
    dimension: 'ogrenme_yonelimi',
    scoreRange: 'low',
    developments: [
      'Kendini geliştirmede isteksizlik',
      'Bilgi güncellemesini ihmal etme',
      'Yeni beceriler edinmekten kaçınma',
      'Değişen koşullara uyum sağlayamama',
    ],
  },
  {
    dimension: 'ogrenme_yonelimi',
    scoreRange: 'high',
    developments: [
      'Aşırı analiz ve araştırmayla zaman kaybetme',
      'Eyleme geçmede zorlanma (öğrenme felci)',
      'Bilgiyi pratiğe dökmede zorlanma',
      'Ukala algılanma riski',
    ],
  },
  // MERAK
  {
    dimension: 'merak',
    scoreRange: 'low',
    developments: [
      'Yeni konulara ilgi göstermeme',
      'Sorgulamadan kabul etme',
      'Derinlemesine araştırma yapmama',
      'Fırsatları görememek',
    ],
  },
  {
    dimension: 'merak',
    scoreRange: 'high',
    developments: [
      'Dikkat dağınıklığı',
      'Bir konuya odaklanamama',
      'Yüzeysel bilgi edinme',
      'Öncelikleri belirleyememe',
    ],
  },
];
