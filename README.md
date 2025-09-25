## Net Worth Planner

A React + Vite app with optional Electron shell for a desktop experience.

### Prerequisites

- **Node.js**: 20.x LTS or newer
- **npm**: 9+ (ships with Node 20)

If you use `nvm`:

```bash
nvm install 20
nvm use 20
```

### Install dependencies

```bash
npm install
```

### Run the web app (Vite dev server)

```bash
npm run dev
```

- Default dev server: `http://localhost:5173`
- Vite will hot-reload on changes.

### Run the desktop app (Electron, development)

This starts Vite and then launches Electron once the dev server is ready.

```bash
npm run electron-dev
```

Notes:
- This script waits on `http://localhost:5173`. Ensure port 5173 is free.
- If 5173 is busy and Vite prompts to use another port, Electron will not launch. Either free 5173 or explicitly start Vite on 5173:

```bash
npm run dev -- --port 5173
# in another terminal
npm run electron
```

### Build the web app (production)

```bash
npm run build
```

Artifacts are emitted to `dist/`. To locally preview the production build:

```bash
npm run preview
```

### Package the desktop app (Electron)

Builds the web assets and packages a desktop app using `electron-builder`.

```bash
# No publish; outputs installers/binaries locally
npm run dist

# Or build for all supported platforms from this host (if tooling present)
npm run dist-all
```

Common outputs:
- Staging web assets: `dist/`
- Packaged app artifacts: `release/` (e.g., AppImage on Linux)

If you need only a local runnable Electron app folder (unpacked):

```bash
npm run pack
```

### Troubleshooting

- **Electron window stays blank**: Verify the Vite dev server is running on `http://localhost:5173` before `npm run electron-dev` launches. Free port 5173 or force Vite to use it with `--port 5173`.
- **Build fails on fresh machine**: Ensure Node 20+. After `npm install`, the postinstall step installs Electron native deps automatically.

### Scripts reference

- `npm run dev`: Start Vite dev server
- `npm run build`: Build production web assets
- `npm run preview`: Preview built web assets
- `npm run electron`: Launch Electron pointing at local files (expects running dev server or packaged files depending on context)
- `npm run electron-dev`: Start Vite, wait for `http://localhost:5173`, then launch Electron
- `npm run dist`: Build web assets and package app for current OS (no publish)
- `npm run dist-all`: Build for macOS, Windows, Linux (from a properly configured host/CI)
- `npm run pack`: Build web assets and create an unpacked app directory


