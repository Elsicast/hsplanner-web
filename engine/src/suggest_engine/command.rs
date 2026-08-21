use super::algo::{suggest, ProgressPayload};
use super::types::{PrecomputedInput, SuggestResult};
use tauri::Emitter;

// A panic inside suggest() must degrade to "no suggestions" instead of
// re-panicking on the IPC runtime thread.
async fn join_or_default(
    task: tauri::async_runtime::JoinHandle<SuggestResult>,
) -> SuggestResult {
    task.await.unwrap_or_else(|e| {
        eprintln!("suggest_tree_nodes task panicked: {e}");
        SuggestResult::default()
    })
}

#[tauri::command]
pub async fn suggest_tree_nodes(
    app: tauri::AppHandle,
    input: PrecomputedInput,
) -> SuggestResult {
    // CPU-heavy greedy/DPS loop runs on a blocking thread so the webview stays
    // responsive; SeasonScope lives inside the closure so it never crosses an .await.
    let season = input.season.clone();
    join_or_default(tauri::async_runtime::spawn_blocking(move || {
        let _scope = crate::calc::season::SeasonScope::enter(season);
        let emit = |current: u32, total: u32| {
            let _ = app.emit(
                "suggest-progress",
                ProgressPayload { current, total },
            );
        };
        suggest(&input, Some(&emit))
    }))
    .await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn panicked_task_returns_default_result() {
        let result = tauri::async_runtime::block_on(async {
            let task = tauri::async_runtime::spawn_blocking(|| -> SuggestResult {
                panic!("boom")
            });
            join_or_default(task).await
        });
        assert_eq!(result, SuggestResult::default());
    }
}
