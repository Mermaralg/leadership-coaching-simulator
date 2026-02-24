'use client';

import { useState } from 'react';
import { useCoaching } from '@/lib/context/CoachingContext';

export default function Stage1Welcome() {
  const { session, startSession, nextStage } = useCoaching();
  const [name, setName] = useState('');

  const handleStart = () => {
    if (name.trim()) {
      startSession(name);
      // Session starts at stage 2, so user goes directly to scoring
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            5D Kişilik Koçluk Simülatörü
          </h1>
          <p className="text-lg text-gray-600">
            Kişisel ve Profesyonel Gelişim
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <h2 className="font-semibold text-gray-900 mb-3 text-lg">
              Merhaba! 👋
            </h2>
            <p className="text-gray-700 mb-3">
              Ben senin <strong>5D Kişilik Koçunum</strong>. Bu yolculukta amacım, kendini daha iyi tanımanı sağlamak, güçlü yanlarını görmeni ve gelişim alanlarında farkındalık kazanmanı desteklemek.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Bu süreçte neler yapacağız?</h3>
            <p className="text-gray-700 mb-4">
              Birlikte <strong>Big Five Kişilik Modeli</strong>'ni kullanarak senin 5D kişilik envanteri sonuçlarını beraber keşfedeceğiz. Bu model 5 ana boyuttan oluşuyor:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3 mt-1">1.</span>
                <div>
                  <strong>Duygusal Denge</strong> - Duygularını nasıl yönettiğin, stresle başa çıkman
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3 mt-1">2.</span>
                <div>
                  <strong>Dikkat ve Düzen</strong> - Planlılığın, kontrol ihtiyacın, kurallara yaklaşımın
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3 mt-1">3.</span>
                <div>
                  <strong>Dışadönüklük</strong> - Sosyalliğin, öne çıkman, başarı yönelimin
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3 mt-1">4.</span>
                <div>
                  <strong>Dengeli İlişki</strong> - İlişkileri nasıl yönettiğin, çatışmaya yaklaşımın
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3 mt-1">5.</span>
                <div>
                  <strong>Deneyime Açıklık</strong> - Yeniliğe, öğrenmeye, farklı fikirlere açıklığın
                </div>
              </li>
            </ul>
            <p className="text-gray-700 mt-4">
              Her boyutun altında <strong>3'er alt özellik</strong> var - toplamda <strong>15 farklı kişilik özelliğini</strong> inceleyeceğiz.
            </p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
            <h3 className="font-semibold text-gray-900 mb-2">⚠️ Önemli:</h3>
            <p className="text-gray-700 text-sm">
              Bu süreç <strong>sırayla ilerliyor</strong>. Her aşamayı bitirdikten sonra bir sonrakine geçeceğiz.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hazır mısın? İsmini öğrenebilir miyim? 😊
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStart()}
              placeholder="Adınız"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleStart}
            disabled={!name.trim()}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Başlayalım →
          </button>
        </div>
      </div>
    </div>
  );
}
