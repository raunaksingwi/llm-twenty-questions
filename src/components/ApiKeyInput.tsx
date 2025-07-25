import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff, Key } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

export const ApiKeyInput = ({ onApiKeySubmit }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="text-center mb-4">
        <Key className="h-12 w-12 mx-auto mb-2 text-primary" />
        <h2 className="text-xl font-bold">Claude API Key Required</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your Anthropic Claude API key to play with real AI
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        
        <Button type="submit" className="w-full" disabled={!apiKey.trim()}>
          Start Game with Claude
        </Button>
      </form>
      
      <p className="text-xs text-muted-foreground mt-4 text-center">
        Your API key is stored locally and only used for this game session.
        Get your key from{' '}
        <a 
          href="https://console.anthropic.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          console.anthropic.com
        </a>
      </p>
    </Card>
  );
};