'use client';

import { useState } from 'react';
import ChatInterface from './ChatInterface';
import { CoachingState, Message } from '@/lib/services/aiCoach';

export default function ChatMode() {
  const [state, setState] = useState<CoachingState>({
    stage: 1,
    conversationHistory: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            5D Kişilik Koçluk Simülatörü
          </h1>
          <p className="text-sm text-gray-600 mt-1">
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
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          {error}
        </div>
      )}
    </div>
  );
}
