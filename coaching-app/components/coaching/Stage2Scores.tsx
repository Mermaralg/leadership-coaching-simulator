'use client';

import { useState } from 'react';
import { useCoaching } from '@/lib/context/CoachingContext';
import { DIMENSIONS, SubDimension } from '@/types/coaching';

// Get initial scores with all dimensions set to 50
function getInitialScores(): Record<SubDimension, number> {
  const scores: Record<SubDimension, number> = {} as Record<SubDimension, number>;
  Object.values(DIMENSIONS).flatMap((d) => d.subDimensions).forEach((dim) => {
    scores[dim.key] = 50;
  });
  return scores;
}

export default function Stage2Scores() {
  const { updateScores, previousStage } = useCoaching();
  
  // Group dimensions by main dimension for spreadsheet display
  const dimensionGroups = Object.values(DIMENSIONS).map((d) => ({
    mainName: d.name,
    subDimensions: d.subDimensions,
  }));

  const [scores, setScores] = useState<Record<SubDimension, number>>(getInitialScores);

  const handleScoreChange = (dimension: SubDimension, value: string) => {
    const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
    setScores((prev) => ({ ...prev, [dimension]: numValue }));
  };

  const handleSubmit = () => {
    updateScores(scores, true);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Aşama 2: Kişilik Puanları
      </h2>
      <p className="text-gray-600 mb-6">
        Her boyut için 0-100 arası puanınızı girin.
      </p>

      {/* Spreadsheet-style Score Entry */}
      <div className="border border-gray-300 rounded-lg overflow-hidden mb-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700 border-b">Ana Boyut</th>
              <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700 border-b">Alt Boyut</th>
              <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700 border-b w-24">Puan</th>
            </tr>
          </thead>
          <tbody>
            {dimensionGroups.map((group, groupIdx) => (
              group.subDimensions.map((dim, dimIdx) => (
                <tr 
                  key={dim.key} 
                  className={`${groupIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                >
                  {dimIdx === 0 && (
                    <td 
                      className="px-4 py-2 text-sm font-medium text-gray-700 border-b align-top"
                      rowSpan={group.subDimensions.length}
                    >
                      {group.mainName}
                    </td>
                  )}
                  <td className="px-4 py-2 text-sm text-gray-600 border-b">
                    {dim.name}
                  </td>
                  <td className="px-2 py-1 border-b">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scores[dim.key]}
                      onChange={(e) => handleScoreChange(dim.key, e.target.value)}
                      className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="0-100"
                    />
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-4 mt-6">
        <button
          onClick={previousStage}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Geri
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Devam Et →
        </button>
      </div>
    </div>
  );
}
