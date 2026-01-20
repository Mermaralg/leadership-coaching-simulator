'use client';

import { useState } from 'react';
import { useCoaching } from '@/lib/context/CoachingContext';
import Stage1Welcome from '@/components/coaching/Stage1Welcome';
import Stage2Scores from '@/components/coaching/Stage2Scores';
import Stage3Strengths from '@/components/coaching/Stage3Strengths';
import Stage4Development from '@/components/coaching/Stage4Development';
import Stage5Actions from '@/components/coaching/Stage5Actions';
import Stage6Summary from '@/components/coaching/Stage6Summary';
import ChatMode from '@/components/coaching/ChatMode';

export default function Home() {
  const { session } = useCoaching();
  const [mode, setMode] = useState<'slider' | 'chat' | null>(null);

  // If chat mode is selected (even without session), show chat interface
  if (mode === 'chat') {
    return <ChatMode />;
  }

  // Show mode selection if no mode selected yet
  if (mode === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            5D Kişilik Koçluk Simülatörü
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Başlamak için bir mod seçin:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setMode('chat')}
              className="p-6 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">💬</div>
              <h3 className="font-bold text-lg mb-2">Sohbet Modu</h3>
              <p className="text-sm text-gray-600">
                Yapay zeka koçuyla doğal bir konuşma yapın. Daha kişisel ve etkileşimli bir deneyim.
              </p>
              <span className="inline-block mt-3 text-blue-600 font-medium">Yeni! ✨</span>
            </button>
            
            <button
              onClick={() => {
                setMode('slider');
                // Trigger the welcome stage to start session
              }}
              className="p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-bold text-lg mb-2">Klasik Mod</h3>
              <p className="text-sm text-gray-600">
                Kaydırıcılarla puanlarınızı girin. Hızlı ve yapılandırılmış bir deneyim.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Slider mode selected - show welcome or current stage
  if (!session) {
    return <Stage1Welcome />;
  }

  // Show slider mode with session
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            5D Kişilik Koçluk Simülatörü
          </h1>
          <p className="text-gray-600">
            Merhaba, {session.participantName}! 👋
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Aşama {session.currentStage} / 6
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((session.currentStage / 6) * 100)}% Tamamlandı
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(session.currentStage / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Stage Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {session.currentStage === 1 && <Stage1Welcome />}
          {session.currentStage === 2 && <Stage2Scores />}
          {session.currentStage === 3 && <Stage3Strengths />}
          {session.currentStage === 4 && <Stage4Development />}
          {session.currentStage === 5 && <Stage5Actions />}
          {session.currentStage === 6 && <Stage6Summary />}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2026 5D Kişilik Koçluk Simülatörü - MVP Demo</p>
        </div>
      </div>
    </div>
  );
}
