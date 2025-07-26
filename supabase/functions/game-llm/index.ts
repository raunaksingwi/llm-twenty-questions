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
1. Determine if the user input is a GUESS or a QUESTION
2. For GUESSES: 
   - If correct (including synonyms), respond: {"type": "guess_evaluation", "content": "Correct! The item was [item]. Well done!", "isCorrect": true}
   - If incorrect, respond: {"type": "guess_evaluation", "content": "No, that's not correct.", "isCorrect": false}
3. For QUESTIONS: 
   - If you can answer with certainty, respond with EXACTLY "Yes" or "No" only
   - If you cannot answer yes/no with certainty, respond: {"type": "clarification", "content": "I'm not sure about that. Could you ask a more specific question?"}

GUESS DETECTION: User is making a guess if they:
- Say an object name directly (like "apple", "chair")
- Say "is it X?" or "it's X" 
- Use phrases like "I think it's", "my guess is"
- Seem to be naming a specific item rather than asking about properties

QUESTION DETECTION: User is asking a question if they:
- Ask about properties: "Is it big?", "Can you eat it?", "Is it made of metal?"
- Ask about categories: "Is it an animal?", "Is it found in a house?"
- Ask yes/no questions about characteristics

UNCERTAIN RESPONSES: Use clarification when:
- Question is too vague or ambiguous
- Question asks about subjective properties that don't have clear yes/no answers
- Question is about complex comparisons that depend on context
- You genuinely cannot determine a clear yes/no answer

SYNONYM HANDLING: Accept reasonable synonyms and variations:
- "car" = "automobile", "vehicle", "auto"
- "dog" = "puppy", "canine", "hound"
- Consider common alternative names and related terms

IMPORTANT: 
- Guesses and clear yes/no questions count toward the 20-question limit
- Clarification responses do NOT count toward the question limit
- Game ends when: player guesses correctly (win) OR uses all 20 questions (lose)

Respond in JSON format for guesses and clarifications, plain "Yes"/"No" for clear questions.`;

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