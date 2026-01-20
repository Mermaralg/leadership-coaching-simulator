# Conversational Scoring System

## Overview
The coaching simulator now uses a **conversational score inference** approach instead of asking users to directly input numeric scores. The AI coach asks behavioral questions and infers personality scores based on the responses.

## Architecture

### 1. Scoring Rubric (`lib/scoring/rubric.ts`)
- Comprehensive behavioral indicators for all 15 sub-dimensions
- Currently supports two score bands (0-50, 51-100)
- **Future-proof design**: Can be expanded to 10-point granularity (0-10, 11-20, etc.)
- Each dimension includes:
  - **Behavioral anchors**: Observable traits at each score level
  - **Probing questions**: Sample questions to elicit behavioral evidence
  - **Generic probes**: Universal questions applicable to the dimension

### 2. Score Inference Service (`lib/scoring/scoreInference.ts`)
Core functions:
- `generateScoreInferencePrompt()`: Creates AI prompts with rubric context
- `parseScoreProposal()`: Extracts and validates AI-proposed scores
- `getProbesForDimension()`: Retrieves relevant behavioral questions
- `allDimensionsScored()`: Validates completion of all 15 dimensions
- `allScoresValidated()`: Checks if user has validated all scores

### 3. Type System (`lib/scoring/types.ts`)
Flexible structures:
```typescript
interface ScoreBand {
  min: number;
  max: number;
  label: string;
  anchors: string[];      // Behavioral indicators
  probes?: string[];      // Specific questions
}

interface ScoreProposal {
  dimension: SubDimension;
  proposedScore: number;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
  behavioralEvidence: string[];
}
```

### 4. UI Components

#### ScoreValidation (`components/coaching/ScoreValidation.tsx`)
Interactive component allowing users to:
- ✓ Accept AI-proposed scores
- ✎ Adjust scores with a slider
- ✗ Reject and request re-evaluation

#### ScoreSummary (`components/coaching/ScoreSummary.tsx`)
Visual dashboard showing:
- 5 main dimension averages
- 15 sub-dimension scores with progress bars
- Top 3 strengths (highest scores)
- Top 3 development opportunities (lowest scores)

## Workflow

### Stage 2: Conversational Assessment
1. AI asks 1-2 behavioral questions per dimension
2. User responds with specific examples
3. AI analyzes responses against rubric
4. AI proposes score (0-100, increments of 10) with reasoning
5. User validates, adjusts, or rejects
6. Process repeats for all 15 dimensions

### Updated AI Prompt (Stage 2)
The AI coach now:
- Asks behavioral questions one dimension at a time
- Waits for user responses before proposing scores
- Explains reasoning based on rubric criteria
- Allows user adjustment and re-evaluation
- Tracks progress through all 15 dimensions

## Scoring Granularity

### Current: 50-Point Bands
- **0-50**: Development area / Lower proficiency
- **51-100**: Strength area / Higher proficiency

### Future: 10-Point Bands (Ready to Implement)
Simply update the rubric with more granular bands:
- 0-10, 11-20, 21-30, ..., 91-100
- No code changes required - the system supports arbitrary bands

## Data Flow

```
User Response
    ↓
AI Analysis (uses SCORING_RUBRIC)
    ↓
ScoreProposal Generated
    ↓
ScoreValidation UI
    ↓
User Validates/Adjusts
    ↓
Score Stored in CoachingContext.dimensionScores
    ↓
ScoreSummary (Stage 6)
```

## Context Management

`CoachingContext` now tracks:
```typescript
dimensionScores: {
  [dimension: string]: {
    score: number;
    validated: boolean;
    aiProposal?: ScoreProposal;
  }
}
```

Methods:
- `updateDimensionScore()`: Save AI-proposed score
- `validateDimensionScore()`: Mark score as user-validated
- `dimensionScores`: Access all scores for visualization

## Integration Points

### Chat Mode
- Stage 2 uses behavioral questioning approach
- AI coach references rubric during conversation
- Score proposals embedded in chat flow
- Validation happens conversationally

### Slider Mode
- Unaffected by these changes
- Still supports direct numeric input
- Can coexist with chat mode

## Benefits

1. **More Natural**: Users describe behavior instead of estimating numbers
2. **More Accurate**: Behavioral evidence grounds the assessment
3. **Transparent**: AI explains reasoning for each score
4. **Adjustable**: Users can fine-tune AI proposals
5. **Future-Ready**: Easily scalable to finer granularity

## Next Steps (Not Yet Implemented)

1. Integrate ScoreValidation into ChatInterface
2. Add conversation history tracking for score inference
3. Implement Stage 6 integration with ScoreSummary
4. Add persistence for validated scores
5. Create scoring analytics/insights
