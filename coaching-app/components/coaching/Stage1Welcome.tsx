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
            <h2 className="font-semibold text-gray-900 mb-2">
              Hoş Geldiniz!
            </h2>
            <p className="text-gray-700">
              Bu interaktif koçluk simülatörü, <strong>5D Kişilik Modeli</strong> (Big Five)
              kullanarak liderlik özell iklerinizi değerlendirir ve gelişim için öneriler sunar.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">5D Kişilik Boyutları:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span><strong>Duygusal Denge:</strong> Duygu Kontrolü, Stresle Başa Çıkma, Özgüven</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span><strong>Dikkat ve Düzen:</strong> Risk Duyarlılık, Kontrolcülük, Kural Uyumu</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span><strong>Dışadönüklük:</strong> Öne Çıkmayı Seven, Sosyallik, Başarı Yönelimi</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span><strong>Dengeli İlişki:</strong> İlişki Yönetimi, İyi Geçinme, Kaçınma</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span><strong>Deneyime Açıklık:</strong> Yenilikçilik, Öğrenme Yönelimi, Merak</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-900 mb-2">Süreç:</h3>
            <p className="text-gray-700 text-sm">
              6 aşamada ilerleyeceğiz: Tanışma, Puanlama, Güçlü Özellikler,
              Gelişim Alanları, Eylem Önerileri ve Özet.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lütfen adınızı girin:
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
