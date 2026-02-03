import { NextRequest, NextResponse } from 'next/server';
import { aiCoach, CoachingState } from '@/lib/services/aiCoach';
import { responseValidator } from '@/lib/services/responseValidator';
import { CoachAttitude, DEFAULT_ATTITUDE } from '@/lib/context/CoachingContext';

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
