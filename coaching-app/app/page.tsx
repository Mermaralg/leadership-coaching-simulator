'use client';

import { useCoaching } from '@/lib/context/CoachingContext';
import Stage1Welcome from '@/components/coaching/Stage1Welcome';
import Stage2Scores from '@/components/coaching/Stage2Scores';
import ConversationalCoaching from '@/components/coaching/ConversationalCoaching';

export default function Home() {
  const { session } = useCoaching();

  // No session yet - show welcome screen
  if (!session) {
    return <Stage1Welcome />;
  }

  // Stage 2: Score entry via sliders
  if (session.currentStage === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              5D Kisilik Kocluk Simulatoru
            </h1>
            <p className="text-gray-600">
              Merhaba, {session.participantName}!
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Asama {session.currentStage} / 6
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((session.currentStage / 6) * 100)}% Tamamlandi
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(session.currentStage / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* Score Entry */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <Stage2Scores />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>2026 5D Kisilik Kocluk Simulatoru - MVP Demo</p>
            <p className="text-xs text-gray-400 mt-1">v0.1.0</p>
          </div>
        </div>
      </div>
    );
  }

  // Stages 3-6: Conversational coaching
  return <ConversationalCoaching />;
}
