'use client';

import { useCoaching } from '@/lib/context/CoachingContext';
import { getDimensionLabel } from '@/lib/utils/scoring';
import { useEffect } from 'react';

export default function Stage3Strengths() {
  const { session, nextStage, previousStage } = useCoaching();

  useEffect(() => {
    // Debug logging
    console.log('Stage 3 - Session:', session);
    console.log('Stage 3 - Strengths:', session?.strengths);
    console.log('Stage 3 - Profile:', session?.profile);
  }, [session]);

  if (!session) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Aşama 3: Güçlü Özellikler</h2>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
          <p className="text-gray-700">Oturum bulunamadı. Lütfen baştan başlayın.</p>
        </div>
        <button onClick={previousStage} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">← Geri</button>
      </div>
    );
  }

  if (!session.strengths || session.strengths.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Aşama 3: Güçlü Özellikler</h2>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mb-4">
          <p className="text-gray-700 mb-2">Güçlü özellikler hesaplanamadı.</p>
          <p className="text-sm text-gray-600">Lütfen bir önceki aşamaya dönüp tüm puanları girdiğinizden emin olun.</p>
          <details className="mt-3 text-xs text-gray-500">
            <summary className="cursor-pointer">Debug Bilgisi</summary>
            <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify({
                hasSession: !!session,
                hasProfile: !!session.profile,
                hasScores: !!session.profile?.scores,
                strengthsCount: session.strengths?.length || 0
              }, null, 2)}
            </pre>
          </details>
        </div>
        <div className="flex justify-between gap-4">
          <button onClick={previousStage} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">← Geri</button>
          <button onClick={nextStage} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Atla ve Devam Et →</button>
        </div>
      </div>
    );
  }

  if (session.strengths.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Aşama 3: Güçlü Özellikler</h2>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
          <p className="text-gray-700">Güçlü özellikler belirleniyor... Lütfen bir önceki aşamaya dönüp puanlarınızı kontrol edin.</p>
        </div>
        <div className="flex justify-between gap-4">
          <button onClick={previousStage} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">← Geri</button>
          <button onClick={nextStage} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Devam Et →</button>
        </div>
      </div>
    );
  }

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
