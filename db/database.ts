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
        weight_lbs REAL,
        edge_mm REAL,
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
        weight_lbs REAL,
        edge_mm REAL,
        duration_seconds INTEGER NOT NULL,
        completed_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // Migrate existing tables that may lack new columns
    const migrations = [
      `ALTER TABLE timer_presets ADD COLUMN weight_lbs REAL`,
      `ALTER TABLE timer_presets ADD COLUMN edge_mm REAL`,
      `ALTER TABLE hangboarding ADD COLUMN weight_lbs REAL`,
      `ALTER TABLE hangboarding ADD COLUMN edge_mm REAL`,
    ];
    for (const sql of migrations) {
      try {
        await db.execAsync(sql);
      } catch {
        // Column already exists — ignore
      }
    }
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
    `INSERT INTO timer_presets (name, sets, reps, work_time, rep_rest, set_rest, weight_lbs, edge_mm) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [preset.name, preset.sets, preset.reps, preset.work_time, preset.rep_rest, preset.set_rest, preset.weight_lbs, preset.edge_mm]
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
export async function addHangboarding(hangboarding: NewHangboarding): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO hangboarding (preset_name, sets, reps, work_time, rep_rest, set_rest, weight_lbs, edge_mm, duration_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      hangboarding.preset_name,
      hangboarding.sets,
      hangboarding.reps,
      hangboarding.work_time,
      hangboarding.rep_rest,
      hangboarding.set_rest,
      hangboarding.weight_lbs,
      hangboarding.edge_mm,
      hangboarding.duration_seconds,
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
