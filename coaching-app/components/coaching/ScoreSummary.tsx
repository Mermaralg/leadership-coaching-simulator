'use client';

import React from 'react';
import { SubDimension } from '@/types/coaching';
import { DimensionScores } from '@/lib/scoring/scoreInference';
import { SCORING_RUBRIC } from '@/lib/scoring/rubric';

interface ScoreSummaryProps {
  scores: DimensionScores;
}

interface MainDimension {
  name: string;
  subDimensions: SubDimension[];
}

const MAIN_DIMENSIONS: MainDimension[] = [
  {
    name: 'Duygusal Denge',
    subDimensions: ['duygu_kontrolu', 'stresle_basa_cikma', 'ozguven'],
  },
  {
    name: 'Dikkat ve Düzen',
    subDimensions: ['risk_duyarlilik', 'kontrolculuk', 'kural_uyumu'],
  },
  {
    name: 'Dışadönüklük',
    subDimensions: ['one_cikmayi_seven', 'sosyallik', 'basari_yonelimi'],
  },
  {
    name: 'Dengeli İlişki',
    subDimensions: ['iliski_yonetimi', 'iyi_gecinme', 'kacinma'],
  },
  {
    name: 'Deneyime Açıklık',
    subDimensions: ['yenilikcilik', 'ogrenme_yonelimi', 'merak'],
  },
];

export function ScoreSummary({ scores }: ScoreSummaryProps) {
  const calculateMainDimensionScore = (subDims: SubDimension[]): number => {
    const validScores = subDims
      .map((dim) => scores[dim]?.score)
      .filter((s) => s !== undefined) as number[];
    
    if (validScores.length === 0) return 0;
    return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
  };

  const getScoreColor = (score: number): string => {
    if (score < 30) return 'bg-red-500';
    if (score < 50) return 'bg-orange-500';
    if (score < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getScoreLabel = (score: number): string => {
    if (score < 30) return 'Gelişim Alanı';
    if (score < 50) return 'Orta-Düşük';
    if (score < 70) return 'Orta-Yüksek';
    return 'Güçlü Alan';
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">5D Kişilik Profiliniz</h2>
        <p className="text-blue-100">
          İşte liderlik yolculuğunuzun haritası
        </p>
      </div>

      {MAIN_DIMENSIONS.map((mainDim) => {
        const mainScore = calculateMainDimensionScore(mainDim.subDimensions);
        
        return (
          <div key={mainDim.name} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{mainDim.name}</h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{mainScore}</div>
                <div className="text-xs text-gray-500">{getScoreLabel(mainScore)}</div>
              </div>
            </div>

            {/* Main dimension score bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className={`h-3 rounded-full ${getScoreColor(mainScore)} transition-all duration-500`}
                style={{ width: `${mainScore}%` }}
              />
            </div>

            {/* Sub-dimensions */}
            <div className="space-y-3">
              {mainDim.subDimensions.map((subDim) => {
                const scoreData = scores[subDim];
                if (!scoreData) return null;

                const rubricDim = SCORING_RUBRIC[subDim];
                
                return (
                  <div key={subDim} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {rubricDim.title}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {scoreData.score}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getScoreColor(scoreData.score)} transition-all duration-500`}
                          style={{ width: `${scoreData.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-3">📊 Önemli Bulgular</h3>
        <div className="space-y-2">
          {Object.entries(scores)
            .sort(([, a], [, b]) => b.score - a.score)
            .slice(0, 3)
            .map(([dim, data]) => {
              const rubricDim = SCORING_RUBRIC[dim as SubDimension];
              return (
                <div key={dim} className="flex items-center gap-2">
                  <span className="text-2xl">💪</span>
                  <span className="text-sm">
                    <span className="font-semibold">{rubricDim.title}</span> - En güçlü özelliklerinizden ({data.score})
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-3">🌱 Gelişim Fırsatları</h3>
        <div className="space-y-2">
          {Object.entries(scores)
            .sort(([, a], [, b]) => a.score - b.score)
            .slice(0, 3)
            .map(([dim, data]) => {
              const rubricDim = SCORING_RUBRIC[dim as SubDimension];
              return (
                <div key={dim} className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <span className="text-sm">
                    <span className="font-semibold">{rubricDim.title}</span> - Gelişim potansiyeli ({data.score})
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
