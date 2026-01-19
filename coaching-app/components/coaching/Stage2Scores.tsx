'use client';

import { useState } from 'react';
import { useCoaching } from '@/lib/context/CoachingContext';
import { DIMENSIONS, SubDimension } from '@/types/coaching';

export default function Stage2Scores() {
  const { updateScores, nextStage, previousStage } = useCoaching();
  
  const allDimensions = Object.values(DIMENSIONS).flatMap((d) =>
    d.subDimensions.map((sub) => ({ ...sub, mainDim: d.name }))
  );

  // Initialize all scores to 50 by default
  const initialScores: Record<SubDimension, number> = {} as Record<SubDimension, number>;
  allDimensions.forEach((dim) => {
    initialScores[dim.key] = 50;
  });

  const [scores, setScores] = useState<Partial<Record<SubDimension, number>>>(initialScores);

  const handleScoreChange = (dimension: SubDimension, value: number) => {
    setScores((prev) => ({ ...prev, [dimension]: value }));
  };

  const handleSubmit = () => {
    // Check if all scores are filled
    const allFilled = allDimensions.every((dim) => scores[dim.key] !== undefined);
    
    if (allFilled) {
      updateScores(scores as Record<SubDimension, number>);
      nextStage();
    }
  };

  const allFilled = allDimensions.every((dim) => scores[dim.key] !== undefined);
  const progress = (Object.keys(scores).length / allDimensions.length) * 100;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Aşama 2: Kişilik Puanları
      </h2>
      <p className="text-gray-600 mb-6">
        Her boyut için 0-100 arası puanınızı girin. Eğer puanlarınız yoksa,
        tahminî değerler kullanabilirsiniz.
      </p>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{Object.keys(scores).length} / {allDimensions.length} boyut girildi</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Score Entry */}
      <div className="space-y-6 mb-8">
        {allDimensions.map((dim) => (
          <div key={dim.key} className="border-b pb-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <label className="font-medium text-gray-900">{dim.name}</label>
                <p className="text-xs text-gray-500">{dim.mainDim}</p>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {scores[dim.key] ?? '--'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={scores[dim.key] ?? 50}
              onChange={(e) => handleScoreChange(dim.key, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Düşük (0)</span>
              <span>Orta (50)</span>
              <span>Yüksek (100)</span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-4">
        <button
          onClick={previousStage}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Geri
        </button>
        <button
          onClick={handleSubmit}
          disabled={!allFilled}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Devam Et →
        </button>
      </div>

      {!allFilled && (
        <p className="text-sm text-amber-600 mt-4 text-center">
          Lütfen tüm boyutlar için puan girin
        </p>
      )}
    </div>
  );
}
