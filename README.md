# DKeeper

A note-taking app running entirely on the Internet Computer. Notes are stored in a Motoko canister using stable state, so they survive canister upgrades. The React frontend talks directly to the canister through generated Candid bindings.

## Stack

- **Backend:** Motoko canister (`DKeeper` actor) with `stable var` note storage
- **Frontend:** React 18, TypeScript, Webpack 5
- **ICP tooling:** DFX 0.14+, `@dfinity/agent` generated declarations
- **Icons:** lucide-react

## Canister interface

```
createNote(title: text, content: text) -> (Note)
readNotes() -> (vec Note) query
removeNote(id: nat) -> () oneway
```

Notes carry a stable `id: Nat` assigned by the canister. Delete operations match by ID, not array index.

## Local dev

Prerequisites: [DFX](https://internetcomputer.org/docs/current/developer-docs/getting-started/install/), Node 18+, pnpm.

```bash
pnpm install
dfx start --background
dfx deploy --network=local
pnpm start
```

The dev server proxies `/api` to the local replica at `http://127.0.0.1:4943`. Open `http://localhost:8080`.

To rebuild after changing the Motoko canister:

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