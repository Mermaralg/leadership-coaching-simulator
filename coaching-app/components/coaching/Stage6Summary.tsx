'use client';

import { useCoaching } from '@/lib/context/CoachingContext';

export default function Stage6Summary() {
  const { session, completeSession, previousStage } = useCoaching();

  if (!session) return <div>Loading...</div>;

  const handleComplete = () => {
    completeSession();
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Tebrikler, {session.participantName}!
        </h2>
        <p className="text-gray-600">
          5D Kişilik Koçluk oturumunuzu tamamladınız
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Özet:</h3>
          <div className="space-y-2 text-gray-700">
            <p>
              ✓ <strong>{session.strengths?.length || 0}</strong> güçlü özellik belirlendi
            </p>
            <p>
              ✓ <strong>{session.developmentAreas?.length || 0}</strong> gelişim fırsatı tespit edildi
            </p>
            <p>
              ✓ Kişisel eylem planı oluşturuldu
            </p>
          </div>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
          <h3 className="font-semibold text-gray-900 mb-2">
            Hatırlatma:
          </h3>
          <p className="text-gray-700">
            Harika bir lider, sürekli öğrenen ve kendini geliştiren liderdir.
            5D Kişilik yöntemini bireysel değişim yönetiminde kullanmayı birlikte inceledik.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Sonraki Adımlar:</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Bu raporu ekibinizle veya mentorunuzla paylaşın</li>
            <li>• 1-2 gelişim alanı seçin ve 30 günlük eylem planı oluşturun</li>
            <li>• 3 ay sonra tekrar değerlendirme yapın</li>
            <li>• Gelişiminizi takip edin ve celebilirsiniz</li>
          </ul>
        </div>
      </div>

      {session.completedAt && (
        <div className="text-center text-sm text-gray-500 mb-4">
          Oturum tamamlanma zamanı: {new Date(session.completedAt).toLocaleString('tr-TR')}
        </div>
      )}

      <div className="flex justify-between gap-4">
        <button
          onClick={previousStage}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Geri
        </button>
        <button
          onClick={handleComplete}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
        >
          Oturumu Tamamla ✓
        </button>
      </div>
    </div>
  );
}
