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

 // Force transition after 8 exchanges (increased from 5)
  if (messageCount >= 8) {
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

  // SADECE açık geçiş kelimeleri ile geç
  if (messageCount >= 5) {
    const explicitTransition = /\b(geçelim|gecelim)\b/i.test(lastUserMessage);
    
    if (explicitTransition) {
      return {
        shouldTransition: true,
        nextStage: 4,
        reason: 'User explicitly requested transition'
      };
    }
  }

  return { shouldTransition: false };
}

/**
 * Stage 4 → 5: Development Focus → Action Planning
 *
 * Criteria (strict - must satisfy ALL):
 * - Minimum 6 exchanges (full exploration flow: list → triggers → example → self-impact → other-impact → selection ask)
 * - AI must have explicitly asked for 2-area selection in its last message
 * - User must have named at least 2 development areas in their response
 * - Maximum 9 exchanges (force transition)
 */
function evaluateStage4Transition(
  state: CoachingState,
  lastUserMessage: string,
  lastAIResponse: string,
  messageCount: number
): StageTransitionResult {
  // Need at least 6 exchanges before selection is possible
  if (messageCount < 6) {
    return { shouldTransition: false };
  }

  // Force transition after 9 exchanges
  if (messageCount >= 9) {
    return {
      shouldTransition: true,
      nextStage: 5,
      reason: 'Maximum exchanges reached for stage 4'
    };
  }

  // Only transition when the AI explicitly asked for 2-area selection
  // AND the user named at least 2 development areas in response
  const aiAskedFor2Areas =
    /2\s*tane/i.test(lastAIResponse) ||
    /iki\s*(alan|konu|tanesini)/i.test(lastAIResponse) ||
    /hangisi.*2.*alan/i.test(lastAIResponse) ||
    /2\s*(alan|konu)\s*(se[cç]|belirle)/i.test(lastAIResponse);

  if (aiAskedFor2Areas) {
    // Count distinct development areas the user mentioned
    const mentionedAreaCount = DEVELOPMENT_AREA_MENTIONS.filter(pattern =>
      pattern.test(lastUserMessage)
    ).length;

    if (mentionedAreaCount >= 2) {
      return {
        shouldTransition: true,
        nextStage: 5,
        reason: 'AI asked for 2 areas AND user named at least 2 development areas'
      };
    }
  }

  return { shouldTransition: false };
}

/**
 * Stage 5 → 6: Action Planning → Summary & Closure
 * 
 * Criteria:
 * - Kullanıcı somut bir zaman taahhüdü verdi (yarın, bu hafta, bugün vb.)
 * - Maximum 8 exchanges
 */
function evaluateStage5Transition(
  state: CoachingState,
  lastUserMessage: string,
  lastAIResponse: string,
  messageCount: number
): StageTransitionResult {
  // Initial message guard
  if (lastUserMessage === '__STAGE_INIT__' || lastUserMessage === 'Basla') {
    return { shouldTransition: false };
  }

  // Need at least 6 exchanges — iki alan için yeterli konuşma
  if (messageCount < 6) {
    return { shouldTransition: false };
  }

  // Force transition after 12 exchanges
  if (messageCount >= 12) {
    return {
      shouldTransition: true,
      nextStage: 6,
      reason: 'Maximum exchanges reached for stage 5'
    };
  }

  // Kullanıcı somut zaman taahhüdü verdi mi?
  const userCommitted = matchesAnyPattern(lastUserMessage, COMMITMENT_PATTERNS);

  if (userCommitted && messageCount >= 6) {
    return {
      shouldTransition: true,
      nextStage: 6,
      reason: 'User committed to specific timing'
    };
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
