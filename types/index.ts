export interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  grade: string;
  notes: string;
  created_at: string;
}

export type NewExercise = Omit<Exercise, "id" | "created_at">;

export interface TimerPreset {
  id: number;
  name: string;
  sets: number;
  reps: number;
  work_time: number;
  rep_rest: number;
  set_rest: number;
  weight_lbs: number | null;
  edge_mm: number | null;
  created_at: string;
}

export type NewTimerPreset = Omit<TimerPreset, "id" | "created_at">;

export interface Hangboarding {
  id: number;
  preset_name: string;
  sets: number;
  reps: number;
  work_time: number;
  rep_rest: number;
  set_rest: number;
  weight_lbs: number | null;
  edge_mm: number | null;
  duration_seconds: number;
  completed_at: string;
}

export type NewHangboarding = Omit<Hangboarding, "id" | "completed_at">;
