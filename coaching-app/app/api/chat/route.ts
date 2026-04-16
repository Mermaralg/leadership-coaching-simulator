import { NextRequest, NextResponse } from 'next/server';
import { aiCoach, CoachingState } from '@/lib/services/aiCoach';
import { responseValidator } from '@/lib/services/responseValidator';
import { CoachAttitude, DEFAULT_ATTITUDE } from '@/lib/context/CoachingContext';
import {
  shouldTransitionStage,
  extractAITransitionHint,
  cleanAIResponse,
} from '@/lib/services/stageManager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, state, attitude } = body as {
      message: string;
      state: CoachingState;
      attitude?: CoachAttitude;
    };

    if (!message || !state) {
      return NextResponse.json(
        { error: 'Message and state are required' },
        { status: 400 }
      );
    }
// Initial message guard - Stage init mesajları geçiş mantığından muaf!
// 'Basla' veya '__STAGE_INIT__' geldiyse sadece AI'ı çalıştır, geçiş yapma.
const isInitialMessage = message === '__STAGE_INIT__' || message === 'Basla';

if (isInitialMessage) {
  const coachAttitude = attitude || DEFAULT_ATTITUDE;
  const { response, updatedState } = await aiCoach.generateResponse(
    state,
    'Başla',
    coachAttitude
  );
  // Stage'i ASLA değiştirme - initial mesaj sadece içerik üretir
  updatedState.stage = state.stage;
  const cleanResponse = cleanAIResponse(response);
  return NextResponse.json({ response: cleanResponse, state: updatedState });
}

// Manuel puan değiştirme kontrolü
if ((state.stage === 3 || state.stage === 4)) {
  // 'hayır' kaldırıldı - çok geniş eşleşiyor, normal konuşmada da tetikleniyor
const wantsToEdit = /^değiştir$/i.test(message.trim());
  if (wantsToEdit) {
    state.stage = 2;
    
    return NextResponse.json({
      response: "Tamam! Seni puanları girdiğin sayfaya geri gönderiyorum. Puanlarını düzelt ve 'Devam Et' butonuna bas.",
      state: state
    });
  }
}
    // Stage 3 geçiş kontrolü - Kullanıcı onayı zorunlu
if (state.stage === 3) {
  const isInitMsg = message === '__STAGE_INIT__' || message === 'Basla';
  // 'değiştir' burada geçiş engellemeli — puan düzeltme isteği
  const isPuanEdit = /^değiştir$|puanlar.*değiştir|puanlar.*düzelt|puanlar.*yanlış/i.test(message.trim());
  const userWantsTransition = !isInitMsg && !isPuanEdit && /\bevet\b|\btamam\b|\bgeçelim\b|\bgecelim\b|\bolur\b|\bhaydi\b/i.test(message.toLowerCase());
  
  // Kullanıcı açıkça "evet" demeden Stage 4'e geçmeyi ENGELLE
  if (!userWantsTransition) {
    state.stage = 3; // Force Stage 3
  }
}
    // Use provided attitude or default
    const coachAttitude = attitude || DEFAULT_ATTITUDE;

    // Generate AI response with attitude settings
    const { response, updatedState } = await aiCoach.generateResponse(
      state,
      message,
      coachAttitude
    );

    // AI Stage 3'ten 4'e geçtiyse VE kullanıcı onay vermemişse, geri al!
if (state.stage === 3 && updatedState.stage === 4) {
  const userWantsTransition = /\bevet\b|\btamam\b|\bgeçelim\b|\bgecelim\b|\bolur\b|\bhaydi\b/i.test(message.toLowerCase());

  if (!userWantsTransition) {
    console.log('⚠️ AI Stage 4e gecti ama kullanici onay vermedi - geri aliyoruz!');
    updatedState.stage = 3;
  }
}

// AI Stage 4'ten 5'e geçtiyse VE kullanıcı en az 2 gelişim alanı seçmemişse, geri al!
if (state.stage === 4 && updatedState.stage === 5) {
  const DEVELOPMENT_AREA_PATTERNS = [
    /duygu\s*kontrol/i, /stres/i, /ozguven/i, /özgüven/i,
    /risk/i, /kontrolculuk/i, /kontrolcülük/i, /kural/i,
    /one\s*c[ıi]kma/i, /öne\s*çıkma/i, /sosyal/i, /basari/i, /başarı/i,
    /iliski/i, /ilişki/i, /iyi\s*gecinme/i, /iyi\s*geçinme/i,
    /kac[ıi]nma/i, /kaçınma/i, /yenilik/i, /ogrenme/i, /öğrenme/i, /merak/i,
    /motivasyon/i, /karars[ıi]z/i, /yüzleş/i, /yuzles/i, /kaygı/i, /kaygi/i,
  ];
  const mentionedAreaCount = DEVELOPMENT_AREA_PATTERNS.filter(p => p.test(message)).length;

  if (mentionedAreaCount < 2) {
    console.log('⚠️ AI Stage 5e gecti ama kullanici 2 alan secmedi - geri aliyoruz!');
    updatedState.stage = 4;
  }
}
// Stage 5→6 geçiş guard: İkinci gelişim alanı koçlanmadan geçişe izin verme
if (state.stage === 5 && updatedState.stage === 6) {
  const developmentAreas = state.developmentAreas || [];
  const secondArea = developmentAreas[1];
  const messageCount = (state.conversationHistory || []).filter(m => m.role === 'user').length;

  if (secondArea && messageCount < 8) {
    // 8 mesajdan önce kesinlikle geçme — ikinci alan için yeterli konuşma olmamıştır
    console.log(`⚠️ Stage 6'ya geçiş engellendi — yeterli mesaj yok (${messageCount}/8)`);
    updatedState.stage = 5;
  } else if (secondArea) {
    // Son 10 mesajda ikinci alanın adı geçiyor mu kontrol et
    const recentMessages = (state.conversationHistory || [])
      .slice(-10)
      .map(m => m.content.toLowerCase())
      .join(' ');

    const areaKeywords: Record<string, RegExp[]> = {
      duygu_kontrolu: [/duygu\s*kontrol/i, /duyguyu/i, /kaygı/i],
      stresle_basa_cikma: [/stres/i],
      ozguven: [/özgüven/i, /ozguven/i, /kendine\s*güven/i, /karars/i],
      risk_duyarlilik: [/risk/i],
      kontrolculuk: [/kontrolc/i, /planlama/i, /zaman\s*yönet/i, /organize/i],
      kural_uyumu: [/kural/i, /detay/i],
      one_cikmayi_seven: [/öne\s*çık/i, /görünür/i],
      sosyallik: [/sosyal/i],
      basari_yonelimi: [/başarı/i, /motivasyon/i, /hedef/i, /inisiyatif/i],
      iliski_yonetimi: [/ilişki\s*yönet/i],
      iyi_gecinme: [/iyi\s*geçin/i, /müzakere/i, /uzlaşma/i],
      kacinma: [/kaçınma/i, /yüzleş/i, /çatışma/i, /net\s*ifade/i],
      yenilikcilik: [/yenilik/i, /yaratıcı/i],
      ogrenme_yonelimi: [/öğrenme/i],
      merak: [/merak/i],
    };

    const secondAreaPatterns = areaKeywords[secondArea] || [];
    const secondAreaMentioned = secondAreaPatterns.some(p => p.test(recentMessages));

    if (!secondAreaMentioned) {
      console.log(`⚠️ Stage 6'ya geçiş engellendi — ikinci alan (${secondArea}) henüz konuşulmadı`);
      updatedState.stage = 5;
    }
  }
}

    // Validate response
    let validationResult;
    if (state.scores) {
      switch (state.stage) {
        case 3:
          validationResult = responseValidator.validateStage3Response(response, state.scores);
          break;
        case 4:
          validationResult = responseValidator.validateStage4Response(response, state.scores);
          break;
        case 5:
          validationResult = responseValidator.validateStage5Response(response);
          break;
        case 6:
          validationResult = responseValidator.validateStage6Response(response);
          break;
      }
    }

    if (validationResult && !validationResult.valid) {
      console.error('Response validation failed:', validationResult.errors);
    }
    if (validationResult && validationResult.warnings.length > 0) {
      console.warn('Response validation warnings:', validationResult.warnings);
    }

    // CODE-DRIVEN STAGE TRANSITIONS (primary mechanism)
    // Use deterministic logic to decide when to transition stages
    const transitionResult = shouldTransitionStage(
      updatedState,
      message,
      response
    );

    // Capture previous stage before any transition
    const previousStage = updatedState.stage;

    if (transitionResult.shouldTransition && transitionResult.nextStage) {
      console.log(`Stage transition: ${updatedState.stage} → ${transitionResult.nextStage} (${transitionResult.reason})`);
      updatedState.stage = transitionResult.nextStage;
    } else {
      // FALLBACK: Check for AI's transition hint (secondary mechanism)
      // Only use if code-driven logic didn't trigger a transition
      const aiHint = extractAITransitionHint(response);
      if (aiHint && aiHint > updatedState.stage && aiHint <= 6) {
        console.log(`Stage transition via AI hint: ${updatedState.stage} → ${aiHint}`);
        updatedState.stage = aiHint as CoachingState['stage'];
      }
    }

    // ======================================================
    // KRİTİK FIX: Stage 4 → 5 geçişinde AI cevabını override et
    // Sorun: "tamam" mesajına Stage 5 AI doküman dışı eylem planı üretiyor,
    // sonra __STAGE_INIT__ ile doğru liste de geliyor — çifte içerik oluşuyor.
    // Çözüm: 4→5 geçişini sabit mesajla override et, içerik __STAGE_INIT__'e bırak.
    // ======================================================
    if (previousStage === 4 && updatedState.stage === 5) {
      const participantName = updatedState.participantName || '';
      const fixedTransitionResponse = `Harika ${participantName}! Şimdi eylem planı aşamasına geçiyoruz.`;

      const history = updatedState.conversationHistory;
      if (history.length > 0 && history[history.length - 1].role === 'assistant') {
        history[history.length - 1].content = fixedTransitionResponse;
      }

      console.log('✅ Stage 4→5 geçiş mesajı override edildi');

      return NextResponse.json({
        response: fixedTransitionResponse,
        state: updatedState,
      });
    }

    // ======================================================
    // KRİTİK FIX: Stage 3 → 4 geçişinde AI cevabını override et
    // Sorun: Stage 3 AI "geçiyoruz" derken AYRICA gelişim alanlarını
    // listeliyordu (yanlış). Stage 4 initial message zaten doğru
    // gelişim alanlarını gönderiyor — ikinci liste gereksiz ve hatalı.
    // Çözüm: 3→4 geçişi tespit edilince AI cevabını sabit mesajla değiştir.
    // ======================================================
    if (previousStage === 3 && updatedState.stage === 4) {
      const participantName = updatedState.participantName || '';
      const fixedTransitionResponse = `Harika ${participantName}! Güçlü yanlarını konuştuk. Şimdi gelişim alanlarına geçiyoruz.`;
      
      // conversationHistory'deki son assistant mesajını da güncelle
      const history = updatedState.conversationHistory;
      if (history.length > 0 && history[history.length - 1].role === 'assistant') {
        history[history.length - 1].content = fixedTransitionResponse;
      }

      console.log('✅ Stage 3→4 geçiş mesajı override edildi (gelişim alanları temizlendi)');

      return NextResponse.json({
        response: fixedTransitionResponse,
        state: updatedState,
      });
    }

    // Clean up markers from response
    const cleanResponse = cleanAIResponse(response);

    return NextResponse.json({
      response: cleanResponse,
      state: updatedState,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
