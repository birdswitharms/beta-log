import * as SQLite from "expo-sqlite";
import {
  Exercise,
  NewExercise,
  SetData,
  TimerPreset,
  NewTimerPreset,
  Hangboarding,
  NewHangboarding,
  Workout,
  NewWorkout,
  Video,
  NewVideo,
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
        weight_lbs REAL,
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

      DROP TABLE IF EXISTS workouts;
      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        exercises TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uri TEXT NOT NULL,
        filename TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL,
        recorded_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    // Migrate existing tables that may lack new columns
    const migrations = [
      `ALTER TABLE exercises ADD COLUMN weight_lbs REAL`,
      `ALTER TABLE timer_presets ADD COLUMN weight_lbs REAL`,
      `ALTER TABLE timer_presets ADD COLUMN edge_mm REAL`,
      `ALTER TABLE hangboarding ADD COLUMN weight_lbs REAL`,
      `ALTER TABLE hangboarding ADD COLUMN edge_mm REAL`,
      `ALTER TABLE exercises ADD COLUMN sets_data TEXT`,
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

type ExerciseRow = Omit<Exercise, "sets_data"> & { sets_data: string | null };

function parseExerciseRow(row: ExerciseRow): Exercise {
  return {
    ...row,
    sets_data: row.sets_data ? JSON.parse(row.sets_data) as SetData[] : null,
  };
}

// Exercises
export async function addExercise(exercise: NewExercise): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO exercises (name, sets, reps, weight_lbs, sets_data) VALUES (?, ?, ?, ?, ?)`,
    [exercise.name, exercise.sets, exercise.reps, exercise.weight_lbs, exercise.sets_data ? JSON.stringify(exercise.sets_data) : null]
  );
}

export async function getExercises(): Promise<Exercise[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExerciseRow>(
    `SELECT * FROM exercises ORDER BY created_at DESC`
  );
  return rows.map(parseExerciseRow);
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

// Workouts
export async function saveWorkout(workout: NewWorkout): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO workouts (name, exercises) VALUES (?, ?)`,
    [workout.name, JSON.stringify(workout.exercises)]
  );
}

export async function getWorkouts(): Promise<Workout[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ id: number; name: string; exercises: string; created_at: string }>(
    `SELECT * FROM workouts ORDER BY created_at DESC`
  );
  return rows.map((row) => ({
    ...row,
    exercises: JSON.parse(row.exercises) as string[],
  }));
}

export async function getWorkout(id: number): Promise<Workout | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ id: number; name: string; exercises: string; created_at: string }>(
    `SELECT * FROM workouts WHERE id = ?`,
    [id]
  );
  if (!row) return null;
  return { ...row, exercises: JSON.parse(row.exercises) as string[] };
}

export async function deleteWorkout(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM workouts WHERE id = ?`, [id]);
}

// Videos
export async function addVideo(video: NewVideo): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO videos (uri, filename, duration_seconds) VALUES (?, ?, ?)`,
    [video.uri, video.filename, video.duration_seconds]
  );
}

export async function getVideos(): Promise<Video[]> {
  const db = await getDatabase();
  return db.getAllAsync<Video>(
    `SELECT * FROM videos ORDER BY recorded_at DESC`
  );
}

export async function deleteVideo(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM videos WHERE id = ?`, [id]);
}

// Date-filtered queries for calendar view
export async function getLoggedDates(): Promise<Set<string>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ d: string }>(
    `SELECT DISTINCT date(created_at) AS d FROM exercises
     UNION
     SELECT DISTINCT date(completed_at) AS d FROM hangboarding
     UNION
     SELECT DISTINCT date(recorded_at) AS d FROM videos`
  );
  return new Set(rows.map((r) => r.d));
}

export async function getExercisesByDate(date: string): Promise<Exercise[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExerciseRow>(
    `SELECT * FROM exercises WHERE date(created_at) = ? ORDER BY created_at DESC`,
    [date]
  );
  return rows.map(parseExerciseRow);
}

export async function getHangboardingByDate(date: string): Promise<Hangboarding[]> {
  const db = await getDatabase();
  return db.getAllAsync<Hangboarding>(
    `SELECT * FROM hangboarding WHERE date(completed_at) = ? ORDER BY completed_at DESC`,
    [date]
  );
}

// Settings
export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM settings WHERE key = ?`,
    [key]
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
    [key, value]
  );
}
