import { create } from "zustand";

export type TimerPhase = "idle" | "work" | "repRest" | "setRest" | "completed";

interface TimerConfig {
  sets: number;
  reps: number;
  workTime: number;
  repRest: number;
  setRest: number;
}

interface TimerState {
  // Config
  config: TimerConfig;
  presetName: string;

  // Progress
  phase: TimerPhase;
  currentSet: number;
  currentRep: number;
  secondsRemaining: number;
  isRunning: boolean;
  totalElapsed: number;

  // Actions
  setConfig: (config: Partial<TimerConfig>) => void;
  setPresetName: (name: string) => void;
  loadPreset: (name: string, config: TimerConfig) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  tick: () => void;
  skip: () => void;
}

function nextPhase(state: TimerState): Pick<TimerState, "phase" | "currentSet" | "currentRep" | "secondsRemaining" | "isRunning"> {
  const { phase, currentSet, currentRep, config } = state;
  const { sets, reps, workTime, repRest, setRest } = config;

  if (phase === "work") {
    const isLastRep = currentRep >= reps;
    if (!isLastRep) {
      // More reps in this set → rep rest
      return {
        phase: "repRest",
        currentSet,
        currentRep,
        secondsRemaining: repRest,
        isRunning: true,
      };
    }
    // Last rep of this set
    const isLastSet = currentSet >= sets;
    if (!isLastSet) {
      // More sets → set rest
      return {
        phase: "setRest",
        currentSet,
        currentRep,
        secondsRemaining: setRest,
        isRunning: true,
      };
    }
    // All done
    return {
      phase: "completed",
      currentSet,
      currentRep,
      secondsRemaining: 0,
      isRunning: false,
    };
  }

  if (phase === "repRest") {
    // Next rep
    return {
      phase: "work",
      currentSet,
      currentRep: currentRep + 1,
      secondsRemaining: workTime,
      isRunning: true,
    };
  }

  if (phase === "setRest") {
    // Next set, first rep
    return {
      phase: "work",
      currentSet: currentSet + 1,
      currentRep: 1,
      secondsRemaining: workTime,
      isRunning: true,
    };
  }

  // Shouldn't reach here
  return { phase: "completed", currentSet, currentRep, secondsRemaining: 0, isRunning: false };
}

const defaultConfig: TimerConfig = {
  sets: 3,
  reps: 7,
  workTime: 7,
  repRest: 3,
  setRest: 60,
};

export const useTimerStore = create<TimerState>((set, get) => ({
  config: { ...defaultConfig },
  presetName: "",
  phase: "idle",
  currentSet: 0,
  currentRep: 0,
  secondsRemaining: 0,
  isRunning: false,
  totalElapsed: 0,

  setConfig: (partial) =>
    set((state) => ({ config: { ...state.config, ...partial } })),

  setPresetName: (name) => set({ presetName: name }),

  loadPreset: (name, config) =>
    set({
      presetName: name,
      config,
      phase: "idle",
      currentSet: 0,
      currentRep: 0,
      secondsRemaining: 0,
      isRunning: false,
      totalElapsed: 0,
    }),

  start: () =>
    set((state) => ({
      phase: "work",
      currentSet: 1,
      currentRep: 1,
      secondsRemaining: state.config.workTime,
      isRunning: true,
      totalElapsed: 0,
    })),

  pause: () => set({ isRunning: false }),
  resume: () => set({ isRunning: true }),

  reset: () =>
    set({
      phase: "idle",
      currentSet: 0,
      currentRep: 0,
      secondsRemaining: 0,
      isRunning: false,
      totalElapsed: 0,
    }),

  tick: () => {
    const state = get();
    if (!state.isRunning || state.phase === "idle" || state.phase === "completed") return;

    const newTotalElapsed = state.totalElapsed + 1;

    if (state.secondsRemaining > 1) {
      set({ secondsRemaining: state.secondsRemaining - 1, totalElapsed: newTotalElapsed });
    } else {
      // Time's up for this phase — transition
      const next = nextPhase(state);
      set({ ...next, totalElapsed: newTotalElapsed });
    }
  },

  skip: () => {
    const state = get();
    if (state.phase === "idle" || state.phase === "completed") return;
    const next = nextPhase(state);
    set(next);
  },
}));
