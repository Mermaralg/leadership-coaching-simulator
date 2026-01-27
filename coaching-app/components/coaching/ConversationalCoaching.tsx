'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [allMessages, setAllMessages] = useState<Message[]>([]); // Track ALL messages across stages
  const [isLoading, setIsLoading] = useState(false);
  const [coachingState, setCoachingState] = useState<CoachingState | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const initializedStage = useRef<number | null>(null);

  // Initialize coaching state and send initial message when component mounts or stage changes
  useEffect(() => {
    if (!session) return;
    if (initializedStage.current === session.currentStage) return;

    initializedStage.current = session.currentStage;

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

    // Add stage marker to all messages
    if (session.currentStage >= 3) {
      const stageMarker: Message = {
        role: 'system',
        content: `--- ${STAGE_TITLES[session.currentStage]} ---`
      };
      setAllMessages(prev => [...prev, stageMarker]);
    }

    sendInitialMessage(initialState);
  }, [session?.currentStage]);

  const sendInitialMessage = async (state: CoachingState) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Basla',
          state,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMsg: Message = { role: 'assistant', content: data.response };
      setMessages([assistantMsg]);
      setAllMessages(prev => [...prev, assistantMsg]);
      setCoachingState(data.state);

      // Check if this is the final stage and conversation seems complete
      if (data.state.stage === 6) {
        setSessionComplete(true);
      }
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

    const userMsg: Message = { role: 'user', content: userMessage };
    const updatedMessages: Message[] = [...messages, userMsg];
    setMessages(updatedMessages);
    setAllMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
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
      const assistantMsg: Message = { role: 'assistant', content: data.response };

      // Check if stage changed
      if (data.state.stage !== coachingState.stage) {
        nextStage();
        setMessages([assistantMsg]);

        // Add stage marker and message to all messages
        const stageMarker: Message = {
          role: 'system',
          content: `--- ${STAGE_TITLES[data.state.stage]} ---`
        };
        setAllMessages(prev => [...prev, stageMarker, assistantMsg]);
      } else {
        setMessages([...updatedMessages, assistantMsg]);
        setAllMessages(prev => [...prev, assistantMsg]);
      }

      setCoachingState(data.state);

      // Mark session complete when we reach stage 6
      if (data.state.stage === 6) {
        setSessionComplete(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg: Message = { role: 'assistant', content: 'Bir hata olustu. Lutfen tekrar deneyin.' };
      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadConversation = () => {
    if (!session) return;

    const date = new Date().toLocaleDateString('tr-TR');
    let markdown = `# 5D Kisilik Kocluk Seansı\n\n`;
    markdown += `**Katilimci:** ${session.participantName}\n`;
    markdown += `**Tarih:** ${date}\n\n`;

    // Add scores summary
    if (session.profile?.scores) {
      markdown += `## Kisilik Puanlari\n\n`;
      const dimensionNames: Record<string, string> = {
        duygu_kontrolu: 'Duygu Kontrolu',
        stresle_basa_cikma: 'Stresle Basa Cikma',
        ozguven: 'Ozguven',
        risk_duyarlilik: 'Risk Duyarlilik',
        kontrolculuk: 'Kontrolculuk',
        kural_uyumu: 'Kural Uyumu',
        one_cikmayi_seven: 'One Cikmayi Seven',
        sosyallik: 'Sosyallik',
        basari_yonelimi: 'Basari Yonelimi',
        iliski_yonetimi: 'Iliski Yonetimi',
        iyi_gecinme: 'Iyi Gecinme',
        kacinma: 'Kacinma',
        yenilikcilik: 'Yenilikcilik',
        ogrenme_yonelimi: 'Ogrenme Yonelimi',
        merak: 'Merak',
      };
      Object.entries(session.profile.scores).forEach(([key, value]) => {
        markdown += `- **${dimensionNames[key] || key}:** ${value}\n`;
      });
      markdown += `\n`;
    }

    markdown += `## Konusma\n\n`;

    allMessages.forEach((msg) => {
      if (msg.role === 'system') {
        markdown += `\n${msg.content}\n\n`;
      } else if (msg.role === 'user') {
        markdown += `**${session.participantName}:** ${msg.content}\n\n`;
      } else {
        markdown += `**Koc:** ${msg.content}\n\n`;
      }
    });

    // Create and download file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `5D-Kocluk-${session.participantName}-${date.replace(/\./g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

            <div className="flex items-center space-x-4">
              {/* Download Button */}
              {sessionComplete && (
                <button
                  onClick={downloadConversation}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Indir</span>
                </button>
              )}

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
