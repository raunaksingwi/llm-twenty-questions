interface LLMGameResponse {
  type: 'answer' | 'clarification' | 'item_selection' | 'guess_evaluation';
  content: string;
  isCorrect?: boolean;
  selectedItem?: string;
}

export class LLMGameService {
  private secretItem: string = '';

  async selectSecretItem(): Promise<string> {
    console.log('selectSecretItem called - using edge function');
    const response = await this.callBackend('select_secret_item', {});
    console.log('selectSecretItem response:', response);
    this.secretItem = response.content;
    return this.secretItem;
  }

  async evaluateInput(userInput: string, questionCount: number): Promise<LLMGameResponse> {
    return await this.callBackend('evaluate_input', {
      userInput,
      questionCount,
      secretItem: this.secretItem
    });
  }

  private async callBackend(action: string, data: any): Promise<any> {
    console.log('callBackend called with action:', action, 'data:', data);
    const url = 'https://jzvrquzwwhrpxkvkukgd.supabase.co/functions/v1/game-llm';
    console.log('Calling URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        ...data
      })
    });

    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Backend response:', result);
    return result;
  }

  getSecretItem(): string {
    return this.secretItem;
  }
}