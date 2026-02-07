# beta-log

A mobile app for tracking climbing and bouldering training sessions. Built with React Native and Expo.

## Features

### Hangboard Timer
- Configurable interval timer with sets, reps, work time, rep rest, and set rest
- Optional weight (lbs) and edge size (mm) tracking
- Visual phase indicators: **WORK** / **REP REST** / **SET REST**
- Pause, resume, skip, and reset controls
- Save and load timer presets for quick access
- Completed sessions are automatically logged to history

### Exercise Logging
- Manually log any climbing exercise (campus board, pull-ups, etc.)
- Track sets, reps, climbing grade, and notes

### History
- View completed hangboard sessions and manually logged exercises
- Toggle between Hangboarding and Exercises tabs
- Delete individual entries

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Language | TypeScript |
| Routing | Expo Router (file-based) |
| Database | SQLite (expo-sqlite) |
| State | Zustand |

All data is stored locally on-device via SQLite.

## Getting Started

### Prerequisites

- Node.js 18+
- iOS: Xcode with iOS Simulator
- Android: Android Studio with an emulator

### Install & Run

```bash
git clone <repo-url>
cd beta-log
npm install
npx expo start
```

Press `i` to open in iOS Simulator or `a` for Android emulator.

### Scripts

```bash
npm start         # Start Expo dev server
npm run ios       # Start and open iOS simulator
npm run android   # Start and open Android emulator
```

## Project Structure

```
app/                    File-based routing (Expo Router)
  (tabs)/               Tab navigation: Hangboarding, Log, History
components/             Reusable UI components
db/database.ts          SQLite schema, migrations, and CRUD functions
store/useTimerStore.ts  Zustand store (timer state machine)
types/index.ts          Shared TypeScript interfaces
```

## Roadmap

- [ ] Video recording and playback for climb attempts
- [ ] Workout templates and programs
- [ ] Progress tracking and charts
- [ ] Cloud sync
