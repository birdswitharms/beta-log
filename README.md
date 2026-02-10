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

## Roadmap

- [ ] Video recording and playback
- [ ] Session tracking to organize videos, and notes
- [ ] Workout templates
- [ ] Progress tracking and charts for both exercise and hangboarding
