# 5D Kişilik Koçluk Simülatörü - MVP Demo

Kurumsal liderlik koçluğu için interaktif 5D kişilik değerlendirme simülatörü.

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js >=20.9.0 (şu anda 18.20.8 kullanıyorsunuz)
- npm veya yarn

### Node.js Güncelleme

```bash
# nvm kullanıyorsanız:
nvm install 20
nvm use 20

# Homebrew ile (MacOS):
brew install node@20
brew link node@20

# Veya nodejs.org'dan indirin
```

### Kurulum ve Çalıştırma

```bash
cd coaching-app
npm install  # Gerekirse tekrar çalıştırın
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılacaktır.

## 📋 Demo Akışı

### Aşama 1: Hoş Geldiniz
- İsminizi girin ve başlatın

### Aşama 2: Kişilik Puanları (15 boyut)
Test verisi olarak şu puanları kullanabilirsiniz:

**Duygusal Denge:**
- Duygu Kontrolü: 75
- Stresle Başa Çıkma: 85
- Özgüven: 65

**Dikkat ve Düzen:**
- Risk Duyarlılık: 80
- Kontrolcülük: 70
- Kural Uyumu: 60

**Dışadönüklük:**
- Öne Çıkmayı Seven: 45
- Sosyallik: 40
- Başarı Yönelimi: 75

**Dengeli İlişki:**
- İlişki Yönetimi: 70
- İyi Geçinme: 65
- Kaçınma: 55

**Deneyime Açıklık:**
- Yenilikçilik: 30
- Öğrenme Yönelimi: 85
- Merak: 40

### Aşama 3: Güçlü Özellikler
- Sistem otomatik olarak 8-10 güçlü özellik gösterir
- Hem yüksek hem düşük puanların güçleri

### Aşama 4: Gelişim Alanları
- Uç puanlar için gelişim önerileri
- 8-10 gelişim fırsatı

### Aşama 5: Eylem Önerileri
- Pratik gelişim önerileri

### Aşama 6: Özet ve Tamamlama
- Oturum özeti
- Sonraki adımlar

## 🎯 Demo Hedefleri

Bu MVP'nin amacı eğitim firmasına göstermek için:

1. **İş Akışı**: 6 aşamalı ko çluk süreci
2. **Puanlama Sistemi**: 5D (Big Five) modeli
3. **Otomatik Analiz**: Güçlü ve gelişim alanları belirleme
4. **Türkçe İçerik**: Tam Türkçe arayüz ve öneriler
5. **Mobil Responsive**: Temiz, profesyonel tasarım

## 📁 Proje Yapısı

```
coaching-app/
├── app/
│   ├── layout.tsx          # Root layout (CoachingProvider)
│   └── page.tsx             # Ana sayfa (stage routing)
├── components/
│   └── coaching/
│       ├── Stage1Welcome.tsx
│       ├── Stage2Scores.tsx
│       ├── Stage3Strengths.tsx
│       ├── Stage4Development.tsx
│       ├── Stage5Actions.tsx
│       └── Stage6Summary.tsx
├── lib/
│   ├── context/
│   │   └── CoachingContext.tsx  # React Context (state management)
│   ├── data/
│   │   └── strengths.ts         # Güçlü özellikler verisi (PDF'den)
│   └── utils/
│       └── scoring.ts           # Analiz algoritması
└── types/
    └── coaching.ts              # TypeScript tipleri
```

## 🔗 Sonraki Adımlar (.NET Entegrasyonu)

1. **JWT Authentication**: .NET app'ten token ile giriş
2. **API Integration**: Sonuçları .NET'e POST
3. **Design Matching**: Mebasoft web app tasarımına uyum
4. **Vercel Deploy**: Production ortamı

## 📝 Notlar

- Bu bir MVP demosu - tam özelliklerin %30'u
- Veritabanı yok (in-memory state)
- Authentication yok
- PDF export yok
- "Ne Yapması Gerek" detaylı önerileri henüz eklenmedi

## 🐛 Bilinen Sorunlar

- Node 18 çalışmıyor (>=20 gerekli)
- Sayfa yenileme state'i sıfırlar
- Browser back button desteklenmedi

## 💡 Test Senaryosu

1. İsim gir: "Ahmet Yılmaz"
2. Yukarıdaki test puanlarını gir
3. Her aşamayı adım adım takip et
4. Güçlü ve gelişim önerilerin mantıklı olduğunu kontrol et
5. Son aşamada "Tamamla" butonuna tıkla

**Beklenen Süre:** 5-7 dakika
