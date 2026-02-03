'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  CoachingSession,
  CoachingStage,
  SubDimension,
  PersonalityProfile,
} from '@/types/coaching';
import { analyzeStrengths, analyzeDevelopmentAreas } from '../utils/scoring';
import { DimensionScores, ScoreProposal } from '../scoring/scoreInference';

// Coach attitude settings (like TARS from Interstellar)
export interface CoachAttitude {
  directness: number;      // 0-100: How directly the coach points out issues
  challengeLevel: number;  // 0-100: How much the coach challenges/pushes back
  growthFocus: number;     // 0-100: Balance between celebrating strengths vs pushing growth
}

export const DEFAULT_ATTITUDE: CoachAttitude = {
  directness: 70,      // Fairly direct
  challengeLevel: 60,  // Moderate challenge
  growthFocus: 60,     // Slightly more growth-focused
};

interface CoachingContextType {
  session: CoachingSession | null;
  dimensionScores: DimensionScores;
  coachAttitude: CoachAttitude;
  startSession: (name: string) => void;
  updateScores: (scores: Record<SubDimension, number>, moveToNextStage?: boolean) => void;
  updateDimensionScore: (dimension: SubDimension, score: number, proposal?: ScoreProposal) => void;
  validateDimensionScore: (dimension: SubDimension) => void;
  selectDevelopmentAreas: (areas: SubDimension[]) => void;
  setCoachAttitude: (attitude: CoachAttitude) => void;
  nextStage: () => void;
  previousStage: () => void;
  completeSession: () => void;
}

const CoachingContext = createContext<CoachingContextType | undefined>(undefined);

export function CoachingProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CoachingSession | null>(null);
  const [dimensionScores, setDimensionScores] = useState<DimensionScores>({});
  const [coachAttitude, setCoachAttitudeState] = useState<CoachAttitude>(DEFAULT_ATTITUDE);

  const startSession = (name: string) => {
    const newSession: CoachingSession = {
      id: Date.now().toString(),
      participantName: name,
      currentStage: 2,
      startedAt: new Date(),
    };
    setSession(newSession);
    setDimensionScores({});
  };

  const updateScores = (scores: Record<SubDimension, number>, moveToNextStage = false) => {
    if (!session) return;

    const profile: PersonalityProfile = {
      participantName: session.participantName,
      scores,
      createdAt: new Date(),
    };

    const strengths = analyzeStrengths(scores);
    const developmentAreas = analyzeDevelopmentAreas(scores);

    const newStage = moveToNextStage ? Math.min(6, session.currentStage + 1) as CoachingStage : session.currentStage;

    setSession({
      ...session,
      currentStage: newStage,
      profile,
      strengths,
      developmentAreas,
    });
  };

  const selectDevelopmentAreas = (areas: SubDimension[]) => {
    if (!session) return;
    setSession({
      ...session,
      selectedDevelopmentAreas: areas,
    });
  };

  const setCoachAttitude = (attitude: CoachAttitude) => {
    setCoachAttitudeState(attitude);
  };

  const nextStage = () => {
    if (!session) return;
    const newStage = Math.min(6, session.currentStage + 1) as CoachingStage;
    setSession({
      ...session,
      currentStage: newStage,
    });
  };

  const previousStage = () => {
    if (!session) return;
    const newStage = Math.max(1, session.currentStage - 1) as CoachingStage;
    setSession({
      ...session,
      currentStage: newStage,
    });
  };

  const updateDimensionScore = (
    dimension: SubDimension,
    score: number,
    proposal?: ScoreProposal
  ) => {
    setDimensionScores((prev) => ({
      ...prev,
      [dimension]: {
        score,
        validated: false,
        aiProposal: proposal,
      },
    }));
  };

  const validateDimensionScore = (dimension: SubDimension) => {
    setDimensionScores((prev) => {
      if (!prev[dimension]) return prev;
      return {
        ...prev,
        [dimension]: {
          ...prev[dimension],
          validated: true,
        },
      };
    });
  };

  const completeSession = () => {
    if (!session) return;
    setSession({
      ...session,
      completedAt: new Date(),
    });
  };

  return (
    <CoachingContext.Provider
      value={{
        session,
        dimensionScores,
        coachAttitude,
        startSession,
        updateScores,
        updateDimensionScore,
        validateDimensionScore,
        selectDevelopmentAreas,
        setCoachAttitude,
        nextStage,
        previousStage,
        completeSession,
      }}
    >
      {children}
    </CoachingContext.Provider>
  );
}

export function useCoaching() {
  const context = useContext(CoachingContext);
  if (context === undefined) {
    throw new Error('useCoaching must be used within a CoachingProvider');
  }
  return context;
}
