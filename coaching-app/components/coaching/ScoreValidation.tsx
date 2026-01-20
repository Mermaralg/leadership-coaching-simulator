'use client';

import React, { useState } from 'react';
import { SubDimension } from '@/types/coaching';
import { ScoreProposal } from '@/lib/scoring/scoreInference';
import { SCORING_RUBRIC } from '@/lib/scoring/rubric';

interface ScoreValidationProps {
  proposal: ScoreProposal;
  onValidate: (adjustedScore?: number) => void;
  onReject: () => void;
}

export function ScoreValidation({
  proposal,
  onValidate,
  onReject,
}: ScoreValidationProps) {
  const [adjustedScore, setAdjustedScore] = useState<number>(proposal.proposedScore);
  const [isAdjusting, setIsAdjusting] = useState(false);

  const dimension = SCORING_RUBRIC[proposal.dimension];

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'Yüksek Güven';
      case 'medium':
        return 'Orta Güven';
      case 'low':
        return 'Düşük Güven';
      default:
        return 'Belirsiz';
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{dimension.title}</h4>
          <p className={`text-sm ${getConfidenceColor(proposal.confidence)}`}>
            {getConfidenceLabel(proposal.confidence)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {isAdjusting ? adjustedScore : proposal.proposedScore}
          </div>
          <div className="text-xs text-gray-500">0-100 ölçeği</div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-700 mb-2">
          <span className="font-medium">Değerlendirme:</span> {proposal.reasoning}
        </p>
        {proposal.behavioralEvidence.length > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Gözlemler:</span>
            <ul className="list-disc list-inside mt-1 ml-2">
              {proposal.behavioralEvidence.map((evidence, idx) => (
                <li key={idx}>{evidence}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {isAdjusting && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Puanı Ayarla
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={adjustedScore}
            onChange={(e) => setAdjustedScore(parseInt(e.target.value))}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {!isAdjusting ? (
          <>
            <button
              onClick={() => onValidate()}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              ✓ Uygun
            </button>
            <button
              onClick={() => setIsAdjusting(true)}
              className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              ✎ Ayarla
            </button>
            <button
              onClick={onReject}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              ✗ Tekrar Sor
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                onValidate(adjustedScore);
                setIsAdjusting(false);
              }}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Kaydet ({adjustedScore})
            </button>
            <button
              onClick={() => {
                setAdjustedScore(proposal.proposedScore);
                setIsAdjusting(false);
              }}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              İptal
            </button>
          </>
        )}
      </div>
    </div>
  );
}
