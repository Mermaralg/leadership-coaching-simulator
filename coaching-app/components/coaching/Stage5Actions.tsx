'use client';

import { useCoaching } from '@/lib/context/CoachingContext';

export default function Stage5Actions() {
  const { session, nextStage, previousStage } = useCoaching();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Aşama 5: Eylem Önerileri
      </h2>
      <p className="text-gray-600 mb-6">
        Gelişim alanlarınız için somut eylem önerileri.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Genel Öneriler:</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">1.</span>
            <span>Güçlü özelliklerinizin ekip dinamiklerine etkisini gözlemleyin</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">2.</span>
            <span>1-2 gelişim alanı seçin ve bu çeyrekte odaklanın</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">3.</span>
            <span>Konfor alonunuzun dışına çıkan senaryolar pratiği yapın</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">4.</span>
            <span>Meslektaşlarınızdan liderlik tarzınız hakkında geri bildirim alın</span>
          </li>
        </ul>
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
