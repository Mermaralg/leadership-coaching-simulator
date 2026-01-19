'use client';

import { useCoaching } from '@/lib/context/CoachingContext';
import { getDimensionLabel } from '@/lib/utils/scoring';

export default function Stage4Development() {
  const { session, nextStage, previousStage } = useCoaching();

  if (!session?.developmentAreas) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Aşama 4: Gelişim Alanlarınız
      </h2>
      <p className="text-gray-600 mb-6">
        Odaklanabileceğiniz gelişim fırsatları. Uç puanlarınız (çok düşük veya çok yüksek)
        gelişim potansiyeli taşır.
      </p>

      <div className="space-y-4 mb-8">
        {session.developmentAreas.slice(0, 10).map((area, idx) => (
          <div key={idx} className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900">
                {getDimensionLabel(area.dimension)}
              </h3>
              <span className="text-sm font-medium text-amber-700">
                Puan: {area.score}
              </span>
            </div>
            <p className="text-gray-700 text-sm">
              {area.description}
            </p>
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
