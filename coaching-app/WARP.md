# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **Leadership Coaching Simulator** built with Next.js 16, React 19, and TypeScript. The application implements a 6-stage coaching workflow based on the 5D Personality Model (based on Big Five personality dimensions), guiding participants through personality assessment, strength identification, development area analysis, and action planning.

The project is bilingual (Turkish/English) and focuses on leadership development through structured coaching conversations.

## Development Commands

### Core Commands
- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Create production build
- `npm start` - Run production server
- `npm run lint` - Run ESLint on the codebase

### Installation
- `npm install` - Install all dependencies

## Code Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TypeScript 5, Tailwind CSS v4
- **Fonts**: Geist Sans & Geist Mono (via next/font)
- **Linting**: ESLint with Next.js config

### Directory Structure
- `app/` - Next.js App Router pages and layouts
- `components/` - React components (organized by domain)
  - `coaching/` - Coaching-specific UI components
  - `ui/` - Reusable UI components
- `lib/` - Utility functions and data access
  - `data/` - Data providers and constants
  - `utils/` - Helper functions
- `types/` - TypeScript type definitions
- `public/` - Static assets

### Core Domain Model (5D Personality Model)

The application is built around a 5-dimensional personality framework with 15 sub-dimensions:

**Main Dimensions:**
1. **Duygusal Denge** (Emotional Stability) - duygu_kontrolu, stresle_basa_cikma, ozguven
2. **Dikkat ve Düzen** (Conscientiousness) - risk_duyarlilik, kontrolculuk, kural_uyumu
3. **Dışadönüklük** (Extraversion) - one_cikmayi_seven, sosyallik, basari_yonelimi
4. **Dengeli İlişki** (Agreeableness) - iliski_yonetimi, iyi_gecinme, kacinma
5. **Deneyime Açıklık** (Openness) - yenilikcilik, ogrenme_yonelimi, merak

All types are defined in `types/coaching.ts`, which serves as the single source of truth for the domain model.

### 6-Stage Coaching Workflow

The application implements a structured coaching flow (`CoachingStage` type: 1-6):

1. **Tanışma ve Hazırlık** - Introduction and setup
2. **Kişilik Puanları İsteme** - Collect personality scores (5 main + 15 sub-dimensions)
3. **Güçlü Özellikler** - Identify strengths (both high and low scores can be strengths)
4. **Gelişim Alanındaki Özellikler** - Identify development areas
5. **Yapılması Gerekenler** - Create action items
6. **Model Çözüm ve Kapanış** - Review, model solution, and closure

### Key Architectural Patterns

**Type System:**
- Strong typing with TypeScript strict mode enabled
- Union types for dimensions and stages ensure type safety
- `PersonalityProfile`, `CoachingSession`, `StrengthItem`, `DevelopmentItem`, `ActionItem` are core domain types
- Import path alias `@/*` maps to project root

**Scoring Philosophy:**
- Scores range 0-100
- Both HIGH (80-100) and LOW (0-20) scores can indicate strengths OR development areas
- The context determines interpretation, not just the score value
- Minimum 4-10 items recommended for both strengths and development areas

**Data Flow:**
- Personality scores → Analysis (strengths/development) → Action items
- Session state tracks progress through the 6 stages
- Parent project directory (`../`) contains reference PDFs with coaching guidance

## Configuration

### Path Aliases
- `@/*` resolves to project root (configured in `tsconfig.json`)

### Styling
- Tailwind CSS v4 with PostCSS
- Dark mode support via `dark:` prefixes
- Geist font variables: `--font-geist-sans`, `--font-geist-mono`

### Linting
- ESLint v9 with Next.js Core Web Vitals config
- TypeScript-aware linting enabled
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Important Context

### Related Files (Parent Directory)
The parent directory `/Users/aliarsan/projects/leadership-coaching-simulator/` contains:
- `README.md` - Full Turkish coaching instructions and workflow details
- `docs/` - PDF references for strengths, development areas, and action recommendations
- `src/` - Possibly legacy or alternative implementation
- `data/` - Source data files

### Development Philosophy
- Bilingual support (Turkish primary, English secondary)
- Non-judgmental coaching approach
- Balance between encouragement and confronting reality
- Encourage participant questions and self-reflection
- Avoid information overload - ask participant to select 2 focus areas from development items

### Testing
No test framework is currently configured in `package.json`. When adding tests, check project conventions first.
