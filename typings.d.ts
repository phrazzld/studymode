type UserRefs = {
  firebaseId: string | null;
  memreId: string | null;
  loaded: boolean;
};

export type Quiz = {
  id: string;
  memreId: string;
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
