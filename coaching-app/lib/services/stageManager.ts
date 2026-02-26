/**
 * Code-driven stage transition manager for the coaching flow.
 * 
 * This replaces the fragile AI-driven STAGE_TRANSITION:N approach with
 * deterministic logic based on conversation state and content.
 */

import { CoachingState, Message } from './aiCoach';

export interface StageTransitionResult {
  shouldTransition: boolean;
  nextStage?: 3 | 4 | 5 | 6;
  reason?: string;
}

// Keywords and patterns that indicate user confirmation/agreement
const CONFIRMATION_PATTERNS = [
  /\bevet\b/i,
  /\btamam\b/i,
  /\banlad[ıi]m\b/i,
  /\bdogru\b/i,
  /\bkat[ıi]l[ıi]yorum\b/i,
  /\bhakl[ıi]s[ıi]n\b/i,
  /\bkesinlikle\b/i,
  /\baynen\b/i,
  /\btab[ıi]i?\b/i,
  /\boldu\b/i,
  /\bokay\b/i,
  /\bok\b/i,
];

// Keywords indicating user wants to select/focus on something
const SELECTION_PATTERNS = [
  /\bsec[ıi]yorum\b/i,
  /\bodaklanmak\s+istiyorum\b/i,
  /\bbunlar[ıi]?\s+(sec|al)/i,
  /\bile\s+basla/i,
  /\bbunu\s+sec/i,
  /\bbunun\s+uzerinde/i,
  /\bbunlara?\s+odaklan/i,
  /\b(bir|iki|1|2)\s*(alan|konu|sey)/i,
];

// Keywords indicating user has committed to an action
const COMMITMENT_PATTERNS = [
  /\byar[ıi]n\b/i,
  /\bhaftaya\b/i,
  /\bpazartesi\b/i,
  /\bsal[ıi]\b/i,
  /\bcarsamba\b/i,
  /\bpersembe\b/i,
  /\bcuma\b/i,
  /\bhemen\b/i,
  /\bbugun\b/i,
  /\bak[sş]am\b/i,
  /\bsabah\b/i,
  /\bbas\s*l[ıi]yorum\b/i,
  /\bdeneyeceg[ıi]m\b/i,
  /\byapaca[gğ][ıi]m\b/i,
  /\bsoz\b/i,
  /\bkarar\s+verdim\b/i,
];

// Patterns indicating the user mentioned specific development areas
const DEVELOPMENT_AREA_MENTIONS = [
  /\bduygu\s*kontrol/i,
  /\bstres/i,
  /\bozguven/i,
  /\brisk/i,
  /\bkontrolculuk/i,
  /\bkural/i,
  /\bone\s*c[ıi]kma/i,
  /\bsosyal/i,
  /\bbasari/i,
  /\biliski/i,
  /\biyi\s*gecinme/i,
  /\bkac[ıi]nma/i,
  /\byenilik/i,
  /\bogrenme/i,
  /\bmerak/i,
  /\bcatisma/i,
  /\biletisim/i,
];

/**
 * Count user messages in current stage's conversation history
 */
function countUserMessages(history: Message[]): number {
  return history.filter(m => m.role === 'user').length;
}

/**
 * Check if text matches any pattern in a list
 */
function matchesAnyPattern(text: string, patterns: RegExp[]): boolean {
  return patterns.some(pattern => pattern.test(text));
}

/**
 * Check if AI response asks about next stage topics (indicates readiness to move)
 */
function aiAsksAboutNextTopic(aiResponse: string, currentStage: number): boolean {
  const stage4Signals = [
    /hangi\s*(alan|konu).*(odaklan|sec)/i,
    /hangi.*(gelisim|alan).*istersin/i,
    /neye\s*odaklanmak/i,
    /hangisine\s*(yo|od)/i,
  ];
  
  const stage5Signals = [
    /ne\s*yap(abil|mak|acak)/i,
    /hangi\s*eylem/i,
    /nas[ıi]l\s*basl/i,
    /ne\s*zaman.*basl/i,
    /hangi.*(adim|eylem).*basl/i,
  ];
  
  const stage6Signals = [
    /ne\s*zaman.*(basl|yap)/i,
    /tarih/i,
    /gun\s*sec/i,
    /hafta.*ici/i,
  ];

  switch (currentStage) {
    case 3:
      return matchesAnyPattern(aiResponse, stage4Signals);
    case 4:
      return matchesAnyPattern(aiResponse, stage5Signals);
    case 5:
      return matchesAnyPattern(aiResponse, stage6Signals);
    default:
      return false;
  }
}

/**
 * Determine if the conversation should transition to the next stage.
 * This is the main export - called after each message exchange.
 */
export function shouldTransitionStage(
  state: CoachingState,
  lastUserMessage: string,
  lastAIResponse: string
): StageTransitionResult {
  const { stage, conversationHistory } = state;
  const messageCount = countUserMessages(conversationHistory);
  
  switch (stage) {
    case 3:
      return evaluateStage3Transition(state, lastUserMessage, lastAIResponse, messageCount);
    case 4:
      return evaluateStage4Transition(state, lastUserMessage, lastAIResponse, messageCount);
    case 5:
      return evaluateStage5Transition(state, lastUserMessage, lastAIResponse, messageCount);
    case 6:
      // Stage 6 is final - no transition
      return { shouldTransition: false };
    default:
      return { shouldTransition: false };
  }
}

/**
 * Stage 3 → 4: Profile Analysis → Development Focus Selection
 * 
 * Criteria:
 * - Minimum 2 user exchanges (they've seen and responded to profile)
 * - User has acknowledged/confirmed profile insights OR
 * - AI is asking about which areas to focus on OR
 * - Maximum 5 exchanges (force transition to keep momentum)
 */
function evaluateStage3Transition(
  state: CoachingState,
  lastUserMessage: string,
  lastAIResponse: string,
  messageCount: number
): StageTransitionResult {
  // Not ready yet - need at least 2 exchanges
  if (messageCount < 2) {
    return { shouldTransition: false };
  }

  // Force transition after 5 exchanges to prevent getting stuck
  if (messageCount >= 5) {
    return {
      shouldTransition: true,
      nextStage: 4,
      reason: 'Maximum exchanges reached for stage 3'
    };
  }

  /// AI soru sorsa bile, kullanıcı "evet" demedikçe geçme!
  if (aiAsksAboutNextTopic(lastAIResponse, 3)) {
    // Kullanıcı onay verdiyse geç
    const userConfirmed = matchesAnyPattern(lastUserMessage, CONFIRMATION_PATTERNS);
    
    if (userConfirmed) {
      return {
        shouldTransition: true,
        nextStage: 4,
        reason: 'AI asked AND user confirmed transition'
      };
    }
  }

  // Check if user confirmed understanding after minimum exchanges
  if (messageCount >= 3) {
    const userConfirmed = matchesAnyPattern(lastUserMessage, CONFIRMATION_PATTERNS);
    const userMentionedArea = matchesAnyPattern(lastUserMessage, DEVELOPMENT_AREA_MENTIONS);
    
    if (userConfirmed || userMentionedArea) {
      return {
        shouldTransition: true,
        nextStage: 4,
        reason: 'User acknowledged profile or mentioned specific area'
      };
    }
  }

  return { shouldTransition: false };
}

/**
 * Stage 4 → 5: Development Focus → Action Planning
 * 
 * Criteria:
 * - User has selected or indicated focus areas OR
 * - AI is asking about actions/what to do OR
 * - User explicitly mentions wanting to work on something
 * - Maximum 6 exchanges
 */
function evaluateStage4Transition(
  state: CoachingState,
  lastUserMessage: string,
  lastAIResponse: string,
  messageCount: number
): StageTransitionResult {
  // Need at least 1 exchange in this stage
  if (messageCount < 1) {
    return { shouldTransition: false };
  }

  // Force transition after 6 exchanges
  if (messageCount >= 6) {
    return {
      shouldTransition: true,
      nextStage: 5,
      reason: 'Maximum exchanges reached for stage 4'
    };
  }

  // Check if AI is asking about actions
  if (aiAsksAboutNextTopic(lastAIResponse, 4)) {
    return {
      shouldTransition: true,
      nextStage: 5,
      reason: 'AI asking about action planning'
    };
  }

  // Check if user has made selections (strong signal after 2+ exchanges)
  if (messageCount >= 2) {
    const userSelected = matchesAnyPattern(lastUserMessage, SELECTION_PATTERNS);
    const userMentionedAreas = matchesAnyPattern(lastUserMessage, DEVELOPMENT_AREA_MENTIONS);
    const userConfirmed = matchesAnyPattern(lastUserMessage, CONFIRMATION_PATTERNS);
    
    if (userSelected || (userMentionedAreas && userConfirmed)) {
      return {
        shouldTransition: true,
        nextStage: 5,
        reason: 'User selected development areas'
      };
    }
  }

  return { shouldTransition: false };
}

/**
 * Stage 5 → 6: Action Planning → Summary & Closure
 * 
 * Criteria:
 * - User has committed to specific actions/timing OR
 * - AI asks about timing and user responds OR
 * - Maximum 5 exchanges
 */
function evaluateStage5Transition(
  state: CoachingState,
  lastUserMessage: string,
  lastAIResponse: string,
  messageCount: number
): StageTransitionResult {
  // Need at least 1 exchange
  if (messageCount < 1) {
    return { shouldTransition: false };
  }

  // Force transition after 5 exchanges
  if (messageCount >= 5) {
    return {
      shouldTransition: true,
      nextStage: 6,
      reason: 'Maximum exchanges reached for stage 5'
    };
  }

  // Check if AI is moving to summary
  if (aiAsksAboutNextTopic(lastAIResponse, 5)) {
    // User should confirm timing first
    const userCommitted = matchesAnyPattern(lastUserMessage, COMMITMENT_PATTERNS);
    if (userCommitted) {
      return {
        shouldTransition: true,
        nextStage: 6,
        reason: 'User committed to timing after AI prompt'
      };
    }
  }

  // Check if user has made time commitment (strong signal)
  if (messageCount >= 2) {
    const userCommitted = matchesAnyPattern(lastUserMessage, COMMITMENT_PATTERNS);
    const userSelected = matchesAnyPattern(lastUserMessage, SELECTION_PATTERNS);
    
    if (userCommitted || (userSelected && messageCount >= 3)) {
      return {
        shouldTransition: true,
        nextStage: 6,
        reason: 'User committed to actions'
      };
    }
  }

  return { shouldTransition: false };
}

/**
 * Optional: Check if AI's response contained a stage transition marker.
 * This can be used as a secondary signal but not the primary mechanism.
 */
export function extractAITransitionHint(aiResponse: string): number | null {
  const match = aiResponse.match(/STAGE_TRANSITION:(\d+)/);
  if (match) {
    return parseInt(match[1]);
  }
  return null;
}

/**
 * Clean up stage transition markers from AI response
 */
export function cleanAIResponse(response: string): string {
  return response.replace(/STAGE_TRANSITION:\d+/g, '').trim();
}
