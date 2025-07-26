import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userInput, questionCount, secretItem } = await req.json();
    
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
    if (!claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    let response;

    if (action === 'select_secret_item') {
      response = await selectSecretItem(claudeApiKey);
    } else if (action === 'evaluate_input') {
      response = await evaluateInput(claudeApiKey, userInput, questionCount, secretItem);
    } else {
      throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in game-llm function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function selectSecretItem(apiKey: string): Promise<{ content: string }> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: `You are the game host for "20 Questions". Select ONE common, everyday item that a kindergartener would know from picture books (like: apple, chair, car, dog, book, ball, etc.).

CRITICAL: Respond with ONLY the item name in lowercase, nothing else. No punctuation, no explanations.

Choose something concrete and physical that exists in the real world.`
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json();
  return { content: data.content[0].text.trim().toLowerCase() };
}

async function evaluateInput(apiKey: string, userInput: string, questionCount: number, secretItem: string): Promise<any> {
  const systemPrompt = `You are the host of "20 Questions" game. The secret item is: ${secretItem}

CRITICAL RULES:
1. For YES/NO QUESTIONS: Answer with EXACTLY "Yes" or "No" only
2. For GUESSES: If they guess the correct item or a synonym, respond with exactly: {"type": "guess_evaluation", "content": "Correct! The item was [item]. Well done!", "isCorrect": true}
3. For WRONG GUESSES: Respond with exactly: {"type": "guess_evaluation", "content": "No, that's not correct.", "isCorrect": false}
4. For INVALID INPUT: Ask for a yes/no question

GUESS DETECTION: User is making a guess if they:
- Say an object name without "?" (like "apple", "chair")
- Say "is it X?" or "it's X" 
- Use phrases like "I think it's", "my guess is"

SYNONYM HANDLING: Accept reasonable synonyms and variations:
- "car" = "automobile", "vehicle"
- "dog" = "puppy", "canine" 
- "apple" = "fruit" (if apple is the answer)
- Consider common alternative names

QUESTION EXAMPLES that get Yes/No:
- "Is it big?"
- "Can you eat it?"
- "Is it made of metal?"
- "Do you find it in a house?"

Respond in JSON format for guesses, plain "Yes"/"No" for questions.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `${systemPrompt}

Question #${questionCount + 1}: "${userInput}"`
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0].text.trim();

  // Try to parse as JSON first (for guesses)
  try {
    return JSON.parse(content);
  } catch {
    // If not JSON, treat as yes/no answer
    const isYes = content.toLowerCase().includes('yes');
    return {
      type: 'answer',
      content: isYes ? 'Yes' : 'No'
    };
  }
}