# Architecture Overview

This document provides a high-level overview of the project's architecture, detailing the frontend, backend, and the communication between them.

## Frontend

The frontend is a single-page application (SPA) built with **React** and **Vite**. The UI is constructed using a combination of custom components and a design system based on **Shadcn UI** and **Tailwind CSS**.

- **Components**: The UI is broken down into reusable components, which are organized into general-purpose UI elements and more specific, application-level components.
- **State Management**: The application uses React hooks for state management, with custom hooks created to handle specific logic such as game state, speech recognition, and text-to-speech.
- **Routing**: The application uses a file-based routing system, with each page component corresponding to a specific route.

## Backend

The backend is powered by **Supabase**, which provides a suite of tools including a PostgreSQL database, authentication, and serverless functions.

- **Database**: The application uses Supabase's PostgreSQL database to store data. The schema is defined and managed through the Supabase dashboard.
- **Serverless Functions**: The core game logic is encapsulated in a serverless function located in the `supabase/functions/game-llm` directory. This function is responsible for interacting with the large language model (LLM) and returning the game state to the frontend.

## Communication

The frontend and backend communicate via API calls:

- The frontend makes requests to the Supabase serverless function to advance the game state.
- The Supabase client library is used to interact with the database and other Supabase services.

This architecture allows for a clean separation of concerns between the frontend and backend, with the frontend responsible for the user interface and the backend handling the core game logic and data storage.
