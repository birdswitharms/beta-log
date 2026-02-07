import * as SQLite from "expo-sqlite";
import {
  Exercise,
  NewExercise,
  TimerPreset,
  NewTimerPreset,
  Hangboarding,
  NewHangboarding,
} from "../types";

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

      CREATE TABLE IF NOT EXISTS timer_presets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sets INTEGER NOT NULL,
        reps INTEGER NOT NULL,
        work_time INTEGER NOT NULL,
        rep_rest INTEGER NOT NULL,
        set_rest INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS hangboarding (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        preset_name TEXT NOT NULL,
        sets INTEGER NOT NULL,
        reps INTEGER NOT NULL,
        work_time INTEGER NOT NULL,
        rep_rest INTEGER NOT NULL,
        set_rest INTEGER NOT NULL,
        duration_seconds INTEGER NOT NULL,
        completed_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
    `);
  }
  return db;
}

// Exercises
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

// Timer Presets
export async function savePreset(preset: NewTimerPreset): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO timer_presets (name, sets, reps, work_time, rep_rest, set_rest) VALUES (?, ?, ?, ?, ?, ?)`,
    [preset.name, preset.sets, preset.reps, preset.work_time, preset.rep_rest, preset.set_rest]
  );
}

export async function getPresets(): Promise<TimerPreset[]> {
  const db = await getDatabase();
  return db.getAllAsync<TimerPreset>(
    `SELECT * FROM timer_presets ORDER BY created_at DESC`
  );
}

export async function deletePreset(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM timer_presets WHERE id = ?`, [id]);
}

// hangboarding
export async function addHangboarding(Hangboarding: NewHangboarding): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO hangboarding (preset_name, sets, reps, work_time, rep_rest, set_rest, duration_seconds) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      Hangboarding.preset_name,
      Hangboarding.sets,
      Hangboarding.reps,
      Hangboarding.work_time,
      Hangboarding.rep_rest,
      Hangboarding.set_rest,
      Hangboarding.duration_seconds,
    ]
  );
}

export async function getHangboarding(): Promise<Hangboarding[]> {
  const db = await getDatabase();
  return db.getAllAsync<Hangboarding>(
    `SELECT * FROM hangboarding ORDER BY completed_at DESC`
  );
}

export async function deleteHangboarding(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM hangboarding WHERE id = ?`, [id]);
}
