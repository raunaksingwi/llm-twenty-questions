# Twenty Questions Game

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username_/your_project_name.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Start the development server
   ```sh
   npm run dev
   ```






# Project Index

This document provides an index of the important directories in this project. Each directory has a `README.md` file that explains the code within it and how it is organized.

## Source Code (`src/`)

The `src/` directory contains the source code for the frontend application.

- **[`src/components/`](./src/components/README.md)**: This directory houses the reusable React components that form the user interface of the application. It is further organized into general-purpose UI components and application-level components.

- **[`src/hooks/`](./src/hooks/README.md)**: This directory contains custom React hooks that encapsulate and manage stateful logic, side effects, and other reusable behaviors.

- **[`src/integrations/supabase/`](./src/integrations/supabase/README.md)**: This directory handles the integration with Supabase, which is used as the backend for the application. It includes the Supabase client and TypeScript types for the database.

- **[`src/lib/`](./src/lib/README.md)**: This directory contains utility functions and helper modules that are used across the application.

- **[`src/pages/`](./src/pages/README.md)**: This directory contains the top-level components that represent the different pages of the application.

- **[`src/services/`](./src/services/README.md)**: This directory contains modules that are responsible for interacting with external services and APIs, such as the large language model (LLM).

- **[`src/types/`](./src/types/README.md)**: This directory contains TypeScript type definitions and interfaces that are used throughout the application.

## Supabase (`supabase/`)

The `supabase/` directory contains the backend code for the application, which is built on Supabase.

- **[`supabase/functions/game-llm/`](./supabase/functions/game-llm/README.md)**: This directory contains the serverless function that handles the game's core logic by interacting with the large language model (LLM).