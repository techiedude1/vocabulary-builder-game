
export interface VocabularyQuestion {
  word: string;
  sentences: string[];
  correctSentenceIndex: number;
  explanation: string;
}

export enum GameState {
  LOADING,
  PLAYING,
  SHOWING_RESULT,
  ERROR
}

// Defines the visual status of a sentence card
export type SentenceStatus = 'default' | 'selected' | 'correct' | 'incorrect' | 'disabled';
    