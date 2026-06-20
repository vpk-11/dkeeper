# PROJECT_CONTEXT.md

## One-Liner
DKeeper is an ICP note app: a React 18 TypeScript frontend creates and deletes `{ id, title, content }` notes through a Motoko backend canister, and the note list is persisted in canister stable state rather than browser storage.

## Current State
- As of: 2026-06-20
- What is actually running and confirmed working:
  - The Motoko backend in `src/dkeeper_backend/main.mo` assigns stable monotonic `id: Nat` to every note. `createNote` returns the created note. `removeNote` filters by ID using `List.filter`. Candid is regenerated and in sync.
  - `pnpm run build` (runs `dfx generate` then `webpack`) compiles cleanly: webpack 5.107.2 compiled successfully with all TSX source files.
  - All frontend source is TypeScript (`.tsx`). React 18 `createRoot` API in use. No `.jsx` files remain.
  - MUI v4 removed entirely. Icons replaced with `lucide-react` (Plus, Trash2, NotebookPen).
  - `fetchData()` has try/catch error handling and a visible error state.
  - Input validation in `CreateArea.tsx` blocks empty title or content submissions.
  - Delete passes `note.id: bigint` to the canister, not array index. `key` props use `String(note.id)`.
  - Loading and empty states rendered in `App.tsx`.
  - External `transparenttextures.com` URL replaced with a CSS grid pattern.
  - Malformed `<link>` tag in `index.html` fixed.
  - Graphify knowledge graph initialized at `graphify-out/`. Post-commit hook active.
- What is broken, incomplete, or stubbed out:
  - No tests for canister behavior or frontend interaction paths.
  - No auth, no access control, no user identity. Any caller can mutate the shared note list.
  - The Motoko VS Code extension shows a false `M0010: package "base" not defined` warning. The canister compiles correctly under dfx. This is an IDE language server config issue, not a code issue.
- What is mocked, hardcoded, or clearly placeholder:
  - The UI is a single notes experience with no routing or multi-page structure.
  - `@dfinity/agent` 0.19.x is deprecated upstream (superseded by `@icp-sdk/core`). Migration is a separate task.
- Overall readiness: local only, webpack build clean, core correctness bugs fixed, not production-ready.

## Core Stack

### Frontend
- React 18.3.1 and `react-dom` 18.3.1. `createRoot` API in use.
- All source is TypeScript. Components: `App.tsx`, `Header.tsx`, `Footer.tsx`, `CreateArea.tsx`, `Note.tsx`.
- Entry point is `src/dkeeper_frontend/src/index.tsx`.
- Styling is plain CSS in `src/dkeeper_frontend/assets/styles.css`. CSS custom properties (tokens) for colors, spacing, fonts.
- Icons via `lucide-react` 1.21.0 (Plus, Trash2, NotebookPen). No MUI dependency.
- Webpack front-end stack:
  - `webpack` 5.107.2
  - `webpack-cli` 5.1.4
  - `webpack-dev-server` 5.2.5
  - `html-webpack-plugin` 5.6.7
  - `copy-webpack-plugin` 11.x
  - `ts-loader` 9.6.1
  - `typescript` 5.9.3
- Package manager: pnpm 10.x (`pnpm-lock.yaml`). No `package-lock.json`.

### Backend
- Motoko canister in `src/dkeeper_backend/main.mo`.
- Uses `mo:base/List` only. `Debug` import removed.
- Actor name is `DKeeper`.
- Public backend methods:
  - `createNote(titleText: Text, contentText: Text) : async Note`
  - `readNotes() : async [Note]` (query)
  - `removeNote(id: Nat)` (oneway)
- The backend stores all notes in `stable var notes: List.List<Note>` and a `stable var nextId: Nat = 0` counter.

### AI / LLM Layer
- None exists.
- There are no model calls, prompts, embeddings, or agent abstractions in this repository.

### Database & Storage
- No external database.
- Notes are stored in Motoko stable state inside the backend canister.
- The data model is a single record type:
  - `Note = { id: Nat; title: Text; content: Text }`
- Persistence mechanism:
  - `stable var notes` and `stable var nextId` both survive canister upgrades.
  - `createNote` prepends with `List.push`, so `readNotes` returns newest-first.
  - `removeNote` uses `List.filter(notes, func(n) { n.id != id })`.
- There is no timestamp, owner, or version field.

### External APIs & Integrations
- DFINITY agent stack via generated wrappers in `src/declarations/dkeeper_backend/index.js` and `src/declarations/dkeeper_frontend/index.js`.
- Local replica integration through the dev-server proxy in `webpack.config.js`:
  - `/api` -> `http://127.0.0.1:4943`
- ICP asset canister runtime is implied by `dfx.json` and the generated frontend Candid in `src/declarations/dkeeper_frontend/dkeeper_frontend.did`.
- External web assets:
  - Google Fonts in `src/dkeeper_frontend/src/index.html`
  - `transparenttextures.com` background image in `src/dkeeper_frontend/assets/styles.css`

### Dev Tooling
- DFX 0.14.3 is recorded in `.env`.
- Package manager: pnpm 10.x. Lockfile: `pnpm-lock.yaml`.
- Build and generate flow:
  - `prebuild`: `dfx generate`
  - `build`: `webpack`
  - `prestart`: `npm run copy:types` (rsync declarations from `.dfx/`)
  - `start`: `webpack serve --mode development --env development`
- `dotenv` loads environment variables in `webpack.config.js`.
- `tsconfig.json`: target ES2020, `jsx: react-jsx` (automatic transform), `moduleResolution: bundler`, strict mode.
- There is no test runner configured.
- Graphify knowledge graph at `graphify-out/`. Post-commit hook rebuilds AST layer on every commit.

### Deployment Config
- `dfx.json` defines two canisters:
  - `dkeeper_backend` -> `src/dkeeper_backend/main.mo`
  - `dkeeper_frontend` -> asset canister with entrypoint `src/dkeeper_frontend/src/index.html`
- `dfx.json` sets `output_env_file` to `.env`.
- `webpack.config.js` emits the browser bundle to `dist/dkeeper_frontend/`.
- There is no Dockerfile, no `vercel.json`, no `railway.toml`, and no CI deployment config in the repo.

## Architecture Summary
- Overall shape: single ICP app, not a traditional web server. The frontend is a React SPA served as ICP assets, and the backend is one Motoko actor canister.
- Key files and ownership:
  - `src/dkeeper_backend/main.mo`: note storage and canister methods.
  - `src/dkeeper_frontend/src/components/App.tsx`: application state, fetch, optimistic create, delete by stable ID.
  - `src/dkeeper_frontend/src/components/CreateArea.tsx`: note input form, validation, lucide Plus icon.
  - `src/dkeeper_frontend/src/components/Note.tsx`: per-note display, delete by `id: bigint`, lucide Trash2 icon.
  - `src/dkeeper_frontend/src/components/Header.tsx`: title bar, lucide NotebookPen icon.
  - `src/dkeeper_frontend/src/components/Footer.tsx`: year footer.
  - `src/dkeeper_frontend/src/index.tsx`: React 18 `createRoot` bootstrap.
  - `src/dkeeper_frontend/src/index.html`: browser shell and Google Fonts link.
  - `src/dkeeper_frontend/assets/styles.css`: CSS custom properties, responsive grid layout, all visual design.
  - `src/declarations/dkeeper_backend/index.js`: generated actor wrapper used by the app.
  - `src/declarations/dkeeper_backend/dkeeper_backend.did`: generated service contract for the backend.
  - `webpack.config.js`: bundling, env injection, dev-server proxy (array format for WDS v5), static asset handling.
  - `dfx.json`: canister topology and asset source mapping.
  - `package.json`: scripts and dependency graph.
  - `graphify-out/`: Graphify knowledge graph (committed). Post-commit hook rebuilds on every commit.
- Data model:
  - One stable list of notes in the backend canister: `{ id: Nat; title: Text; content: Text }`.
  - `nextId: Nat` counter, stable across upgrades.
  - No schema migration layer, no collections, no secondary indexes.
- Notable patterns:
  - Actor-based backend over DFINITY agent-generated Candid bindings.
  - `createNote` returns the created `Note`, so the frontend uses the canister-assigned ID immediately.
  - Delete is ID-based end-to-end: frontend filters by `n.id !== id`, canister uses `List.filter` by ID.
  - Generated-declaration-driven frontend: the app imports `../../../declarations/dkeeper_backend/index`.

## Runtime Flow
1. App bootstrap:
   - `src/dkeeper_frontend/src/index.tsx` calls `createRoot(container).render(<App />)`.
   - `App` mounts with `notes = []`, `loading = true`, `error = null`.
   - `useEffect(() => { fetchData(); }, [])` triggers a backend read on first render.
2. Initial data load:
   - `fetchData()` wraps `await dkeeper.readNotes()` in try/catch. On success: `setNotes(notesArray)`. On failure: `setError("Failed to load notes...")`.
   - `dkeeper` comes from `src/declarations/dkeeper_backend/index.js`, which creates an `HttpAgent`-backed actor using `CANISTER_ID_DKEEPER_BACKEND` or `DKEEPER_BACKEND_CANISTER_ID`.
   - Loading and empty states are rendered in `App.tsx` based on `loading`, `error`, and `notes.length`.
3. Create note:
   - `CreateArea.tsx` blocks submit if `title.trim()` or `content.trim()` is empty, shows inline validation error.
   - On valid submit, calls `props.onAdd(note)` and clears form state.
   - `App.addNote()` calls `await dkeeper.createNote(...)` (returns the created `Note` with its canister-assigned `id: bigint`), then prepends it to local state.
4. Delete note:
   - `Note.tsx` calls `props.onDelete(props.id)` (type: `bigint`) on trash button click.
   - `App.deleteNote(id)` calls `dkeeper.removeNote(id)` (oneway, fire-and-forget) and filters local state with `n.id !== id`.

## API / Router Surface
- Backend canister `DKeeper` in `src/dkeeper_backend/main.mo`:
  - `createNote(text, text) -> (Note)` awaitable, returns created note with stable ID.
  - `readNotes() -> (vec Note)` query, implemented.
  - `removeNote(nat) -> ()` oneway, matches by ID via `List.filter`.
- Frontend asset canister surface in `src/declarations/dkeeper_frontend/dkeeper_frontend.did`:
  - Standard IC asset-canister methods such as `http_request`, `get`, `list`, `store`, `create_batch`, `commit_batch`, and related asset-management calls.
  - These are runtime canister methods, not app-specific routers.
- Dev-server surface from `webpack.config.js`:
  - `/api` is proxied to `http://127.0.0.1:4943`.
- There are no REST controllers, tRPC procedures, Express routes, or custom client routes.

## Environment
### Required
- `CANISTER_ID_DKEEPER_BACKEND` or `DKEEPER_BACKEND_CANISTER_ID`:
  - Used by `src/declarations/dkeeper_backend/index.js` to construct the backend actor.
  - If both are missing, the frontend actor is created with an undefined canister ID and backend calls fail.

### Optional
- `DFX_NETWORK`:
  - Controls the local root-key fetch path in the generated actor wrappers.
  - Controls `npm run copy:types` path selection for `.dfx/<network>/canisters/**`.
- `CANISTER_ID_DKEEPER_FRONTEND` / `DKEEPER_FRONTEND_CANISTER_ID`:
  - Used by `src/declarations/dkeeper_frontend/index.js`.
  - Not imported by `App.jsx`, so currently infrastructure-level rather than app-critical.
- `CANISTER_ID_dkeeper_backend`, `CANISTER_ID_dkeeper_frontend`, `CANISTER_ID`, `CANISTER_CANDID_PATH`, `CANISTER_CANDID_PATH_dkeeper_backend`, and `CANISTER_CANDID_PATH_DKEEPER_BACKEND`:
  - Generated by DFX into `.env`.
  - Needed for DFX-generated tooling and some declaration workflows, not by the handwritten React components directly.
- `DFX_VERSION`:
  - Informational only in the generated `.env`.
- `NODE_ENV`:
  - Changes webpack mode and source-map behavior.

## Key Decisions
- Motoko stable state is the only persistence layer. No external DB, no browser storage, no synchronization service.
- The note list is LIFO because `createNote` uses `List.push` and `readNotes` converts the list to an array as-is.
- Delete semantics are ID-based. The canister assigns a stable monotonic `id: Nat`. The frontend passes `note.id: bigint` to delete, never an array index.
- `createNote` is awaitable and returns the created `Note`. The frontend uses the canister-assigned ID immediately without a refetch.
- `removeNote` is `oneway` (fire-and-forget). The UI updates optimistically on delete because the operation is simple enough that failure is recoverable by reload.
- The frontend is wired directly to generated Candid bindings, not to a custom API client abstraction.
- DFX owns the deployment topology. `dfx.json` is the source of truth for canister definitions and `.env` generation.
- Asset delivery is IC-native rather than a separate static host.
- pnpm is the package manager. `package-lock.json` was removed.

## Local Dev
```bash
pnpm install
dfx start --background
dfx deploy --network=local
pnpm start
```

```bash
pnpm run build
```

- `pnpm start` runs `prestart` first, which rsync-copies generated canister declaration files from `.dfx/<network>/canisters/**` into `src/declarations/`.
- `pnpm run generate` regenerates backend declarations only (runs `dfx generate dkeeper_backend`).
- After any Motoko change: `dfx deploy --network=local && dfx generate dkeeper_backend && pnpm start`.
- `dfx deploy --network=ic` targets the public IC network.

## Code Quality Flags
- Security:
  - No authentication or authorization on `createNote` or `removeNote`. Any caller with canister access can mutate the shared note list.
  - The frontend CSP in the generated asset metadata allows broad `connect-src` to `https://*.icp0.io` and `style-src * 'unsafe-inline'`.
  - Google Fonts is loaded from an external origin in `index.html`.
- Correctness:
  - All previously known correctness bugs are fixed: stable IDs, side-effect-free state updaters, validated form input, error-handled fetch.
  - `removeNote` with a non-existent ID is a no-op (`List.filter` returns the unchanged list).
- Reliability:
  - `fetchData()` has try/catch and surfaces a visible error state.
  - No retry path if the replica is unavailable.
  - `removeNote` is `oneway` — canister failure on delete is silent to the UI.
- Dependency debt:
  - `@dfinity/agent` 0.19.x, `@dfinity/candid` 0.19.x, `@dfinity/principal` 0.19.x are all deprecated upstream (superseded by `@icp-sdk/core`). Migration is a medium-lift task.
- Structural debt:
  - `src/declarations/` is gitignored and generated on every `dfx generate`. Fresh clone requires `dfx deploy` before `pnpm start`.
  - No test runner configured.

## Resume / Portfolio Highlights
- Real end-to-end ICP integration:
  - Motoko backend canister
  - generated Candid interface
  - generated actor wrapper
  - React frontend calling the canister through `@dfinity/agent`
- Stable state in the backend canister, which is more substantial than a browser-only notes app.
- Asset-canister deployment model with DFX-managed front-end packaging, not a generic SPA host.
- Clean separation between canister contract and React UI, even though the implementation is small.
- The project demonstrates an understanding of canister-generated environment wiring, local replica setup, and ICP asset delivery.

## Gap Analysis
### Completed this session
- Stable note IDs (canister assigns `id: Nat`, delete by ID not index).
- `fetchData()` error handling and visible error state.
- Input validation in `CreateArea.tsx`.
- Removed unused deps: `uuid`, `react-scripts`, `@material-ui/core`, `@material-ui/icons`, `Debug` import.
- Fixed malformed `<link>` in `index.html`.
- Replaced README workaround with accurate local dev flow.
- Migrated to pnpm. Upgraded React 17 -> 18, TypeScript 4 -> 5.9, Webpack 5.73 -> 5.107.
- Converted all source to TypeScript (`.tsx`).
- Replaced external texture with CSS pattern. Responsive layout.
- Loading and empty states.
- Graphify initialized, post-commit hook active.

### Remaining quick wins (< 1 day each)
- Migrate `@dfinity/*` 0.19.x to `@icp-sdk/core` (the upstream replacement).
- Self-host Google Fonts instead of loading from external origin.
- Fix Motoko VS Code extension `mo:base` warning by adding `mops.toml` or configuring the language server package path.

### Medium lifts (1-3 days each)
- Add tests for canister behavior (dfx test or motoko-matchers) and frontend interaction paths.
- Make `removeNote` non-oneway so failures surface to the UI.
- Tighten the generated asset CSP.
- Stabilize the declarations workflow so a fresh clone works without manual `dfx deploy`.

### Major reworks (1+ week)
- Add per-user auth and ownership so notes are not globally writable.
- Replace `List.List<Note>` with a `HashMap` or `TrieMap` keyed by ID for O(1) lookups and deletes.
- Add CI for build, canister generation, and deployment validation.
- Move from demo single-list to a production-grade product with lifecycle management, sync, and rollback behavior.

## Cleanup Notes
- `.DS_Store`, `dist/dkeeper_frontend/`, `.dfx/local/` are all gitignored.
- `src/declarations/` is gitignored and treated as derived output. The app imports from it directly; fresh clone requires `dfx deploy` to populate it.
- `graphify-out/` is committed (so teammates start with a map). `manifest.json`, `cost.json`, `.graphify_root`, `.graphify_python`, and dated snapshot dirs are gitignored.
- The project is a clean, intentional ICP portfolio piece. Stack is current (React 18, TS 5.9, Webpack 5.107, pnpm).
