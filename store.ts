import { create } from "zustand";
import { UserRefs } from "./typings";

type State = {
  userRefs: UserRefs | null;
  setUserRefs: (userRefs: UserRefs | null) => void;
};

export const useStore = create<State>((set) => ({
  userRefs: null,
  setUserRefs: (userRefs: UserRefs | null) => set({ userRefs }),
}));
