import { Rubric, RubricDimension } from './types';

export const SCORING_RUBRIC: Rubric = {
  'duygu_kontrolu': {
    key: 'duygu_kontrolu',
    title: 'Duygu Kontrolü',
    bands: [
      {
        min: 0,
        max: 50,
        label: 'low',
        anchors: [
          'Duyguyu kontrol edebilmek',
          'Olumsuzluklar karşısında kolay etkilenmeden kendini yönetebilmek',
          'Alıngan olmadan duyguyu yönetmek',
          'Duygusal iniş-çıkışlara takılı kalmadan durumu ele alabilmek',
        ],
        probes: [
          'Olumsuz bir durumla karşılaştığınızda kendinizi nasıl yönetirsiniz?',
          'Bir eleştiri aldığınızda ilk tepkiniz ne olur?',
        ],
      },
      {
        min: 51,
        max: 100,
        label: 'high',
        anchors: [
          'Duygularını ifade edebilmek',
          'Olumsuzluklar karşısında sakin kalmak ve duygusunu yönetmek',
          'Karşı tarafın duygusunu fark edebilmek',
          'Sorunları olduğundan daha fazla büyütmemek',
          'İlişkilerde duygunun da etkilerini görmek',
          'Çevresinde kişilerin duygusunu sakinliğiyle yatıştırmak',
          'Başkaları üzerinde yarattığı etkiye göre davranışını düzenlemek',
          'Olumlu ve pozitif düşünmek',
        ],
      },
    ],
    genericProbes: [
      'Stresli bir toplantıda kendinizi nasıl hissedersiniz ve bunu nasıl yansıtırsınız?',
      'Ekibinizden biri kötü bir haber getirdiğinde tepkiniz nasıl olur?',
    ],
  },

  'stresle_basa_cikma': {
    key: 'stresle_basa_cikma',
    title: 'Stresle Başa Çıkma',
    bands: [
      {
        min: 0,
        max: 50,
        label: 'low',
        anchors: [
          'Baskı ve stres anlarını zorlanmadan yönetmek',
          'Olayları fazla büyütmeden olduğu gibi görebilmek',
          'Stres altında kontrol edebileceklerine odaklanmak',
          'Herşeyi yapmaya çabalamaktan kaçınmak',
          'Alternatifleri değerlendirmekten karar vermeye geçebilmek',
        ],
      },
      {
        min: 51,
        max: 100,
        label: 'high',
        anchors: [
          'Kriz olabilecek durumları çabuk farketmek',
          'Baskı ve stresi yönetebilmek',
          'Stresli durumlarda önlem almaya odaklanmak',
          'Zorlu ve stresli durumlarda soğukkanlı kalmak',
          'Stresli durumlarda gereksiz risklerden kaçınmak',
          'Belirsizlikleri kolay yönetmek',
          'Kriz durumuna odaklanmak yerine sorunu çözmeye odaklanmak',
          'Çevresindeki kişilerden destek alabilmek',
        ],
      },
    ],
    genericProbes: [
      'Son zamanlarda yaşadığınız yüksek stresli bir durumu anlatır mısınız?',
      'Birden fazla kriz aynı anda olduğunda nasıl önceliklendirirsiniz?',
    ],
  },

  'ozguven': {
    key: 'ozguven',
    title: 'Özgüven',
    bands: [
      {
        min: 0,
        max: 50,
        label: 'low',
        anchors: [
          'Geribildirimleri ve eleştirileri kişiselleştirmeden kabul etmek',
          'Hata yapma kaygısıyla kararı ertelemekten kaçınmak',
          'Başarıları görmek ve kendisini takdir etmek',
        ],
      },
      {
        min: 51,
        max: 100,
        label: 'high',
        anchors: [
          'Kendine güvenmek',
          'Eleştiriye ve geribildirimlere açık olmak',
          'Kendisinin güçlü ve gelişim alanlarını fark etmek',
          'Karar almak ve aldığı kararın arkasında durmak',
          'Hata yapmaktan kaçınmamak, deneyim olarak görmek',
          'Zorlu görevlerin üstesinden gelebileceğine inanmak',
        ],
      },
    ],
    genericProbes: [
      'Kesin olmadığınız bir konuda karar almanız gerektiğinde ne yaparsınız?',
      'Bir hata yaptığınızda bunu nasıl değerlendirirsiniz?',
    ],
  },

  'risk_duyarlilik': {
    key: 'risk_duyarlilik',
    title: 'Risk Duyarlılık',
    bands: [
      {
        min: 0,
        max: 50,
        label: 'low',
        anchors: [
          'Riskleri farketmek',
          'Tedbirli davranmak',
          '"Bana birşey olmaz, hallederiz" bakış açısıyla düşünmemek',
          'Analize, bilgiye dayalı değerlendirme yapmak',
        ],
      },
      {
        min: 51,
        max: 100,
        label: 'high',
        anchors: [
          'Titiz ve mükemmeliyetçi olmak',
          'Ayrıntılı sorgulama yapmak',
          'Kendisine verilen geribildirimleri dikkate almak',
          'Risk olabilecek durumları önceden fark etmek',
          'Anlık ve dürtüsel hareketlerden kaçınmak',
          'Olası riskler karşısında alternatif planlar oluşturmak',
        ],
      },
    ],
    genericProbes: [
      'Yeni bir proje başlatmadan önce nasıl bir hazırlık yaparsınız?',
      'Hızlı karar almanız gereken bir durumda neye dikkat edersiniz?',
    ],
  },

  'kontrolculuk': {
    key: 'kontrolculuk',
    title: 'Kontrolcülük',
    bands: [
      {
        min: 0,
        max: 50,
        label: 'low',
        anchors: [
          'Yapılan plana uyum sağlamak',
          'Delege ettiği işi takip etmek',
          'Düzenli ve kontrollü iş yapmak',
          'Zamanı etkin yönetmek',
        ],
      },
      {
        min: 51,
        max: 100,
        label: 'high',
        anchors: [
          'Kaliteli ve yüksek standartta iş yapmaya dikkat etmek',
          'Takip ve kontrole önem vermek',
          'Düzenli ve kontrollü iş yapmak',
          'Kontrol gerektiren işleri üstlenmek',
          'Hatasız iş yapmaya dikkat etmek',
        ],
      },
    ],
    genericProbes: [
      'Bir işi delege ettikten sonra nasıl takip edersiniz?',
      'Projelerde detay seviyeniz nasıldır?',
    ],
  },

  'kural_uyumu': {
    key: 'kural_uyumu',
    title: 'Kural Uyumu',
    bands: [
      {
        min: 0,
        max: 50,
        label: 'low',
        anchors: [
          'Kurallara ve detaylara dikkat etmek',
          'Zorlanmadan dikkatli ve özenli iş yapmak',
          'Sıkılmadan tekrarlı ve ayrıntılı işleri ele alabilmek',
          'Kuralları gözardı etmeden sonuca gidebilmek',
        ],
      },
      {
        min: 51,
        max: 100,
        label: 'high',
        anchors: [
          'Tam olarak kuralına ve beklentiye uygun iş yapmak',
          'Güvenilir algılanmak',
          'Süreç ve sistem odaklı olmak',
          'Şirket kurallarına, prosedürlerine uymak',
        ],
      },
    ],
    genericProbes: [
      'Kurallar ve hız arasında seçim yapmanız gerektiğinde ne yaparsınız?',
      'Belirsiz bir durumda nasıl ilerlersiniz?',
    ],
  },

  'one_cikmayi_seven': {
    key: 'one_cikmayi_seven',
    title: 'Öne Çıkmayı Seven',
    bands: [
      {
        min: 0,
        max: 50,
        label: 'low',
        anchors: [
          'Öne çıkmak ve kendini ifade etmek',
          'Yaptığı işlerde/projelerde başarısını konuşmak',
          'Kendisine fırsat verilmesini beklemeden alan yaratmak, düşüncesini söylemek',
          'Gerekli durumlarda zorlu görevlerin sorumluluğunu alabilmek',
        ],
      },
      {
        min: 51,
        max: 100,
        label: 'high',
        anchors: [
          'Öne çıkma isteğini yansıtmak',
          'Her durumda konuşmak, kendini göstermeyi istemek',
          'Sunum yapmaktan, düşüncesini aktarmaktan kaçınmamak',
          'Bilmediği ortamlarda rahat davranmak',
          'Zorlanmadan ilişki başlatabilmek',
        ],
      },
    ],
    genericProbes: [
      'Toplantılarda kendinizi nasıl konumlandırırsınız?',
      'Yeni bir ortamda kendinizi nasıl tanıtırsınız?',
    ],
  },

  'sosyallik': {
    key: 'sosyallik',
    title: 'Sosyallik',
    bands: [
      {
        min: 0,
        max: 50,
        label: 'low',
        anchors: [
          'Kendi başına çalışmayı tercih etmek',
          'Seçerek ve amaca yönelik ilişki kurmak',
          'İşle ilişki kurmayı dengede tutmak',
          'Zorlanmadan ilişki başlatabilmek',
          'Etkin dinlemek',
          'Kendi tanıdığı çevrenin dışındaki kişilerle de ilişki kurabilmek',
          'Enerjisini, isteğini göstermek',
        ],
      },
      {
        min: 51,
        max: 100,
        label: 'high',
        anchors: [
          'Geniş bir çevreye sahip olmak',
          'Birbirinden farklı insanlarla kolay ilişki kurmak',
          'Konuşkan, enerjik görünmek',
          'Hızlı iletişim gerektiren/ilk adım atılması gereken durumlarda rahatlıkla harekete geçebilmek',
        ],
      },
    ],
    genericProbes: [
      'İş dışı sosyal etkinliklere katılmayı nasıl bulursunuz?',
      'Geniş bir ekip ile mi yoksa küçük bir grupla mı çalışmayı tercih edersiniz?',
    ],
  },

  'basari_yonelimi': {
    key: 'basari_yonelimi',
    title: 'Başarı Yönelimi',
    bands: [
      {
        min: 0,
        max: 50,
        label: 'low',
        anchors: [
          'İyi yaptığını bildiği ve emin olduğu işleri yapmak',
          'Başkalarının verdiği kararlara kolaylıkla uymak',
          'Yersiz rekabetten kaçınmak',
          'İyi bir ekip oyuncusu olmayı istemek',
          'Zorlu hedefleri ele almaya istekli olmak',
          'Enerjisiz ve isteksiz görünmeden iş yapmak',
          'Zorluklar karşısında geriye çekilmeden, kolay vazgeçmeden hareket edebilmek',
          'Geri planda kalmadan rekabet gerektiren ortamlarda bulunmak',
          'Zorlayıcı hedefler ile başa çıkmak için çabalamak',
          'Yeni görevler için yönlendirilmeyi beklemeden harekete geçmek',
        ],
      },
      {
        min: 51,
        max: 100,
        label: 'high',
        anchors: [
          'Zorlu işler/projelerde inisiyatif almak',
          'Karar verici olmayı ve yönetmeyi istemek',
          'Rekabeti sevmek',
          'Hedef ve sonuç odaklı olmak',
        ],
      },
    ],
    genericProbes: [
      'Kariyer hedefleriniz nelerdir ve bunlara nasıl ulaşmayı planlıyorsunuz?',
      'Rekabetin olduğu bir ortamda kendinizi nasıl hissedersiniz?',
    ],
  },

  'iliski_yonetimi': {
    key: 'iliski_yonetimi',
    title: 'İlişki Yönetimi',
    bands: [
      {
        min: 0,
        max: 50,
        label: 'low',
        anchors: [
          'Konuşulması gereken konuyu önceliklendirmek',
          'Önce işin ele alınmasını sağlamak',
          'İş ve ilişki arasında ayrım yapmak',
          'Geniş bir çevre yerine, mevcut ilişkilerini sürdürmeye dikkat etmek',
          'İşi önceliklendirirken ilişkiyi de gözden kaçırmadan ilerlemek',
          'Tartışma gerektiren durumlarda aktif dinlemek, karşı tarafı anlamak',
          'Sadece ihtiyaç duyduğunda değil, sosyal ortamlarda ilişki kurmaya önem vermek',
          'Karşı tarafı anlamaya odaklanmak, beden diline dikkat etmek',
        ],
      },
      {
        min: 51,
        max: 100,
        label: 'high',
        anchors: [
          'Diğerlerinin ihtiyaçlarını fark etmek ve insanları memnun etmek için çabalamak',
          'Tartışma durumlarında çözüm bulmaya önem vermek',
          'Çevresindeki kişilerle bağ kurmaya önem vermek',
          'Sorunları çözerken sadece sonuca değil, ilişkiyi de korumaya dikkat etmek',
        ],
      },
    ],
    genericProbes: [
      'Bir çatışma yaşadığınızda çözüm süreciniz nasıldır?',
      'İş ilişkilerini nasıl yönetirsiniz?',
    ],
  },

  'iyi_gecinme': {
    key: 'iyi_gecinme',
    title: 'İyi Geçinme',
    bands: [
      {
        min: 0,
        max: 50,
        label: 'low',
        anchors: [
          'Müzakere edebilmek',
          'Ortak kararlara katılmadığı durumları konuşmak',
          'Başkalarına yardım ederken kendi önceliklerini ertelememek',
          'Fikir ayrılıklarının doğal bir süreç olduğunu kabullenmek',
          'Beklentisini net bir biçimde söylemek ve işi delege edebilmek',
          'Farklı görüşlere açık olmak ve ikna olabilmek',
          'Kendi haklılığını ispat etme çabasından kaçınmak, karşı tarafın duygusunu/düşüncesini anlamak',
          'İletişim dilinde yargılamadan, suçlamadan kaçınmak',
          'Hataları görmek yerine iyi giden konuları da konuşmak',
        ],
      },
      {
        min: 51,
        max: 100,
        label: 'high',
        anchors: [
          'Kurduğu ilişkilerin uzun süreli olmasına önem vermek',
          'İşbirliğine açık olmak',
          'Ekip kararlarına kolay uyum sağlamak, destek vermek',
          'Çevresindeki kişilere önyargısız yaklaşmak, güven duymak',
          'Sıcak ve sevilen kişi olmak',
        ],
      },
    ],
    genericProbes: [
      'Ekiple aynı fikirde olmadığınızda nasıl davranırsınız?',
      'Uzun vadeli iş ilişkilerinizi nasıl sürdürürsünüz?',
    ],
  },

  'kacinma': {
    key: 'kacinma',
    title: 'Kaçınma',
    bands: [
      {
        min: 0,
        max: 50,
        label: 'low',
        anchors: [
          'Sorun davranışı net konuşmak',
          'Dolaylı konuşmak, ima etmek yerine açık konuşmak',
          'Karşıt görüşünü rahatlıkla ifade edebilmek',
        ],
      },
      {
        min: 51,
        max: 100,
        label: 'high',
        anchors: [
          'Sorun çıktığında müdahale etmeyi tercih etmek',
          'Kaçınmadan çatışma gerektiren durumları yönetmek',
          'Düşüncesini savunmak ve ikna etmek için çabalamak',
          'Hatayı konuşabilmek',
          'Karşı tarafı sorgulanmaktan kaçınmamak',
          'Düşüncesini net, doğrudan ifade etmek',
          'Zorlayıcı durumlardan ne olması gerektiğini konuşmak',
          'Açık ve net geribildirim vermek',
          'İşin yapılması için beklentisini tanımlamak',
          'Gereksiz çatışmalardan kaçınmak, uyumlu olmayı tercih etmek',
          'Beklentisini ifade ederken karşı tarafın durumuna uygun ilerlemek',
          'Çatışma gerektiren durumlarda çözüm için sorumluluk almak',
        ],
      },
    ],
    genericProbes: [
      'Zor bir konuşma yapmanız gerektiğinde nasıl hazırlanırsınız?',
      'Performans sorunu olan biriyle nasıl konuşursunuz?',
    ],
  },

  'yenilikcilik': {
    key: 'yenilikcilik',
    title: 'Yenilikçilik',
    bands: [
      {
        min: 0,
        max: 50,
        label: 'low',
        anchors: [
          'Rutin işleri sıkılmadan yapmak',
          'Sorunları pratik çözmek',
          'Bildiği ve emin olduğu yolları tercih etmek',
          'Başkalarının ürettiği çözümleri kolay sahiplenmek',
          'Konfor alanının dışına çıkmaya istekli olmak',
          'Farklı alternatifleri/yenilikleri uygulamaya açık olmak',
          'Sorunlar karşısında kendi bildiği çözümün dışına çıkabilmek',
          'İhtiyacın dışındaki farklı fikirleri değerlendirmeye açık olmak',
          'Durumlara geniş bakış açısıyla yaklaşabilmek',
          'Farklı fikirlerin uygulanabilirliğini hesaba katmak',
          'Fayda-maliyete dikkate alarak iş yapmak',
          'Rutin ve durağan ortamlardan/işlerden çabuk sıkılmadan yürütebilmek',
          'Problemleri karmaşık hale getirmeden yeterli düzeyde analiz edebilmek',
          'Farklı fikirleri değerlendirirken kontrol noktaları belirlemek',
          'Yeni fikirler üretirken gerekli nokta durup, odaklanıp netleşebilmek',
          'Az bilgiye sahip olduğunda hareket edebilmek',
        ],
      },
      {
        min: 51,
        max: 100,
        label: 'high',
        anchors: [
          'Kolay ve hızlı harekete geçebilmek',
          'Yeni fikirlerin uygulanabilirliğine odaklanmak',
          'Analizden eyleme geçebilmek',
          'Fırsatları görmek ve denemekten kaçınmamak',
          'Sorun karşısında esnek olmak ve alternatif çözüm bulabilmek',
          'Plansızlık karşısında rahat olmak',
          'Herşeyi kontrol edemeyeceklerini düşünüp kaygıyı yönetmek ve sakin kalmak',
          'Yeni fikirlerin denenmesi için cesaretli olmak',
          'Belirsiz durumlarda çalışmak',
          'Esnek ve değişime açık görünmek',
          'Sonuç odaklı davranmak',
          'Kuralların olmadığı durumları normal görmek ve hızla uyum sağlamak',
          'Farklı deneyimlere açık olmak',
          'Büyük resmi görmek',
          'Yeni fırsatları/seçenekleri değerlendirmek istemek',
          'Farklı ve heyecanlı ortamlarda olmayı istemek',
        ],
      },
    ],
    genericProbes: [
      'Yeni bir yaklaşım denemek ile kanıtlanmış bir yöntemi kullanmak arasında nasıl seçim yaparsınız?',
      'Son zamanlarda denediğiniz yeni bir iş yöntemi var mı?',
    ],
  },

  'ogrenme_yonelimi': {
    key: 'ogrenme_yonelimi',
    title: 'Öğrenme Yönelimi',
    bands: [
      {
        min: 0,
        max: 50,
        label: 'low',
        anchors: [
          'İlgi alanlarına yönelik kendini geliştirmek ve araştırmak',
          'Tecrübesini kullanmayı tercih etmek',
          'Amaca yönelik bilgiyi öğrenmeyi tercih etmek',
          'Öğrendiklerini pratik olarak uygulamaya almak',
          'Uygulayarak/sorarak öğrenmeyi tercih etmek',
          'Gereksiz risklerden, zaman kaybından kaçınmak',
          'Öğrenmeye araştırmaya ihtiyaç duymak',
          'Kişisel eğitim fırsatlarını kullanmak',
          'Sınırlı bir bakış açısına sahip olmak yerine geniş/farklı bir bakış açısına sahip olabilmek',
          'Hızlı karar alınması gereken anlarda tecrübeye yönelmeden, kararını verilerle/yeni bilgilerle destekleyebilmek',
          'Tecrübesinin yanında araştırma/analiz yaparak çözüm üretmek',
          'Sorarak iş yapmak yerine bilgiyi araştırmak',
          'Sadece kendi fikrinin iyi sonuç verdiği düşüncesinden çıkmak, farklı çözümleri denemek',
          'Rutin işlerde "farklı, kısa yolu" olup olmadığını araştırmak',
        ],
      },
      {
        min: 51,
        max: 100,
        label: 'high',
        anchors: [
          'Bir işe başlamadan önce detaylı bir hazırlık yapmak',
          'Eğitim/gelişimden keyif almak, önem vermek',
          'Bilge görünmek',
          'Kendi gelişimine ve birlikte çalıştığı kişilerin eğitimine önem vermek',
          'Ayrınıtılı analiz yapmak, veriyle konuşmak',
        ],
      },
    ],
    genericProbes: [
      'Yeni bir beceri öğrenme konusunda kendinizi nasıl motive edersiniz?',
      'Son 6 ayda kendinizi geliştirmek için ne yaptınız?',
    ],
  },

  'merak': {
    key: 'merak',
    title: 'Merak',
    bands: [
      {
        min: 0,
        max: 50,
        label: 'low',
        anchors: [
          'Başarılı olduğu yöntemleri tercih etmek',
          'Yeni fikri denemeden önce olasılıkları öğrenmeye çalışmak',
          'Ayrıntılı bilgilerin içinde odağını koruyabilmek',
          'Her şeyi biliyor gibi gözükmeden bilgi paylaşabilmek',
          'Kendi öğrenme ihtiyacıyla başkalarının öğrenme ihtiyacı arasında denge kurmak',
          'Gereksiz detaylar vermeden özet anlatımlar yapabilmek',
          'Eldeki bilgileri toparlayıp odağını belirleyebilmek',
          'Herşeyi öğrenme ihtiyacıyla bir konuda uzmanlaşmayı zorlaştırmak',
          'Ele aldığı bir projeyi/işi fikir değiştirmeden sonuçlandırmak',
          'Sunduğu fikirlerin kaynaklar açısından uygulanabilirliğine dikkat etmek',
        ],
      },
      {
        min: 51,
        max: 100,
        label: 'high',
        anchors: [
          'Farklı konularda öğrenmeyi ve araştırmayı sevmek',
          'İş ve teknoloji dünyasındaki en son gelişmeleri takip etmek',
          'Değişen koşullara hızla uyum sağlamak',
          'Bildiğinin dışına çıkıp kendini güncellemek',
        ],
      },
    ],
    genericProbes: [
      'Kendi alanınız dışındaki konulara ne kadar ilgi duyuyorsunuz?',
      'Yeni trendleri ve gelişmeleri nasıl takip ediyorsunuz?',
    ],
  },
};
