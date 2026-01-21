import { NextRequest, NextResponse } from 'next/server';
import { aiCoach, CoachingState } from '@/lib/services/aiCoach';

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
