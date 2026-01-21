'use client';

import { useState, useEffect } from 'react';
import { useCoaching } from '@/lib/context/CoachingContext';
import { Message, CoachingState } from '@/lib/services/aiCoach';
import ChatInterface from './ChatInterface';
import { SubDimension } from '@/types/coaching';

const STAGE_TITLES: Record<number, string> = {
  3: 'Guclu Ozellikler',
  4: 'Gelisim Alanlari',
  5: 'Eylem Plani',
  6: 'Ozet ve Kapanıs',
};

export default function ConversationalCoaching() {
  const { session, nextStage } = useCoaching();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [coachingState, setCoachingState] = useState<CoachingState | null>(null);

  // Initialize coaching state and send initial message when component mounts or stage changes
  useEffect(() => {
    if (!session) return;

    // Initialize state for the current stage
    const initialState: CoachingState = {
      stage: session.currentStage as CoachingState['stage'],
      participantName: session.participantName,
      scores: session.profile?.scores as Record<SubDimension, number>,
      strengths: session.strengths?.map(s => s.dimension),
      developmentAreas: session.developmentAreas?.map(d => d.dimension),
      conversationHistory: [],
    };
    setCoachingState(initialState);

    // Only send initial message if this is a fresh start (no messages yet)
    if (messages.length === 0) {
      sendInitialMessage(initialState);
    }
  }, [session?.currentStage]);

  const sendInitialMessage = async (state: CoachingState) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Basla', // Trigger to start the stage
          state,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      setMessages([{ role: 'assistant', content: data.response }]);
      setCoachingState(data.state);
    } catch (error) {
      console.error('Error getting initial message:', error);
      setMessages([{
        role: 'assistant',
        content: 'Bir hata olustu. Lutfen sayfayi yenileyin.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (userMessage: string) => {
    if (!coachingState) return;

    // Add user message to UI
    const updatedMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Update state with conversation history
      const stateWithHistory: CoachingState = {
        ...coachingState,
        conversationHistory: updatedMessages,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          state: stateWithHistory,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      // Check if stage changed
      if (data.state.stage !== coachingState.stage) {
        // Update session stage via context
        nextStage();
        // Reset messages for new stage
        setMessages([{ role: 'assistant', content: data.response }]);
      } else {
        // Add assistant response
        setMessages([
          ...updatedMessages,
          { role: 'assistant', content: data.response },
        ]);
      }

      setCoachingState(data.state);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: 'Bir hata olustu. Lutfen tekrar deneyin.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return null;

  const currentStage = session.currentStage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                5D Kisilik Kocluk
              </h1>
              <p className="text-sm text-gray-600">
                {session.participantName} - {STAGE_TITLES[currentStage] || `Asama ${currentStage}`}
              </p>
            </div>

            {/* Stage Progress */}
            <div className="flex items-center space-x-2">
              {[3, 4, 5, 6].map((stage) => (
                <div
                  key={stage}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStage === stage
                      ? 'bg-purple-600 text-white'
                      : currentStage > stage
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                >
                  {currentStage > stage ? '✓' : stage}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 container mx-auto max-w-4xl">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
