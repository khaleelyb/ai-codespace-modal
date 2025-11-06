export interface VibeEntry {
  id: string;
  name: string;
  content: string;
  language: string;
  type: 'file' | 'folder' | 'image';
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export enum AIMode {
  ANALYZE = 'Analyze',
  REFACTOR = 'Refactor (Thinking Mode)',
}
