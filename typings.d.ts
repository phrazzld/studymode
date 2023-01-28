export type Quiz = {
  id: string;
  question: string;
  answers: Answer[];
  sourceId: string;
};

export type Answer = {
  text: string;
  correct: boolean;
};

export type Source = {
  id: string;
  text: string;
};
