# DKeeper
<!-- version: v0.4.0 -->
![Version](https://img.shields.io/badge/version-v0.4.0-blue)

A note-taking app running entirely on the Internet Computer. Notes are stored in a Motoko canister using stable state, so they survive canister upgrades. The React frontend talks directly to the canister through generated Candid bindings — no REST API, no external database, no browser storage.

## Stack

| Layer | Tech |
|---|---|
| Backend | Motoko canister, `stable var` storage, DFX 0.14+ |
| Frontend | React 18, TypeScript 5.9, Webpack 5 |
| ICP bindings | `@dfinity/agent`, generated Candid declarations |
| Icons | lucide-react |
| Package manager | pnpm |

## Canister interface

```
createNote(title: text, content: text) -> (Note)
readNotes() -> (vec Note) query
removeNote(id: nat) -> () oneway
```

`Note` record: `{ id: nat; title: text; content: text }`. The canister assigns a stable monotonic `id` — delete operations match by ID, not array index.

## Local dev

Prerequisites: [DFX](https://internetcomputer.org/docs/current/developer-docs/getting-started/install/), Node 18+, pnpm.

```bash
pnpm install
dfx start --background
dfx deploy --network=local
pnpm start
```

The dev server proxies `/api` to the local replica at `http://127.0.0.1:4943`. App runs at `http://localhost:8080`.

### After changing the Motoko canister

```bash
dfx deploy --network=local
dfx generate dkeeper_backend
pnpm start
```

## Production build

```bash
pnpm run build
```

Outputs to `dist/dkeeper_frontend/`. Deploy with `dfx deploy --network=ic`.

## Changelog
- **v0.4.0** (2026-09-28): minor bump
