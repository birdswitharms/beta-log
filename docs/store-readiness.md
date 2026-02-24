# App Store Readiness Audit

## Blocking Issues (must fix before submission)

- [x] Add `buildNumber` (iOS) and `versionCode` (Android) to `app.json`
- [x] Configure iOS production build profile in `eas.json`
- [x] Add privacy policy URL to `app.json`

## High Priority (strongly recommended)

- [x] Add Error Boundary component for uncaught JS exceptions
- [x] Configure OTA updates (`expo-updates`) to enable fixes without store resubmission
- [x] Improve DB migration strategy with schema version tracking

## Medium Priority

- [x] Convert `splash-icon.png` from 8-bit colormap to RGBA
- [x] Add `credentialsSource: "remote"` to `eas.json` for CI/CD
- [x] Document app keywords and category for store optimization

## Already Good

- Code quality clean — no console.logs, TODOs, or leaked debug code
- Permission strings clear and justified
- Error handling in async code has proper try/catch with fallbacks
- Assets correct sizes (1024x1024)
- Dev tools properly gated behind `__DEV__`
- Splash screen configured with dark theme
