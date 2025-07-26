# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

**Development**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

**Dependencies**
- `npm i` - Install dependencies

## Architecture

This is a "20 Questions" game built with React + TypeScript where users guess items by asking yes/no questions.

**Frontend Stack**
- Vite + React 18 + TypeScript
- shadcn/ui components with Radix UI primitives
- Tailwind CSS for styling
- React Query for data fetching
- React Router for navigation

**Backend**
- Supabase Edge Functions (Deno runtime)
- Claude API integration for game logic
- Single endpoint: `/functions/v1/game-llm`

**Game Flow Architecture**
1. `src/pages/Index.tsx` - Main game page with phase management
2. `src/hooks/useGameLogic.ts` - Core game state and logic
3. `src/services/llmService.ts` - Frontend service for backend communication
4. `supabase/functions/game-llm/index.ts` - Backend LLM integration

**Game Phases**
- `intro` - Welcome screen
- `waiting` - Loading new game
- `playing` - Active gameplay
- `won/lost` - End screens

**Key Components**
- `GameIntro` - Start screen
- `ChatInterface` - Main question/answer interface
- `GameHeader` - Shows question count/progress
- `GameEndScreen` - Win/lose results
- `AudioManager` - Sound effects for game events

**State Management**
All game state is managed in `useGameLogic.ts` hook:
- Game phase transitions
- Question counting (max 20)
- Chat history with typed entries
- Secret item tracking
- Loading states

**LLM Integration**
Backend handles two main actions:
- `select_secret_item` - Claude picks a simple item
- `evaluate_input` - Claude determines if input is question/guess and responds appropriately

**API Communication**
Frontend uses `LLMGameService` class to communicate with Supabase Edge Function, which then calls Claude API with structured prompts for consistent game behavior.

**UI Patterns**
- Uses shadcn/ui component library consistently
- Toast notifications for game events
- Responsive design with max-width containers
- Loading states throughout user interactions