import { create } from "zustand";
import { UserRefs } from "./typings";

type State = {
  userRefs: UserRefs | null;
  setUserRefs: (userRefs: UserRefs | null) => void;
  studyMode: boolean;
  setStudyMode: (studymode: boolean) => void;
};

export const useStore = create<State>((set) => ({
  userRefs: { firebaseId: null, memreId: null, loaded: false },
  setUserRefs: (userRefs: UserRefs | null) => set({ userRefs }),
  studyMode: false,
  setStudyMode: (studyMode: boolean) => set({ studyMode }),
}));
