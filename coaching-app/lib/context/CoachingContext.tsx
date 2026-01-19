'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  CoachingSession,
  CoachingStage,
  SubDimension,
  PersonalityProfile,
  StrengthItem,
  DevelopmentItem,
} from '@/types/coaching';
import { analyzeStrengths, analyzeDevelopmentAreas } from '../utils/scoring';

interface CoachingContextType {
  session: CoachingSession | null;
  startSession: (name: string) => void;
  updateScores: (scores: Record<SubDimension, number>, moveToNextStage?: boolean) => void;
  selectDevelopmentAreas: (areas: SubDimension[]) => void;
  nextStage: () => void;
  previousStage: () => void;
  completeSession: () => void;
}

const CoachingContext = createContext<CoachingContextType | undefined>(undefined);

export function CoachingProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CoachingSession | null>(null);

  const startSession = (name: string) => {
    const newSession: CoachingSession = {
      id: Date.now().toString(),
      participantName: name,
      currentStage: 2, // Start at stage 2 (scores) since stage 1 is the welcome screen
      startedAt: new Date(),
    };
    setSession(newSession);
  };

  const updateScores = (scores: Record<SubDimension, number>, moveToNextStage = false) => {
    console.log('CoachingContext.updateScores called with:', scores, 'moveToNextStage:', moveToNextStage);
    console.log('Current session:', session);
    
    if (!session) {
      console.error('No session exists!');
      return;
    }

    const profile: PersonalityProfile = {
      participantName: session.participantName,
      scores,
      createdAt: new Date(),
    };
    console.log('Created profile:', profile);

    const strengths = analyzeStrengths(scores);
    console.log('Analyzed strengths:', strengths.length, strengths);
    
    const developmentAreas = analyzeDevelopmentAreas(scores);
    console.log('Analyzed development areas:', developmentAreas.length);

    const newStage = moveToNextStage ? Math.min(6, session.currentStage + 1) as CoachingStage : session.currentStage;

    const updatedSession = {
      ...session,
      currentStage: newStage,
      profile,
      strengths,
      developmentAreas,
    };
    console.log('Updating session to:', updatedSession);
    
    setSession(updatedSession);
  };

  const selectDevelopmentAreas = (areas: SubDimension[]) => {
    if (!session) return;
    setSession({
      ...session,
      selectedDevelopmentAreas: areas,
    });
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
        startSession,
        updateScores,
        selectDevelopmentAreas,
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
