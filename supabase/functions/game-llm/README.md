# Game LLM Function

This directory contains the serverless function that handles the game's core logic by interacting with the large language model (LLM).

## Organization

- **`index.ts`**: This file contains the main entry point for the serverless function. It receives requests from the frontend, communicates with the LLM to get the next game state, and sends the response back to the client.
