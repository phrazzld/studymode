export type Quiz = {
  id: number;
  question: string;
  answers: Answer[];
}

export type Answer = {
  text: string;
  correct: boolean;
}
