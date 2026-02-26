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
// Manuel puan değiştirme kontrolü
if ((state.stage === 3 || state.stage === 4)) {
  const wantsToEdit = /değiştir|degistir|düzelt|duzelt|yanlış|yanlis|hayır|hayir/i.test(message);
  
  if (wantsToEdit) {
    state.stage = 2;
    
    return NextResponse.json({
      response: "Tamam! Seni puanları girdiğin sayfaya geri gönderiyorum. Puanlarını düzelt ve 'Devam Et' butonuna bas.",
      state: state
    });
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
