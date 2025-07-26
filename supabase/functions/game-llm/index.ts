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
  'corn', 'container', 'muffin', 'popcorn', 'stamp', 'twig', 'cashew', 'shelf', 'dew', 'toast', 'fridge', 'cooler', 'apple', 'water', 
  'crib', 'purse', 'pliers', 'truck', 'cabbage', 'jacket', 'plant', 'owl', 'glue', 'shampoo', 'cloud', 'kettle', 'floor', 'chalkboard', 
  'rainbow', 'bagel', 'strap', 'grill', 'cranberry', 'dolphin', 'letter', 'jelly', 'blanket', 'lake', 'slide', 'toaster', 'arm', 'envelope', 
  'steak', 'pillow', 'controller', 'stone', 'cereal', 'potato', 'ruler', 'bra', 'sun', 'school', 'mustard', 'axe', 'snail', 'pan', 'swimsuit',
  'cave', 'mop', 'zipper', 'door', 'tool', 'book', 'sandwich', 'tissue', 'box', 'screw', 'bell', 'fries', 'basket', 'buckle', 'sand', 'juice', 
  'cup', 'grape', 'towel', 'candle', 'scissors', 'milk', 'boat', 'monkey', 'ticket', 'thermos', 'swing', 'bucket', 'duster', 'cookie', 'filter', 
  'backpack', 'club', 'desk', 'ear', 'soda', 'skate', 'skin', 'island', 'camera', 'microwave', 'block', 'mirror', 'mouse', 'boots', 'lemon', 
  'cauliflower', 'whistle', 'gate', 'brush', 'ice', 'vest', 'ocean', 'flagpole', 'nest', 'fountain', 'net', 'soap', 'knife', 'coin', 'jam', 
  'neck', 'binder', 'soup', 'bottle', 'leg', 'tomato', 'glasses', 'cupcake', 'toe', 'waterfall', 'glove', 'honey', 'bag', 'coat', 'thimble', 
  'board', 'apron', 'forest', 'fork', 'pouch', 'bat', 'tie', 'toolbox', 'dial', 'flower', 'calendar', 'face', 'flashlight', 'bed', 'loop', 'kite', 
  'rabbit', 'shell', 'snowflake', 'bush', 'ceiling', 'butter', 'sauce', 'belt', 'storm', 'sheep', 'nail', 'button', 'string', 'coffee', 'lawnmower', 
  'helmet', 'racquet', 'picture', 'finger', 'chips', 'pig', 'saw', 'spoon', 'pepper', 'lid', 'mask', 'dustpan', 'remote', 'stroller', 'ring', 'necklace', 
  'toilet', 'park', 'hair', 'chair', 'vacuum', 'rice', 'hotdog', 'whale', 'ladder', 'shoe', 'grapefruit', 'sponge', 'window', 'flour', 'curtain', 'bread', 
  'mouth', 'pecan', 'freezer', 'date', 'tiger', 'ball', 'tea', 'flag', 'hill', 'pencil', 'almond', 'yogurt', 'folder', 'parsley', 'pizza', 'clipboard', 
  'shoulder', 'mixer', 'bowl', 'spider', 'mailbox', 'tooth', 'robot', 'feather', 'cake', 'mug', 'crab', 'napkin', 'bee', 'keychain', 'bike', 'orange', 
  'onion', 'car', 'cat', 'watch', 'closet', 'snap', 'grass', 'strawberry', 'carrot', 'chain', 'moon', 'pinecone', 'oven', 'easel', 'can', 'trashcan', 
  'berry', 'shirt', 'dress', 'wall', 'cap', 'tray', 'cheese', 'star', 'stapler', 'blender', 'magnet', 'shovel', 'pajamas', 'fish', 'bird', 'yarn', 'rake', 
  'slipper', 'velcro', 'puddle', 'store', 'river', 'chickpea', 'zebra', 'bear', 'pasta', 'cucumber', 'clay', 'faucet', 'burger', 'celery', 'paper', 'tape', 
  'globe', 'sticker', 'computer', 'frog', 'relish', 'marker', 'sculpture', 'bookmark', 'hand', 'crate', 'outlet', 'clock', 'worm', 'display', 'drawer', 
  'plate', 'pickle', 'pistachio', 'rock', 'flowerpot', 'bonnet', 'table', 'hammer', 'horse', 'wallet', 'tongue', 'skateboard', 'robe', 'sock', 'egg', 
  'mud', 'sink', 'eraser', 'lentil', 'iron', 'oil', 'plane', 'balloon', 'grater', 'peanut', 'cow', 'raindrop', 'ant', 'disk', 'fabric', 'knee', 'eye', 
  'drill', 'wagon', 'gloves', 'dirt', 'pumpkin', 'snake', 'hat', 'beet', 'seed', 'vase', 'lion', 'salt', 'walnut', 'rug', 'nose', 'eggplant', 'coupon', 
  'sugar', 'knob', 'poster', 'mountain', 'bean', 'pot', 'tangerine', 'fence', 'house', 'hanger', 'fox', 'adapter', 'receipt', 'hook', 'comb', 'plum', 
  'keyboard', 'money', 'notebook', 'scarf', 'speaker', 'scooter', 'candy', 'train', 'duck', 'rope', 'key', 'phone', 'leaf', 'sprinkler', 'mushroom', 
  'dog', 'foot', 'hose', 'toy', 'battery', 'wrench', 'bath', 'switch', 'garlic', 'cable', 'wind', 'bus', 'chicken', 'map', 'bacon', 'sweater', 
  'banana', 'statue', 'vinegar', 'broccoli', 'crayon', 'donut', 'volcano', 'lettuce', 'head', 'olive', 'cracker', 'sign', 'shark', 'broom', 'plug', 
  'desert', 'asparagus', 'jar', 'tree', 'kale', 'artichoke', 'doormat', 'thread', 'lamp', 'fig', 'canvas', 'hoodie', 'goggles', 'shorts', 'meat', 
  'ketchup', 'charger', 'pants'
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
  const systemPrompt = `Secret item: "${secretItem}"
You must respond with EXACTLY one word:
- "win" ONLY if the user specifically guesses "${secretItem}" or a direct synonym
- "yes" for true statements that don't guess the exact item
- "no" for false statements
- "unsure" if the question is ambiguous or you are not sure about the answer

Examples if item were a "pencil":
- "is it a pencil?" → "win"
- "is it used for writing?" → "yes"
- "is it found at home?" → "yes"
- "is it a pen?" → "no"
- "is it found in the bedroom?" → "unsure"`;

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