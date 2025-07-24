export interface GameEntry {
  id: string;
  type: 'question' | 'guess';
  content: string;
  response: string;
  questionNumber?: number;
  isCorrect?: boolean;
}