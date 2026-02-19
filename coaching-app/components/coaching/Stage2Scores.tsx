'use client';

import { useState } from 'react';
import { useCoaching } from '@/lib/context/CoachingContext';
import { DIMENSIONS, SubDimension, MainDimension } from '@/types/coaching';

// Get initial sub-dimension scores (all empty)
function getInitialSubScores(): Record<SubDimension, number | ''> {
  const scores: Record<SubDimension, number | ''> = {} as Record<SubDimension, number | ''>;
  Object.values(DIMENSIONS).flatMap((d) => d.subDimensions).forEach((dim) => {
    scores[dim.key] = '';
  });
  return scores;
}

// Get initial main dimension scores (all empty)
function getInitialMainScores(): Record<MainDimension, number | ''> {
  const scores: Record<MainDimension, number | ''> = {} as Record<MainDimension, number | ''>;
  (Object.keys(DIMENSIONS) as MainDimension[]).forEach((key) => {
    scores[key] = '';
  });
  return scores;
}

export default function Stage2Scores() {
  const { updateScores, previousStage } = useCoaching();
  
  // Dimension data with keys
  const dimensionEntries = (Object.entries(DIMENSIONS) as [MainDimension, typeof DIMENSIONS[MainDimension]][]);

  const [subScores, setSubScores] = useState<Record<SubDimension, number | ''>>(getInitialSubScores);
  const [mainScores, setMainScores] = useState<Record<MainDimension, number | ''>>(getInitialMainScores);

  const handleSubScoreChange = (dimension: SubDimension, value: string) => {
  // Remove leading zeros and handle empty
  const cleaned = value.replace(/^0+/, '') || '';
  
  if (cleaned === '') {
    setSubScores((prev) => ({ ...prev, [dimension]: '' }));
  } else {
    const numValue = Math.min(100, Math.max(0, parseInt(cleaned) || 0));
    setSubScores((prev) => ({ ...prev, [dimension]: numValue }));
  }
};

 const handleMainScoreChange = (dimension: MainDimension, value: string) => {
  // Remove leading zeros and handle empty
  const cleaned = value.replace(/^0+/, '') || '';
  
  if (cleaned === '') {
    setMainScores((prev) => ({ ...prev, [dimension]: '' }));
  } else {
    const numValue = Math.min(100, Math.max(0, parseInt(cleaned) || 0));
    setMainScores((prev) => ({ ...prev, [dimension]: numValue }));
  }
};
  const handleSubmit = () => {
    // Convert empty strings to 50 (default) before submitting
    const processedSubScores: Record<SubDimension, number> = {} as Record<SubDimension, number>;
    Object.entries(subScores).forEach(([key, value]) => {
      processedSubScores[key as SubDimension] = value === '' ? 50 : value;
    });

    const processedMainScores: Record<MainDimension, number> = {} as Record<MainDimension, number>;
    Object.entries(mainScores).forEach(([key, value]) => {
      processedMainScores[key as MainDimension] = value === '' ? 50 : value;
    });

    updateScores(processedSubScores, processedMainScores, true);
  };

  // CSS class to hide number input spinners
  const inputClass = "w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

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
              <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700 border-b w-20">Puan</th>
              <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700 border-b">Alt Boyut</th>
              <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700 border-b w-20">Puan</th>
            </tr>
          </thead>
          <tbody>
            {dimensionEntries.map(([mainKey, mainDim], groupIdx) => (
              mainDim.subDimensions.map((subDim, dimIdx) => (
                <tr 
                  key={subDim.key} 
                  className={`${groupIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                >
                  {dimIdx === 0 && (
                    <>
                      <td 
                        className="px-4 py-2 text-sm font-medium text-gray-700 border-b align-middle"
                        rowSpan={mainDim.subDimensions.length}
                      >
                        {mainDim.name}
                      </td>
                      <td 
                        className="px-2 py-1 border-b align-middle"
                        rowSpan={mainDim.subDimensions.length}
                      >
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={mainScores[mainKey]}
                          onChange={(e) => handleMainScoreChange(mainKey, e.target.value)}
                          className={`${inputClass} font-medium`}
                          placeholder="50"
                        />
                      </td>
                    </>
                  )}
                  <td className="px-4 py-2 text-sm text-gray-600 border-b">
                    {subDim.name}
                  </td>
                  <td className="px-2 py-1 border-b">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={subScores[subDim.key]}
                      onChange={(e) => handleSubScoreChange(subDim.key, e.target.value)}
                      className={inputClass}
                      placeholder="50"
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
