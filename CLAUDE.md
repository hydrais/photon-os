# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Photon OS is a browser-based operating system framework. Apps run in sandboxed iframes and communicate with the OS shell via PostMessage RPC (using `pm-rpc` library).

## Monorepo Structure

```
photon/
├── sdk/     # Core OS SDK - types, OS class, AppManager
├── react/   # React hooks for apps using Photon (useInstalledApps)
└── os/      # Main OS shell application (Vite + React)
```

The `os` package depends on local `../sdk` and `../react` packages via file: protocol.

## Build Commands

**SDK Package** (`/sdk`):
```bash
npm run build   # Build with tsup
npm run dev     # Watch mode
```

**React Package** (`/react`):
```bash
npm run build   # Build with tsup
npm run dev     # Watch mode
```

**OS Application** (`/os`):
```bash
npm run dev     # Vite dev server with HMR
npm run build   # TypeScript check + Vite production build
npm run lint    # ESLint
npm run preview # Preview production build
```

## Architecture

### Communication Pattern
- Apps in iframes use SDK's `OS` class to call parent OS methods via RPC
- SDK's `AppManager` wraps RPC calls: `getInstalledApps()`, `launchApp()`, `requestAppInstall()`, `requestAppUninstall()`
- OS implements `OperatingSystemAPI` interface (defined in `sdk/src/types/os.ts`)

### Key Files
- `sdk/src/framework/OS.ts` - SDK entry point, creates AppManager
- `sdk/src/framework/AppManager.ts` - App lifecycle methods via RPC
- `sdk/src/types/os.ts` - `OperatingSystemAPI` contract (8 methods)
- `os/src/lib/os/OperatingSystemContext.tsx` - Global OS state provider
- `os/src/lib/os/hooks/useApps.ts` - Running apps state management
- `os/src/components/system/app-view.tsx` - Multitasking UI with card-based app switcher

### App Lifecycle
- `AppDefinition`: bundleId, name, author, url
- `RunningAppInstance`: definition, startedAt, lastForegroundedAt, isInBackground
- Apps maintain iframe refs in `OperatingSystemContext` for multitasking
- System apps (Launcher, Settings) are filtered from the installed apps list

### Routing (`os/src/App.tsx`)
- `/` - System main view (StatusBar + AppView + NavigationBar)
- `/__launcher` - App launcher grid
- `/__settings` - Settings page

## Tech Stack

- React 19, TypeScript 5.9, Vite 7
- Tailwind CSS v4 + shadcn/ui (Radix-based components)
- react-router v7 for routing
- pm-rpc for iframe communication
- tsup for SDK/React package builds
