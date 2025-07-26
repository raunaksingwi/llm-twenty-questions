interface LLMGameResponse {
  type: 'answer' | 'clarification' | 'item_selection' | 'guess_evaluation';
  content: string;
  isCorrect?: boolean;
  selectedItem?: string;
}

export class LLMGameService {
  private secretItem: string = '';

  async selectSecretItem(): Promise<string> {
    console.log('🎯 selectSecretItem called - using NEW edge function implementation');
    
    try {
      const response = await this.callBackend('select_secret_item', {});
      console.log('✅ selectSecretItem response:', response);
      this.secretItem = response.content;
      return this.secretItem;
    } catch (error) {
      console.error('❌ selectSecretItem error:', error);
      throw error;
    }
  }

  async evaluateInput(userInput: string, questionCount: number): Promise<LLMGameResponse> {
    console.log('🎯 evaluateInput called with:', { userInput, questionCount, secretItem: this.secretItem });
    
    try {
      const response = await this.callBackend('evaluate_input', {
        userInput,
        questionCount,
        secretItem: this.secretItem
      });
      console.log('✅ evaluateInput response:', response);
      return response;
    } catch (error) {
      console.error('❌ evaluateInput error:', error);
      throw error;
    }
  }

  private async callBackend(action: string, data: any): Promise<any> {
    const url = 'https://jzvrquzwwhrpxkvkukgd.supabase.co/functions/v1/game-llm';
    console.log('🚀 callBackend called with:', { action, data, url });
    
    const requestBody = {
      action,
      ...data
    };
    
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error response:', errorText);
        throw new Error(`Backend error: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Backend response:', result);
      return result;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      throw error;
    }
  }

  getSecretItem(): string {
    return this.secretItem;
  }
}