export interface Interaction {
  name: string;
  reason: string;
}

export interface SupplementItem {
  id: string;
  name: string;
  target: string;
  timing: '아침' | '점심' | '저녁' | '식전' | '식후' | '취침전';
  why: string;
  caution: string;
  synergyWith: Interaction[];
  avoidWith: Interaction[];
}

export interface AiAnalysis {
  summary: string;
  items: SupplementItem[];
}

export interface RoutineItem extends SupplementItem {
  addedAt: number;
}
