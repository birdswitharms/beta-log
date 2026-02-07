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
