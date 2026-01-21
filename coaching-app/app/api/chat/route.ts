import { NextRequest, NextResponse } from 'next/server';
import { aiCoach, CoachingState } from '@/lib/services/aiCoach';
import { parseScoreProposal } from '@/lib/scoring/scoreInference';
import { SubDimension } from '@/types/coaching';

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

    // Try to detect score proposals in Stage 2
    let scoreProposal = null;
    if (updatedState.stage === 2) {
      // Look for score proposal markers in the response
      const scoreMarkerMatch = response.match(/SCORE_PROPOSAL:(\w+):(\d+):(low|medium|high):([\s\S]+)/);
      
      if (scoreMarkerMatch) {
        const [, dimension, score, confidence, reasoning] = scoreMarkerMatch;
        try {
          scoreProposal = {
            dimension: dimension as SubDimension,
            proposedScore: parseInt(score),
            confidence: confidence as 'low' | 'medium' | 'high',
            reasoning: reasoning.trim(),
            behavioralEvidence: [],
          };
        } catch (err) {
          console.error('Failed to parse score proposal:', err);
        }
      }
    }

    // Clean up markers from response
    let cleanResponse = response;
    cleanResponse = cleanResponse.replace(/STAGE_TRANSITION:\d+/, '').trim();
    if (scoreProposal) {
      cleanResponse = cleanResponse.replace(/SCORE_PROPOSAL:[\s\S]+/, '').trim();
    }

    return NextResponse.json({
      response: cleanResponse,
      state: updatedState,
      scoreProposal,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
