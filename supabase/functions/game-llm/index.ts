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

const items = [
  'corn', 'muffin', 'popcorn', 'stamp', 'cashew', 'toast', 'fridge', 'cooler', 'apple', 'water',
  'crib', 'purse', 'truck', 'cabbage', 'mango', 'jacket', 'plant', 'owl', 'glue', 'shampoo', 'kettle', 'chalkboard',
  'bagel', 'strap', 'grill', 'cranberry', 'blueberry', 'dolphin', 'blanket', 'toaster', 'arm', 'envelope',
  'pillow', 'stone', 'cereal', 'potato', 'ruler', 'mustard', 'axe', 'snail', 'pan', 'swimsuit',
  'mop', 'zipper', 'door', 'book', 'sandwich', 'tissue', 'box', 'screw', 'bell', 'fries', 'basket', 'buckle', 'juice',
  'cup', 'grape', 'towel', 'candle', 'scissors', 'milk', 'boat', 'monkey', 'ticket', 'swing', 'bucket', 'duster', 'cookie', 'filter',
  'backpack', 'club', 'desk', 'ear', 'soda', 'skate', 'skin', 'camera', 'microwave', 'block', 'mirror', 'mouse', 'boots', 'lemon',
  'cauliflower', 'whistle', 'gate', 'brush', 'ice', 'vest', 'flagpole', 'nest', 'fountain', 'net', 'soap', 'knife', 'coin', 'jam',
  'binder', 'soup', 'bottle', 'leg', 'tomato', 'glasses', 'cupcake', 'toe', 'glove', 'honey', 'bag', 'coat', 'thimble',
  'board', 'apron', 'fork', 'pouch', 'bat', 'tie', 'toolbox', 'dial', 'flower', 'calendar', 'face', 'flashlight', 'bed', 'loop', 'kite',
  'rabbit', 'shell', 'bush', 'ceiling', 'butter', 'sauce', 'belt', 'sheep', 'nail', 'button', 'string', 'coffee', 'lawnmower',
  'helmet', 'racquet', 'picture', 'finger', 'chips', 'pig', 'saw', 'spoon', 'pepper', 'lid', 'mask', 'dustpan', 'remote', 'stroller', 'ring', 'necklace',
  'toilet', 'hair', 'chair', 'vacuum', 'rice', 'hotdog', 'whale', 'ladder', 'shoe', 'grapefruit', 'sponge', 'window', 'flour', 'curtain', 'bread',
  'mouth', 'pecan', 'freezer', 'date', 'tiger', 'ball', 'tea', 'pencil', 'almond', 'yogurt', 'folder', 'parsley', 'pizza', 'clipboard',
  'shoulder', 'mixer', 'bowl', 'spider', 'mailbox', 'tooth', 'robot', 'feather', 'cake', 'mug', 'crab', 'napkin', 'bee', 'keychain', 'bike', 'orange',
  'onion', 'car', 'cat', 'watch', 'closet', 'snap', 'grass', 'strawberry', 'carrot', 'chain', 'pinecone', 'oven', 'easel', 'can', 'trashcan',
  'berry', 'shirt', 'dress', 'wall', 'cap', 'tray', 'cheese', 'stapler', 'blender', 'magnet', 'shovel', 'pajamas', 'fish', 'bird', 'yarn', 'rake',
  'slipper', 'velcro', 'puddle', 'chickpea', 'zebra', 'bear', 'pasta', 'cucumber', 'clay', 'faucet', 'burger', 'celery', 'paper', 'tape',
  'sticker', 'computer', 'frog', 'relish', 'marker', 'sculpture', 'bookmark', 'hand', 'clock', 'worm', 'drawer',
  'plate', 'pickle', 'pistachio', 'rock', 'flowerpot', 'bonnet', 'table', 'hammer', 'horse', 'wallet', 'tongue', 'skateboard', 'robe', 'sock', 'egg',
  'mud', 'sink', 'eraser', 'lentil', 'iron', 'oil', 'plane', 'balloon', 'grater', 'peanut', 'cow', 'raindrop', 'ant', 'disk', 'fabric', 'knee', 'eye',
  'drill', 'wagon', 'gloves', 'dirt', 'pumpkin', 'snake', 'hat', 'beet', 'seed', 'vase', 'lion', 'salt', 'walnut', 'rug', 'nose', 'eggplant', 'coupon',
  'sugar', 'knob', 'bean', 'pot', 'tangerine', 'fence', 'hanger', 'fox', 'adapter', 'receipt', 'hook', 'comb', 'plum',
  'keyboard', 'notebook', 'scarf', 'speaker', 'scooter', 'candy', 'duck', 'rope', 'key', 'phone', 'leaf', 'sprinkler', 'mushroom',
  'dog', 'foot', 'hose', 'toy', 'battery', 'wrench', 'bath', 'switch', 'garlic', 'cable', 'bus', 'chicken', 'bacon', 'sweater',
  'banana', 'statue', 'vinegar', 'broccoli', 'crayon', 'donut', 'lettuce', 'head', 'olive', 'cracker', 'shark', 'broom', 'plug',
  'asparagus', 'jar', 'tree', 'kale', 'artichoke', 'doormat', 'thread', 'lamp', 'fig', 'canvas', 'hoodie', 'goggles', 'shorts', 'meat',
  'ketchup', 'charger', 'pants',

  // Only single-word everyday physical daily use objects:
  'toothbrush', 'comb', 'wallet', 'keys', 'pen', 'notepad', 'spatula',
  'colander', 'dish', 'broom', 'dustpan', 'bucket', 'hanger', 'umbrella',
  'thermos', 'charger', 'earbuds', 'headphones', 'mousepad', 'stapler',
  'highlighter', 'ruler', 'bandage', 'thermometer', 'razor', 'plunger',
  'peeler', 'whisk', 'coaster', 'placemat', 'fan', 'clipboard',
  'eraser', 'marker', 'tack', 'mittens', 'beanie', 'raincoat', 'slippers', 'shoelace', 'watch',
  'bracelet', 'ring', 'necklace', 'earring', 'lunchbox', 'mirror', 'blush', 'eyeliner', 'mascara',
  'toothpaste', 'mouthwash', 'floss', 'perfume', 'lotion', 'sponge', 'scrunchie', 'towel', 'soap',
  'detergent', 'conditioner', 'shampoo', 'deodorant', 'tissue', 'perfume', 'lotion', 'bobby', 'pin',
  'scrubber', 'bucket', 'tray', 'lighter', 'fan', 'clock', 'calendar', 'frame', 'binder', 'clip',
  'notebook', 'ruler', 'tape', 'scissors', 'glasses', 'belt', 'scarf', 'wallet', 'keychain', 'pillow',
  'mask', 'sanitizer', 'mirror', 'brush', 'blush', 'eyeliner', 'mascara', 'floss', 'shampoo', 'soap'
];

async function selectSecretItem(): Promise<{ content: string }> {
  const randomIndex = Math.floor(Math.random() * items.length);
  const secretItem = items[randomIndex];
  return { content: secretItem };
}

async function evaluateInput(userInput: string, questionCount: number, secretItem: string): Promise<any> {
  const startTime = performance.now();
  logPerformance('evaluateInput:start', startTime);
  const controller = createRequestController();

  // Comprehensive but concise system prompt
  const systemPrompt = `You are the AI referee in a game of 20 Questions. The secret item is "${secretItem}".

Your role is to evaluate each question or guess from the player and respond with EXACTLY one word: "win", "yes", "no", or "unsure".

CRITICAL RULES:
1. For GUESSES (when player names an object):
   - "win" = player correctly identified "${secretItem}" or its exact synonym
   - "no" = player guessed wrong
   - Examples: If secret is "cup", "cup" or "mug" = "win", but "glass" or "container" = "no"

2. For YES/NO QUESTIONS:
   - "yes" = the statement is definitely true for "${secretItem}"
   - "no" = the statement is definitely false for "${secretItem}"
   - "unsure" = the question is ambiguous, subjective, or unclear

3. When to use "unsure":
   - Questions with multiple conditions ("Is it big AND red?")
   - Subjective questions ("Is it beautiful?")
   - Vague questions ("Is it useful?")
   - Questions about specific details you're uncertain about

Remember: You are helping someone play 20 Questions to guess "${secretItem}". Be precise but fair. When in doubt, prefer "unsure" over potentially misleading answers.`;

  const response = await fetch(CLAUDE_API_CONFIG.baseUrl, {
    method: 'POST',
    headers: CLAUDE_API_CONFIG.headers,
    body: JSON.stringify({
      model: CLAUDE_API_CONFIG.model,
      max_tokens: 100,
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
  
  // Double-check we got a valid response
  if (!['win', 'yes', 'no', 'unsure'].includes(answer)) {
    console.error(`Invalid LLM response: "${answer}" for input: "${userInput}"`);
    throw new Error('Invalid response from LLM');
  }
  
  if (answer === 'win') {
    result = {
      type: 'guess_evaluation',
      content: 'Correct! You got it!',
      isCorrect: true
    };
    logPerformance('evaluateInput:processWin', startTime);
  } else if (answer === 'unsure') {
    result = {
      type: 'clarification',
      content: 'Sorry, I am not sure about that. Could you ask a more specific question?'
    };
    logPerformance('evaluateInput:processClarification', startTime);
  } else {
    result = {
      type: 'answer',
      content: answer
    };
    logPerformance('evaluateInput:processAnswer', startTime);
  }

  logPerformance('evaluateInput:complete', startTime);
  return result;
}