'use client';

import { useCoaching } from '@/lib/context/CoachingContext';
import { getDimensionLabel } from '@/lib/utils/scoring';

export default function Stage3Strengths() {
  const { session, nextStage, previousStage } = useCoaching();

  if (!session?.strengths) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Aşama 3: Güçlü Özell ikleriniz
      </h2>
      <p className="text-gray-600 mb-6">
        Puanlarınıza göre belirlenen güçlü özellikleriniz. Hem yüksek hem düşük puanların
        güçleri bulunmaktadır.
      </p>

      <div className="space-y-4 mb-8">
        {session.strengths.slice(0, 10).map((strength, idx) => (
          <div key={idx} className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900">
                {getDimensionLabel(strength.dimension)}
              </h3>
              <span className="text-sm font-medium text-green-700">
                Puan: {strength.score}
              </span>
            </div>
            <p className="text-gray-700 text-sm">
              {strength.description}
            </p>
            <span className="text-xs text-gray-500 mt-1 inline-block">
              {strength.category === 'high' ? '↑ Yüksek puan gücü' : '↓ Dengeli yaklaşım gücü'}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between gap-4">
        <button
          onClick={previousStage}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Geri
        </button>
        <button
          onClick={nextStage}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Devam Et →
        </button>
      </div>
    </div>
  );
}
