import * as SQLite from "expo-sqlite";
import { Exercise, NewExercise } from "../types";

let db: SQLite.SQLiteDatabase;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("betalog.db");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sets INTEGER NOT NULL DEFAULT 0,
        reps INTEGER NOT NULL DEFAULT 0,
        grade TEXT NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
    `);
  }
  return db;
}

export async function addExercise(exercise: NewExercise): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO exercises (name, sets, reps, grade, notes) VALUES (?, ?, ?, ?, ?)`,
    [exercise.name, exercise.sets, exercise.reps, exercise.grade, exercise.notes]
  );
}

export async function getExercises(): Promise<Exercise[]> {
  const db = await getDatabase();
  return db.getAllAsync<Exercise>(
    `SELECT * FROM exercises ORDER BY created_at DESC`
  );
}

export async function deleteExercise(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM exercises WHERE id = ?`, [id]);
}
