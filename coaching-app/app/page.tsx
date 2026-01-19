'use client';

import { useCoaching } from '@/lib/context/CoachingContext';
import Stage1Welcome from '@/components/coaching/Stage1Welcome';
import Stage2Scores from '@/components/coaching/Stage2Scores';
import Stage3Strengths from '@/components/coaching/Stage3Strengths';
import Stage4Development from '@/components/coaching/Stage4Development';
import Stage5Actions from '@/components/coaching/Stage5Actions';
import Stage6Summary from '@/components/coaching/Stage6Summary';

export default function Home() {
  const { session } = useCoaching();

  if (!session) {
    return <Stage1Welcome />;
  }

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
