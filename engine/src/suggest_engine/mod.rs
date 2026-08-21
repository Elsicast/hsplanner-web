pub mod aggregate;
pub mod algo;
// Tauri IPC wrapper; the wasm binding drives algo::suggest directly.
#[cfg(not(target_family = "wasm"))]
pub mod command;
pub mod engine;
pub mod types;
