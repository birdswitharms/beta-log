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

export async function getExercisesByName(name: string): Promise<Exercise[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExerciseRow>(
    `SELECT * FROM exercises WHERE LOWER(name) = LOWER(?) ORDER BY created_at ASC`,
    [name]
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

export async function getHangboardingByPresetName(presetName: string): Promise<Hangboarding[]> {
  const db = await getDatabase();
  return db.getAllAsync<Hangboarding>(
    `SELECT * FROM hangboarding WHERE LOWER(preset_name) = LOWER(?) ORDER BY completed_at ASC`,
    [presetName]
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

export async function addVideoWithDate(video: NewVideo, recordedAt: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO videos (uri, filename, duration_seconds, recorded_at) VALUES (?, ?, ?, ?)`,
    [video.uri, video.filename, video.duration_seconds, recordedAt]
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

// Clear all data from the database (preserves settings)
export async function clearDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DELETE FROM exercises;
    DELETE FROM hangboarding;
    DELETE FROM timer_presets;
    DELETE FROM videos;
    DELETE FROM workouts;
  `);
}

// Seed database with sample data for development
export async function seedDatabase(): Promise<void> {
  const db = await getDatabase();

  // Helper to build datetime strings relative to now
  const daysAgo = (days: number, hours = 12): string => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(hours, 0, 0, 0);
    return d.toISOString().replace("T", " ").slice(0, 19);
  };

  const day0 = daysAgo(0, 10);   // today
  const day1 = daysAgo(1, 9);   // yesterday
  const day2 = daysAgo(2, 10);
  const day3 = daysAgo(3, 11);
  const day4 = daysAgo(4, 9);
  const day5 = daysAgo(5, 10);
  const day6 = daysAgo(6, 11);

  // Clear all tables except settings
  await db.execAsync(`
    DELETE FROM exercises;
    DELETE FROM hangboarding;
    DELETE FROM timer_presets;
    DELETE FROM videos;
    DELETE FROM workouts;
  `);

  // --- Exercises (full week) ---
  const exercises: Array<[string, number, number, number | null, string | null, string]> = [
    // Pull-ups — every day, progressive weighted set
    ["Pull-ups", 5, 8, null, JSON.stringify([{reps:8,weight:null},{reps:8,weight:null},{reps:6,weight:null},{reps:5,weight:25},{reps:4,weight:45}]), day0],
    ["Pull-ups", 5, 8, null, JSON.stringify([{reps:8,weight:null},{reps:8,weight:null},{reps:7,weight:null},{reps:5,weight:25},{reps:3,weight:35}]), day1],
    ["Pull-ups", 5, 8, null, JSON.stringify([{reps:8,weight:null},{reps:7,weight:null},{reps:6,weight:null},{reps:5,weight:15},{reps:3,weight:25}]), day2],
    ["Pull-ups", 5, 8, null, JSON.stringify([{reps:8,weight:null},{reps:8,weight:null},{reps:7,weight:null},{reps:6,weight:null},{reps:4,weight:15}]), day3],
    ["Pull-ups", 4, 8, null, JSON.stringify([{reps:8,weight:null},{reps:8,weight:null},{reps:7,weight:null},{reps:6,weight:null}]), day4],
    ["Pull-ups", 4, 8, null, JSON.stringify([{reps:8,weight:null},{reps:7,weight:null},{reps:6,weight:null},{reps:5,weight:null}]), day5],
    ["Pull-ups", 4, 8, null, JSON.stringify([{reps:7,weight:null},{reps:6,weight:null},{reps:5,weight:null},{reps:5,weight:null}]), day6],

    // Deadlifts — 4 days, ramping weight
    ["Deadlifts", 5, 5, 315, JSON.stringify([{reps:5,weight:135},{reps:5,weight:185},{reps:3,weight:225},{reps:2,weight:275},{reps:1,weight:315}]), day0],
    ["Deadlifts", 5, 5, 275, JSON.stringify([{reps:5,weight:135},{reps:5,weight:185},{reps:5,weight:225},{reps:3,weight:275},{reps:2,weight:275}]), day2],
    ["Deadlifts", 5, 5, 245, JSON.stringify([{reps:5,weight:135},{reps:5,weight:185},{reps:4,weight:225},{reps:3,weight:245},{reps:2,weight:245}]), day4],
    ["Deadlifts", 4, 5, 225, JSON.stringify([{reps:5,weight:135},{reps:5,weight:185},{reps:5,weight:225},{reps:5,weight:225}]), day6],

    // Campus Board — 3 days
    ["Campus Board", 4, 5, null, JSON.stringify([{reps:5,weight:null},{reps:5,weight:null},{reps:4,weight:null},{reps:3,weight:null}]), day0],
    ["Campus Board", 4, 5, null, JSON.stringify([{reps:5,weight:null},{reps:4,weight:null},{reps:4,weight:null},{reps:3,weight:null}]), day3],
    ["Campus Board", 3, 5, null, JSON.stringify([{reps:5,weight:null},{reps:4,weight:null},{reps:3,weight:null}]), day5],

    // Finger Curls — 4 days, increasing weight
    ["Finger Curls", 4, 12, 45, JSON.stringify([{reps:12,weight:45},{reps:10,weight:45},{reps:10,weight:45},{reps:8,weight:45}]), day0],
    ["Finger Curls", 4, 12, 40, JSON.stringify([{reps:12,weight:40},{reps:12,weight:40},{reps:10,weight:40},{reps:10,weight:40}]), day1],
    ["Finger Curls", 4, 12, 40, JSON.stringify([{reps:12,weight:35},{reps:12,weight:35},{reps:12,weight:40},{reps:10,weight:40}]), day3],
    ["Finger Curls", 3, 12, 35, JSON.stringify([{reps:12,weight:35},{reps:12,weight:35},{reps:10,weight:35}]), day5],

    // Weighted Pull-ups — 3 days
    ["Weighted Pull-ups", 5, 5, 55, JSON.stringify([{reps:5,weight:45},{reps:5,weight:45},{reps:4,weight:50},{reps:3,weight:55},{reps:2,weight:55}]), day1],
    ["Weighted Pull-ups", 5, 5, 50, JSON.stringify([{reps:5,weight:45},{reps:5,weight:45},{reps:4,weight:50},{reps:3,weight:50},{reps:3,weight:50}]), day4],
    ["Weighted Pull-ups", 5, 5, 45, JSON.stringify([{reps:5,weight:45},{reps:5,weight:45},{reps:4,weight:45},{reps:4,weight:45},{reps:3,weight:45}]), day6],

    // Push-ups — 4 days, increasing reps
    ["Push-ups", 4, 20, null, JSON.stringify([{reps:25,weight:null},{reps:22,weight:null},{reps:20,weight:null},{reps:18,weight:null}]), day0],
    ["Push-ups", 4, 20, null, JSON.stringify([{reps:22,weight:null},{reps:20,weight:null},{reps:18,weight:null},{reps:15,weight:null}]), day2],
    ["Push-ups", 3, 20, null, JSON.stringify([{reps:20,weight:null},{reps:18,weight:null},{reps:15,weight:null}]), day4],
    ["Push-ups", 3, 20, null, JSON.stringify([{reps:20,weight:null},{reps:15,weight:null},{reps:15,weight:null}]), day6],
  ];
  for (const [name, sets, reps, weight, setsData, createdAt] of exercises) {
    await db.runAsync(
      `INSERT INTO exercises (name, sets, reps, weight_lbs, sets_data, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, sets, reps, weight, setsData, createdAt]
    );
  }

  // --- Hangboarding (full week) ---
  const hangSessions: Array<[string, number, number, number, number, number, number | null, number | null, number, string]> = [
    ["Max Hangs",     3, 1, 10, 0,  180, 30,   20, 630,  daysAgo(0, 14)],
    ["Max Hangs",     3, 1, 10, 0,  180, 28,   20, 630,  daysAgo(1, 14)],
    ["Max Hangs",     3, 1, 10, 0,  180, 25,   20, 630,  daysAgo(3, 14)],
    ["Max Hangs",     3, 1, 10, 0,  180, 22,   20, 630,  daysAgo(5, 14)],
    ["Max Hangs",     4, 1, 10, 0,  180, 20,   20, 840,  daysAgo(6, 14)],
    ["Repeaters",     4, 6,  7, 3,  120, null,  18, 720,  daysAgo(0, 16)],
    ["Repeaters",     4, 6,  7, 3,  120, null,  18, 720,  daysAgo(2, 16)],
    ["Repeaters",     4, 6,  7, 3,  120, null,  20, 720,  daysAgo(4, 16)],
    ["Repeaters",     4, 6,  7, 3,  120, null,  20, 720,  daysAgo(6, 16)],
    ["Min Edge",      3, 3, 10, 5,  180, null,  12, 585,  daysAgo(1, 11)],
    ["Min Edge",      3, 3, 10, 5,  180, null,  14, 585,  daysAgo(3, 11)],
    ["Min Edge",      3, 3, 10, 5,  180, null,  16, 585,  daysAgo(5, 11)],
  ];
  for (const [presetName, sets, reps, workTime, repRest, setRest, weight, edge, duration, completedAt] of hangSessions) {
    await db.runAsync(
      `INSERT INTO hangboarding (preset_name, sets, reps, work_time, rep_rest, set_rest, weight_lbs, edge_mm, duration_seconds, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [presetName, sets, reps, workTime, repRest, setRest, weight, edge, duration, completedAt]
    );
  }

  // --- Timer Presets (~3) ---
  const presets: Array<[string, number, number, number, number, number, number | null, number | null]> = [
    ["Max Hangs",  3, 1, 10, 0,  180, 25,   20],
    ["Repeaters",  4, 6,  7, 3,  120, null,  18],
    ["Min Edge",   3, 3, 10, 5,  180, null,  14],
  ];
  for (const [name, sets, reps, workTime, repRest, setRest, weight, edge] of presets) {
    await db.runAsync(
      `INSERT INTO timer_presets (name, sets, reps, work_time, rep_rest, set_rest, weight_lbs, edge_mm) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, sets, reps, workTime, repRest, setRest, weight, edge]
    );
  }

  // --- Videos (~4) ---
  const videos: Array<[string, string, number, string]> = [
    ["file:///placeholder/moonboard_v5.mp4",   "moonboard_v5.mp4",   47, day0],
    ["file:///placeholder/outdoor_lead.mp4",    "outdoor_lead.mp4",   183, day1],
    ["file:///placeholder/campus_session.mp4",  "campus_session.mp4", 92,  day3],
    ["file:///placeholder/proj_send.mp4",       "proj_send.mp4",      64,  day6],
  ];
  for (const [uri, filename, duration, recordedAt] of videos) {
    await db.runAsync(
      `INSERT INTO videos (uri, filename, duration_seconds, recorded_at) VALUES (?, ?, ?, ?)`,
      [uri, filename, duration, recordedAt]
    );
  }

  // --- Workouts (~2) ---
  const workouts: Array<[string, string[]]> = [
    ["Upper Body Pull", ["Pull-ups", "Weighted Pull-ups", "Finger Curls"]],
    ["Power Day",       ["Campus Board", "Deadlifts", "Push-ups"]],
  ];
  for (const [name, exercisesList] of workouts) {
    await db.runAsync(
      `INSERT INTO workouts (name, exercises) VALUES (?, ?)`,
      [name, JSON.stringify(exercisesList)]
    );
  }
}
