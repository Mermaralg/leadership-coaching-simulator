'use client';

import { useState } from 'react';
import ChatInterface from './ChatInterface';
import { CoachingState, Message } from '@/lib/services/aiCoach';
import { ScoreValidation } from './ScoreValidation';
import { ScoreSummary } from './ScoreSummary';
import { useCoaching } from '@/lib/context/CoachingContext';
import { ScoreProposal } from '@/lib/scoring/scoreInference';
import { SubDimension } from '@/types/coaching';

export default function ChatMode() {
  const { dimensionScores, updateDimensionScore, validateDimensionScore } = useCoaching();
  const [state, setState] = useState<CoachingState>({
    stage: 1,
    conversationHistory: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingProposal, setPendingProposal] = useState<ScoreProposal | null>(null);

  // Initialize with welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Merhaba! 👋\n\nBen senin 5D Kişilik Koçunum. Bu yolculukta amacım seni yargılamak değil - tam tersine, kendini daha iyi tanımanı sağlamak, güçlü yanlarını görmeni ve gelişim alanlarında farkındalık kazanmanı desteklemek.\n\nÖnce tanışalım: İsmin ne?',
    },
  ]);

  const handleSendMessage = async (userMessage: string) => {
    // Add user message to UI immediately
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          state,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Update state and messages
      setState(data.state);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: data.response },
      ]);

      // Check if there's a score proposal
      if (data.scoreProposal) {
        setPendingProposal(data.scoreProposal);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.');
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Üzgünüm, bir teknik sorun yaşadım. Lütfen mesajını tekrar gönderir misin?',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateScore = (adjustedScore?: number) => {
    if (!pendingProposal) return;

    const finalScore = adjustedScore ?? pendingProposal.proposedScore;
    updateDimensionScore(pendingProposal.dimension, finalScore, pendingProposal);
    validateDimensionScore(pendingProposal.dimension);
    setPendingProposal(null);

    // Add confirmation message
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `Harika! ${pendingProposal.dimension} için ${finalScore} puanını kaydettim. Bir sonraki özelliğe geçelim. 🎯`,
      },
    ]);
  };

  const handleRejectScore = () => {
    setPendingProposal(null);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: 'Tamam, bu konuda daha fazla konuşalım. Bana biraz daha detay verebilir misin?',
      },
    ]);
  };

  // Convert dimensionScores to PersonalityProfile format when Stage 2 completes
  const convertScoresToProfile = () => {
    if (Object.keys(dimensionScores).length < 15) return null;

    const scores: Record<SubDimension, number> = {} as Record<SubDimension, number>;
    Object.entries(dimensionScores).forEach(([key, value]) => {
      scores[key as SubDimension] = value.score;
    });

    return scores;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            5D Kişilik Koçluk Simülatörü
          </h1>
          <p className="text-sm text-gray-900 font-medium mt-1">
            Aşama {state.stage} / 6
            {state.participantName && (
              <span className="ml-2">• Merhaba, {state.participantName}! 👋</span>
            )}
          </p>
        </div>
      </div>

      {/* Chat area */}
      <div className="h-[calc(100vh-100px)]">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          pendingProposal={pendingProposal}
          onValidateScore={handleValidateScore}
          onRejectScore={handleRejectScore}
        />
      </div>

      {/* Show score summary in Stage 6 */}
      {state.stage === 6 && Object.keys(dimensionScores).length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <ScoreSummary scores={dimensionScores} />
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Yeni Bir Simülasyon Başlat
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          {error}
        </div>
      )}
    </div>
  );
}
