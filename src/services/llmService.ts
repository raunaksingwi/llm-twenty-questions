interface LLMGameResponse {
  type: 'answer' | 'clarification' | 'item_selection' | 'guess_evaluation';
  content: string;
  isCorrect?: boolean;
  selectedItem?: string;
}

export class LLMGameService {
  private apiKey: string;
  private secretItem: string = '';

  constructor() {
    // Replace with your actual Claude API key
    this.apiKey = 'YOUR_CLAUDE_API_KEY_HERE';
  }

  async selectSecretItem(): Promise<string> {
    const response = await this.callClaude({
      role: 'user',
      content: `You are the game host for "20 Questions". Please select ONE common, everyday item that a kindergartener would know (like things found in picture books: apple, chair, car, etc.). 

      Respond with ONLY the item name in lowercase, nothing else. Examples: "apple", "chair", "book"
      
      Choose something concrete and physical, not abstract concepts.`
    });

    this.secretItem = response.content.trim().toLowerCase();
    return this.secretItem;
  }

  async evaluateInput(userInput: string, questionCount: number): Promise<LLMGameResponse> {
    const systemPrompt = `You are the host of "20 Questions" game. The secret item is: ${this.secretItem}

CRITICAL RULES:
1. If the user is asking a yes/no question, answer with ONLY "Yes" or "No" 
2. If the user is making a guess (saying an item name or "is it X"), evaluate if they're correct
3. For invalid questions, ask for clarification

User input categories:
- QUESTION: "Is it big?", "Can you eat it?", "Is it made of metal?"
- GUESS: "chair", "apple", "is it a chair?", "is it an apple?"
- INVALID: statements that aren't yes/no questions

Respond in this JSON format:
{
  "type": "answer|guess_evaluation|clarification",
  "content": "your response",
  "isCorrect": true/false (only for guesses)
}`

    const response = await this.callClaude({
      role: 'user',
      content: `${systemPrompt}

Question #${questionCount + 1}: "${userInput}"`
    });

    try {
      return JSON.parse(response.content);
    } catch {
      // Fallback if JSON parsing fails
      const lowerInput = userInput.toLowerCase();
      const isGuess = !lowerInput.includes('?') || lowerInput.includes('is it');
      
      if (isGuess) {
        const isCorrect = lowerInput.includes(this.secretItem) || lowerInput === this.secretItem;
        return {
          type: 'guess_evaluation',
          content: isCorrect 
            ? `Correct! The item was indeed "${this.secretItem}". Well done!`
            : `No, that's not correct. The item was "${this.secretItem}".`,
          isCorrect
        };
      } else {
        return {
          type: 'answer',
          content: response.content.includes('Yes') ? 'Yes' : 'No'
        };
      }
    }
  }

  private async callClaude(message: { role: string; content: string }): Promise<{ content: string }> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [message]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { content: data.content[0].text };
  }

  getSecretItem(): string {
    return this.secretItem;
  }
}