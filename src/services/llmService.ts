interface LLMGameResponse {
  type: 'answer' | 'clarification' | 'item_selection' | 'guess_evaluation';
  content: string;
  isCorrect?: boolean;
  selectedItem?: string;
}

export class LLMGameService {
  private secretItem: string = '';

  async selectSecretItem(): Promise<string> {
    const response = await this.callBackend('select_secret_item', {});
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
    const response = await fetch('https://jzvrquzwwhrpxkvkukgd.supabase.co/functions/v1/game-llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        ...data
      })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    return await response.json();
  }

  getSecretItem(): string {
    return this.secretItem;
  }
}