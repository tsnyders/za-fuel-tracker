# SA Fuel Tracker 🇿🇦

A free, open-source Android application that displays current and historical South African retail fuel prices — built with React Native and Samsung One UI design guidelines.

---

## What It Does

SA Fuel Tracker gives South African drivers instant access to the latest Department of Energy (DoE) fuel price announcements, updated monthly. The app displays retail pump prices for all four regulated fuel types across inland and coastal zones, with full historical data going back to January 2024.

**No ads. No login. No paywalls.**

---

## Features

- **Current month prices** — 95 ULP, 93 ULP, Diesel Inland, Diesel Coastal
- **Price history** — monthly trend charts from January 2024 to present
- **Month-over-month delta** — shows price movement (▲/▼) vs the previous month
- **Statistics** — 12-month high, low, and average per fuel type
- **Automatic fallback** — if the primary API is unavailable, prices are sourced from OpenVan.camp (CC BY 4.0)
- **Offline banner** — notifies the user when operating on fallback data
- **Samsung One UI design** — adaptive layout for phones and tablets, bottom navigation, 48dp touch targets
- **Pull to refresh** — live price refresh on any screen

---

## How It Works

### Data Architecture

```
┌─────────────────────────────────────────┐
│             SA Fuel Tracker App          │
│                                         │
│  ┌──────────┐   ┌──────────────────┐   │
│  │ HomeScreen│   │  HistoryScreen   │   │
│  └────┬─────┘   └────────┬─────────┘   │
│       │                  │             │
│       └────────┬─────────┘             │
│                │                       │
│         useFuelPrices()                │
│         (React Query cache)            │
│                │                       │
│         fuelApi.ts                     │
│                │                       │
│       ┌────────┴────────┐              │
│       │                 │              │
│  PRIMARY API       FALLBACK API        │
│  fuelpriceapi.co.za  openvan.camp      │
│  (SA-specific,       (120+ countries,  │
│   no auth, free)      CC BY 4.0)       │
└─────────────────────────────────────────┘
```

### Primary API — SA Fuel Price API
- **Base URL:** `https://fuelpriceapi.co.za/api`
- **Auth:** None required
- **Data:** 95 ULP, 93 ULP, Diesel Inland, Diesel Coastal | Jan 2024 → present
- **Update cycle:** First Wednesday of each month (DoE announcement)
- **Endpoints used:**
  - `GET /current` — latest month prices
  - `GET /history?from=YYYY-MM` — historical monthly prices

### Fallback API — OpenVan.camp
- **Base URL:** `https://openvan.camp/api/fuel/prices`
- **Auth:** None required
- **Licence:** CC BY 4.0 (attribution displayed in-app when active)
- **Coverage:** 120+ countries including South Africa (`ZA`)
- **Limitation:** Does not differentiate 95/93 ULP or inland/coastal — both grades show the same national average when fallback is active

### Caching
React Query (`@tanstack/react-query`) handles all data fetching with automatic background refresh, stale-while-revalidate, and per-query cache TTL. No local database is required.

---

## Project Structure

```
sa-fuel-tracker/
├── .github/
│   └── workflows/
│       └── android-release.yml   # CI/CD — auto-build + release on main push
├── android/                      # Native Android project (Kotlin entry points, Gradle)
│   └── app/
│       ├── build.gradle
│       └── src/main/
│           ├── AndroidManifest.xml
│           └── java/com/claudeclaw/safueltracker/
├── src/
│   ├── api/
│   │   ├── client.ts             # Primary + fallback API clients
│   │   ├── fuelApi.ts            # Fetch functions, price formatters, fallback logic
│   │   └── queryKeys.ts          # React Query key factory
│   ├── components/
│   │   ├── Calculator.tsx
│   │   ├── ErrorState.tsx
│   │   ├── FallbackAttribution.tsx  # CC BY 4.0 banner (shown on fallback)
│   │   ├── FuelCard.tsx
│   │   ├── LoadingState.tsx
│   │   ├── OfflineBanner.tsx
│   │   └── PriceChart.tsx        # SVG line chart (react-native-svg)
│   ├── hooks/
│   │   ├── useAdaptiveLayout.ts  # Reactive Samsung One UI breakpoints
│   │   ├── useFuelPrices.ts      # React Query data hooks
│   │   └── useNetworkStatus.ts   # NetInfo-based offline detection
│   ├── navigation/
│   │   └── AppNavigator.tsx      # Bottom tab + stack navigation
│   ├── screens/
│   │   ├── HomeScreen.tsx        # Current month — all 4 fuel types
│   │   ├── HistoryScreen.tsx     # Monthly price history
│   │   └── DetailScreen.tsx      # Per-fuel-type detail + chart + stats
│   ├── theme/
│   │   └── oneUI.ts              # Samsung One UI colours, spacing, typography
│   └── types/
│       └── fuel.ts               # TypeScript interfaces and fuel type constants
├── App.tsx                       # Root component + React Query provider
├── index.js                      # React Native entry point
├── package.json
└── tsconfig.json
```

---

## Screens

| Screen | Description |
|--------|-------------|
| **Home** | Current month prices for all four fuel types as cards. Pull to refresh. |
| **History** | Monthly price list across all fuel types. Tap any month to drill in. |
| **Detail** | Hero price card, MoM delta, SVG trend chart, and 12-month statistics for a single fuel type. |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.76 |
| Language | TypeScript 5 |
| Navigation | React Navigation 6 (bottom tabs + native stack) |
| Data fetching | TanStack React Query 5 |
| Charts | react-native-svg |
| Network detection | @react-native-community/netinfo |
| Design system | Samsung One UI 6.x (custom theme in `src/theme/oneUI.ts`) |
| Target platform | Android 9+ (API level 28+) |
| Build tool | Gradle 8 / Android Gradle Plugin 8.7 |

---

## CI/CD Pipeline

Every push to `main` (or PR merged into `main`) triggers an automated GitHub Actions build:

```
Push to main
     │
     ▼
┌──────────────────────────────────────┐
│  Android Beta Release Workflow        │
│                                      │
│  1. Checkout code                    │
│  2. Setup Node.js 20 + npm install   │
│  3. Setup JDK 17 (Temurin)           │
│  4. Setup Android SDK + NDK          │
│  5. Configure release signing        │
│     (from GitHub Secrets)            │
│  6. ./gradlew assembleRelease        │
│  7. Compute beta version tag         │
│  8. Create GitHub Release            │
│     + attach signed APK              │
└──────────────────────────────────────┘
```

### Release Naming Convention

| Run | Tag |
|-----|-----|
| First build | `betaV1.0` |
| Second build | `betaV1.0.1` |
| Third build | `betaV1.0.2` |

All releases are marked as **pre-release** until promoted to stable.

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `KEYSTORE_BASE64` | Base64-encoded release keystore |
| `KEYSTORE_STORE_PASSWORD` | Keystore store password |
| `KEYSTORE_KEY_ALIAS` | Key alias (`sa-fuel-tracker`) |
| `KEYSTORE_KEY_PASSWORD` | Key password |

> If signing secrets are absent, the workflow falls back to debug signing (developer installs only).

---

## Local Development

### Prerequisites
- Node.js 20+
- JDK 17
- Android Studio with SDK 35 and NDK 27
- React Native CLI

### Setup

```bash
# Clone the repo
git clone https://github.com/tsnyders/za-fuel-tracker.git
cd za-fuel-tracker

# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on Android device / emulator
npm run android
```

### Type Checking

```bash
npm run type-check
```

---

## API Attribution

- **SA Fuel Price API** — [fuelpriceapi.co.za](https://fuelpriceapi.co.za) — Primary data source. Free, no auth required. FIASA-verified data.
- **OpenVan.camp** — [openvan.camp](https://openvan.camp/en/developers) — Fallback data source. Licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

---

## Licence

MIT — free to use, modify, and distribute.

---

*Built by Tyrell Snyders — Project 05 in a deliberate portfolio arc.*
