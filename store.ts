import { create } from "zustand";
import { Quiz, UserRefs } from "./typings";

type State = {
  userRefs: UserRefs | null;
  setUserRefs: (userRefs: UserRefs | null) => void;
  activeQuizzes: Quiz[] | null;
  setActiveQuizzes: (activeQuizzes: Quiz[] | null) => void;
};

export const useStore = create<State>((set) => ({
  userRefs: { firebaseId: null, memreId: null, loaded: false },
  setUserRefs: (userRefs: UserRefs | null) => set({ userRefs }),
  activeQuizzes: null,
  setActiveQuizzes: (activeQuizzes: Quiz[] | null) => set({ activeQuizzes }),
}));
