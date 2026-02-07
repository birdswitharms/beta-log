import { create } from "zustand";

interface TimerState {
  elapsedSeconds: number;
  isRunning: boolean;
  mode: "stopwatch" | "countdown";
  countdownFrom: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setMode: (mode: "stopwatch" | "countdown") => void;
  setCountdownFrom: (seconds: number) => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  elapsedSeconds: 0,
  isRunning: false,
  mode: "stopwatch",
  countdownFrom: 60,

  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  reset: () =>
    set({
      elapsedSeconds: 0,
      isRunning: false,
    }),

  tick: () => {
    const { mode, elapsedSeconds, countdownFrom } = get();
    if (mode === "countdown" && elapsedSeconds >= countdownFrom) {
      set({ isRunning: false });
      return;
    }
    set({ elapsedSeconds: elapsedSeconds + 1 });
  },

  setMode: (mode) => set({ mode, elapsedSeconds: 0, isRunning: false }),
  setCountdownFrom: (seconds) => set({ countdownFrom: seconds, elapsedSeconds: 0, isRunning: false }),
}));
