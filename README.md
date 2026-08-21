# HSPlanner Web

> **Derived from** [HeroSiegePlanner/HSPlanner](https://github.com/HeroSiegePlanner/HSPlanner) (desktop/Tauri version, by zium1337 & contributors, MIT License).
> This fork ports the desktop app to a **pure web app**: the Rust calc engine is compiled to WebAssembly and runs in a Web Worker. All credit for the original planner, data, and engine goes to the upstream project — see the [original README](https://github.com/HeroSiegePlanner/HSPlanner#readme) and [CHANGELOG](./CHANGELOG.md).

A **web build planner** for **Hero Siege** — a calculator for the talent tree, gear, stats, and skills, running fully in the browser.

This is a web-first port of the desktop [HSPlanner](https://github.com/HeroSiegePlanner/HSPlanner): the original Rust calc engine (`engine/`) is compiled to **WebAssembly** and driven by a **Web Worker**, so every DPS / stats / talent-suggestion number is identical to the desktop app, with no server required.

## Features

- [x] **Talent tree** — interactive pan/zoom graph view with auto-pathfinding, path preview on hover, and reset
- [x] **Skills** — point allocation that respects skill prerequisites and per-level caps
- [x] **Gear** — slots for weapons, armor, charms, jewelry with sockets (gems/runes) and runeword detection
- [x] **Affixes** — add affixes with tier and adjustable roll
- [x] **Stats** — aggregated bonuses from tree, gear, attributes, and runewords (computed by the Rust→WASM engine)
- [x] **Custom stats** — free-text user-entered stats for things outside the data model
- [x] **Notes** — sanitized WYSIWYG editor (per build), preserved across share links
- [x] **Builds menu** — multiple saved builds, each with multiple profiles (stored in `localStorage`)
- [x] **Share** — export the entire build to a compressed URL (`?b=<code>`, lz-string)
- [x] **Seasons** — Season 9 / Season 10 data patches

## Quick start (development)

Prerequisites:

| Tool | Purpose |
|---|---|
| Node.js ≥ 20 | Frontend (Vite + React) |
| Rust toolchain (`rustup`, stable) + `wasm32-unknown-unknown` target | Compiling the calc engine to WASM |
| `wasm-bindgen-cli` 0.2.118 | Generating the JS↔WASM glue |

```bash
# 1. install JS deps
npm install

# 2. build the wasm engine (run again whenever engine/ or data/ changes)
npm run build:wasm

# 3. dev server
npm run dev
```

Production build: `npm run build` (runs the wasm step automatically, then Vite → `dist/`).

### Windows notes

- The default `stable-x86_64-pc-windows-msvc` host toolchain requires MSVC linkers for host-side build scripts. On machines without VS Build Tools, switch to the self-contained GNU toolchain:

  ```bash
  rustup toolchain install stable-x86_64-pc-windows-gnu --profile minimal --target wasm32-unknown-unknown
  rustup default stable-x86_64-pc-windows-gnu
  ```

- Install `wasm-bindgen-cli` by downloading the release binary that matches the crate version (see `engine/Cargo.lock`) and placing it on `PATH` (e.g. `~/.cargo/bin`).
- Add `~/.cargo/bin` to your shell `PATH` so `cargo` / `wasm-bindgen` resolve in npm scripts.

## Architecture (what changed vs. the desktop app)

```
browser
├── main thread  ── React UI (unchanged)
│                  frontend/wasm/engineRpc.ts   invoke()/listen() shim, same shapes as Tauri IPC
└── web worker   ── frontend/wasm/engine.worker.ts
                   frontend/wasm/engine/        wasm-bindgen output (app_lib.js + 6.7MB wasm incl. all game data)
                     └── engine/src/wasm.rs     JSON dispatcher over the same 14 commands the Tauri app exposes
```

- `engine/` (Rust) keeps its calc core untouched; Tauri-only code is behind `#[cfg(not(target_family = "wasm"))]` and `tauri-build` was dropped from `build.rs`, so the wasm build carries no Tauri dependency.
- Suggest/warmup progress, formerly Tauri events, now flow as worker `postMessage` events through the same `listen()` shim.
- Deep links: `hsp://b/<id>` desktop links are replaced by `?b=<code>` / `?b=<id>` URL parameters.
- UI zoom uses CSS `zoom` instead of the webview API.
- The desktop (Tauri) build path was removed in this fork: no updater, no `tauri.conf.json` flow. All persistence stays in `localStorage`, exactly like before.

## FAQ

**Q:** *Can I import my save file from the game into the planner?*

**A:** *No. It is against the EULA/TOS.*
