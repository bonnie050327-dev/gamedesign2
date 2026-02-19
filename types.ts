
export enum FallacyType {
  EITHER_OR = 'Either/Or',
  SLIPPERY_SLOPE = 'Slippery Slope',
  NONE = 'None'
}

export interface FallacyQuestion {
  questionText: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface ChatMessage {
  sender: string;
  text: string;
  isPlayer?: boolean;
  isDivider?: boolean;
}

export interface RoundData {
  scene: ChatMessage[];
  fallacyType: FallacyType;
  fallacyLocation: string;
  explanation: string;
  fallacyQuestion: FallacyQuestion;
  consequences: {
    correctFlag: string;
    wrongFlag: string;
    missedFlag: string;
    neutralAccepted: string;
  };
}

export interface GameState {
  morale: number;
  progress: number;
  conflict: number;
  roundCount: number;
  score: number;
  currentStep: number;
  history: ChatMessage[];
  currentRound: RoundData | null;
  gameStatus: 'loading' | 'playing' | 'questioning' | 'feedback' | 'finished';
  lastFeedback: string | null;
  isCorrect: boolean;
}
