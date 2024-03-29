import { Timestamp } from '@firebase/firestore'

type UserRefs = {
  firebaseId: string | null;
  memreId: string | null;
  loaded: boolean;
};

export type Quiz = {
  id: string;
  memreId: string | null;
  question: string;
  answers: Answer[];
  sourceId: string;
  createdAt: Date | Timestamp;
};

export type Answer = {
  text: string;
  correct: boolean;
};

export type Source = {
  id: string;
  text?: string;
  title: string;
  link?: string;
  createdAt: Date | Timestamp;
};
