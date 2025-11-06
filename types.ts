
export interface VibeFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export enum AIMode {
  ANALYZE = 'Analyze',
  REFACTOR = 'Refactor (Thinking Mode)',
}
