import { NextRequest, NextResponse } from 'next/server';
import { aiCoach, CoachingState } from '@/lib/services/aiCoach';
import { responseValidator } from '@/lib/services/responseValidator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, state } = body as { message: string; state: CoachingState };

    if (!message || !state) {
      return NextResponse.json(
        { error: 'Message and state are required' },
        { status: 400 }
      );
    }

    // Generate AI response
    const { response, updatedState } = await aiCoach.generateResponse(state, message);

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

    // Check for stage transitions
    const stageTransitionMatch = response.match(/STAGE_TRANSITION:(\d+)/);
    if (stageTransitionMatch) {
      const newStage = parseInt(stageTransitionMatch[1]);
      updatedState.stage = newStage as CoachingState['stage'];
    }

    // Clean up markers from response
    const cleanResponse = response
      .replace(/STAGE_TRANSITION:\d+/, '')
      .trim();

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
