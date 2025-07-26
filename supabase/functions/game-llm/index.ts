// @deno-types="https://deno.land/x/xhr@0.1.0/mod.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Declare Deno namespace for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Common API configuration
const CLAUDE_API_CONFIG = {
  model: 'claude-3-haiku-20240307',  // Using Haiku - cheaper but still accurate for simple tasks
  baseUrl: 'https://api.anthropic.com/v1/messages',
  headers: {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01'
  }
};

// Performance and cost logging
interface CostMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
}

const COST_PER_1K_TOKENS = {
  input: 0.00025,   // $0.25/1K tokens for Haiku input
  output: 0.00125,  // $1.25/1K tokens for Haiku output
};

const logPerformance = (action: string, startTime: number, metrics?: CostMetrics) => {
  const duration = Math.round(performance.now() - startTime);
  let message = `[Performance] ${action}: ${duration}ms`;
  
  if (metrics) {
    const cost = metrics.cost.toFixed(4);
    message += `\n[Tokens] Prompt: ${metrics.promptTokens}, Completion: ${metrics.completionTokens}, Total: ${metrics.totalTokens}`;
    message += `\n[Cost] $${cost}`;
  }
  
  console.log(message);
  return duration;
};

const calculateCost = (data: any): CostMetrics => {
  const promptTokens = data.usage?.input_tokens || 0;
  const completionTokens = data.usage?.output_tokens || 0;
  const totalTokens = promptTokens + completionTokens;
  
  const cost = 
    (promptTokens / 1000) * COST_PER_1K_TOKENS.input +
    (completionTokens / 1000) * COST_PER_1K_TOKENS.output;
    
  return {
    promptTokens,
    completionTokens,
    totalTokens,
    cost
  };
};

// Request timeout configuration
const TIMEOUT_MS = 5000; // 5 seconds max

// Create a new controller for each request
const createRequestController = () => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), TIMEOUT_MS);
  return controller;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const { action, userInput, questionCount, secretItem } = await req.json();
    
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
    if (!claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    // Add API key to config
    CLAUDE_API_CONFIG.headers['X-API-Key'] = claudeApiKey;

    const startTime = performance.now();
    let response;

    try {
      if (action === 'select_secret_item') {
        response = await selectSecretItem();
      } else if (action === 'evaluate_input') {
        response = await evaluateInput(userInput, questionCount, secretItem);
      } else {
        throw new Error('Invalid action');
      }

      const endTime = performance.now();
      console.log(`Request completed in ${Math.round(endTime - startTime)}ms`);

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after ' + TIMEOUT_MS + 'ms');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in game-llm function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.name === 'AbortError' ? 408 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } finally {
    clearTimeout(timeoutId);
  }
});

async function selectSecretItem(): Promise<{ content: string }> {
  const startTime = performance.now();
  logPerformance('selectSecretItem:start', startTime);
  const controller = createRequestController();

  const response = await fetch(CLAUDE_API_CONFIG.baseUrl, {
    method: 'POST',
    headers: CLAUDE_API_CONFIG.headers,
    body: JSON.stringify({
      model: CLAUDE_API_CONFIG.model,
      max_tokens: 20,  // Allow a bit more tokens to ensure we get a complete word
      temperature: 0.7,  // Add some randomness for variety
      messages: [{
        role: 'user',
        content: `You are selecting an item for a game of 20 Questions.

Rules for item selection:
1. Choose ONE common everyday object
2. Must be something a kindergartener would know
3. Must be concrete and physical (no abstract concepts)
4. Must be a single, specific item (not a category)
5. Examples: apple, chair, car, dog, book, ball

Respond with ONLY the item name in lowercase, no punctuation or explanation.`
      }]
    }),
    signal: controller.signal
  });
  
  logPerformance('selectSecretItem:apiCall', startTime);

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json();
  const metrics = calculateCost(data);
  logPerformance('selectSecretItem:complete', startTime, metrics);
  return { content: data.content[0].text.trim().toLowerCase() };
}

async function evaluateInput(userInput: string, questionCount: number, secretItem: string): Promise<any> {
  const startTime = performance.now();
  logPerformance('evaluateInput:start', startTime);
  const controller = createRequestController();

  // Comprehensive but concise system prompt
  const systemPrompt = `Secret item: "${secretItem}"
You must respond with EXACTLY one of these words: "Yes", "No", or "Unsure"

For guesses: "Yes" if exact match/synonym, "No" if wrong
For questions: "Yes"/"No" if certain, "Unsure" if ambiguous/unclear`;

  const response = await fetch(CLAUDE_API_CONFIG.baseUrl, {
    method: 'POST',
    headers: CLAUDE_API_CONFIG.headers,
    body: JSON.stringify({
      model: CLAUDE_API_CONFIG.model,
      max_tokens: 100,  // Allow more tokens for accurate responses
      temperature: 0,   // Keep deterministic for consistency
      messages: [{
        role: 'user',
        content: `${systemPrompt}\n\nQ${questionCount + 1}: "${userInput}"`
      }]
    }),
    signal: controller.signal
  });
  
  logPerformance('evaluateInput:apiCall', startTime);

  if (!response.ok) {
    const error = `Claude API error: ${response.statusText}`;
    logPerformance('evaluateInput:error', startTime);
    throw new Error(error);
  }

  const data = await response.json();
  const metrics = calculateCost(data);
  logPerformance('evaluateInput:parseResponse', startTime, metrics);
  
  const content = data.content[0].text.trim();
  let result;

  // Process the one-word response
  const answer = content.trim().toLowerCase();
  
  // Check if it's a guess by looking for "is it" or similar patterns
  const isGuess = userInput.toLowerCase().match(/\b(is it|could it be|i think it'?s|my guess is|is the item)\b/);
  
  if (isGuess) {
    result = {
      type: 'guess_evaluation',
      content: answer === 'yes' ? 'Correct! You got it!' : 'No, that\'s not correct.',
      isCorrect: answer === 'yes'
    };
    logPerformance('evaluateInput:processGuess', startTime);
  } else {
    if (answer === 'unsure') {
      result = {
        type: 'clarification',
        content: 'Could you be more specific?'
      };
      logPerformance('evaluateInput:processClarification', startTime);
    } else {
      result = {
        type: 'answer',
        content: answer === 'yes' ? 'Yes' : 'No'
      };
      logPerformance('evaluateInput:processAnswer', startTime);
    }
  }

  logPerformance('evaluateInput:complete', startTime);
  return result;
}