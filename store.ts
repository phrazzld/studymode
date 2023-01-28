import { create } from "zustand";

type State = {
  userId: string | null;
  setUserId: (userId: string | null) => void;
};

export const useStore = create<State>((set) => ({
  userId: null,
  setUserId: (userId: string | null) => set({ userId }),
}));
