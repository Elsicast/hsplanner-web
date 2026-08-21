// WebAssembly binding for the calc engine. Mirrors the Tauri command surface
// through a single JSON-in/JSON-out dispatcher so the frontend only swaps its
// IPC transport, not its payload shapes.
//
// The engine panics on malformed data by design (desktop runs it on a blocking
// thread); under wasm the panic strategy is abort, so the Web Worker owner of
// this module must reinstall it on `RuntimeError`. All expected errors
// (bad JSON, unknown command) are returned as `{"__error": "..."}` instead.

use std::cell::RefCell;

use wasm_bindgen::prelude::*;

use crate::calc::commands::{
    calc_build_performance, calc_build_stats, calc_stat_breakdown, classify_tree_nodes,
    compute_skill_damage, compute_weapon_damage, display_values, mana_cost_at_rank,
    passive_stats_at_rank, parse_custom_stats, rank_slot_items, subskill_aggregation,
    BuildPerformanceInput, DisplayValuesInput, PassiveSkillDto, RankSlotItemsInput,
    SkillDamageInput, StatBreakdownInput, SubskillAggregationInput, WeaponDamageInput,
};

thread_local! {
    // JS progress sink shared by warmup + suggest; survives across calls.
    static PROGRESS_CB: RefCell<Option<js_sys::Function>> = const { RefCell::new(None) };
}

fn emit_progress(current: u32, total: u32) {
    PROGRESS_CB.with(|slot| {
        if let Some(cb) = slot.borrow().as_ref() {
            let _ = cb.call2(&JsValue::NULL, &JsValue::from(current), &JsValue::from(total));
        }
    });
}

/// Register the progress sink used by `calc_warmup` / `suggest_tree_nodes`.
#[wasm_bindgen]
pub fn set_progress_callback(cb: js_sys::Function) {
    PROGRESS_CB.with(|slot| *slot.borrow_mut() = Some(cb));
}

fn error_json(message: impl std::fmt::Display) -> String {
    serde_json::json!({ "__error": message.to_string() }).to_string()
}

fn take<T: serde::de::DeserializeOwned>(
    args: &serde_json::Value,
    key: &str,
) -> Result<T, String> {
    serde_json::from_value(args.get(key).cloned().unwrap_or(serde_json::Value::Null))
        .map_err(|e| format!("invalid `{key}`: {e}"))
}

fn serialize<T: serde::Serialize>(value: T) -> Result<serde_json::Value, String> {
    serde_json::to_value(value).map_err(|e| format!("serialize failed: {e}"))
}

fn take_opt<T: serde::de::DeserializeOwned>(args: &serde_json::Value, key: &str) -> Option<T> {
    match args.get(key) {
        None | Some(serde_json::Value::Null) => None,
        Some(v) => serde_json::from_value(v.clone()).ok(),
    }
}

/// Dispatch a command by name with a JSON argument object (the same payload the
/// Tauri `invoke(cmd, args)` call would send). Returns the serialized result
/// or `{"__error": ...}`.
#[wasm_bindgen]
pub fn invoke_cmd(cmd: &str, args_json: &str) -> String {
    let args: serde_json::Value = match serde_json::from_str(args_json) {
        Ok(v) => v,
        Err(e) => return error_json(format!("bad args json: {e}")),
    };
    let out = dispatch(cmd, &args);
    match out {
        Ok(v) => v.to_string(),
        Err(e) => error_json(e),
    }
}

fn dispatch(cmd: &str, args: &serde_json::Value) -> Result<serde_json::Value, String> {
    match cmd {
        "calc_build_performance" => {
            let input: BuildPerformanceInput = take(args, "input")?;
            serialize(calc_build_performance(input))
        }
        "rank_slot_items" => {
            let input: RankSlotItemsInput = take(args, "input")?;
            serialize(rank_slot_items(input))
        }
        "calc_build_stats" => {
            let input: BuildPerformanceInput = take(args, "input")?;
            serialize(calc_build_stats(input))
        }
        "calc_stat_breakdown" => {
            let input: StatBreakdownInput = take(args, "input")?;
            serialize(calc_stat_breakdown(input))
        }
        "passive_stats_at_rank" => {
            let skill: PassiveSkillDto = take(args, "skill")?;
            let rank = args
                .get("rank")
                .and_then(|v| v.as_f64())
                .ok_or("missing `rank`")?;
            serialize(passive_stats_at_rank(skill, rank))
        }
        "mana_cost_at_rank" => {
            let skill: PassiveSkillDto = take(args, "skill")?;
            let rank = args
                .get("rank")
                .and_then(|v| v.as_f64())
                .ok_or("missing `rank`")?;
            serialize(mana_cost_at_rank(skill, rank))
        }
        "parse_custom_stats" => {
            let values: Vec<String> = take(args, "values")?;
            serialize(parse_custom_stats(values))
        }
        "display_values" => {
            let input: DisplayValuesInput = take(args, "input")?;
            let season = take_opt::<String>(args, "season");
            serialize(display_values(input, season))
        }
        "classify_tree_nodes" => {
            let season = take_opt::<String>(args, "season");
            serialize(classify_tree_nodes(season))
        }
        "subskill_aggregation" => {
            let input: SubskillAggregationInput = take(args, "input")?;
            serialize(subskill_aggregation(input))
        }
        "compute_skill_damage" => {
            let input: SkillDamageInput = take(args, "input")?;
            serialize(compute_skill_damage(input))
        }
        "compute_weapon_damage" => {
            let input: WeaponDamageInput = take(args, "input")?;
            serialize(compute_weapon_damage(input))
        }
        "calc_warmup" => {
            let season = take_opt::<String>(args, "season");
            let ok = crate::calc::commands::warmup_sync(season, &emit_progress);
            serialize(ok)
        }
        "suggest_tree_nodes" => {
            use crate::suggest_engine::algo::suggest;
            use crate::suggest_engine::types::PrecomputedInput;
            let input: PrecomputedInput = take(args, "input")?;
            let season = input.season.clone();
            let _scope = crate::calc::season::SeasonScope::enter(season);
            let sink = |current: u32, total: u32| emit_progress(current, total);
            let result = suggest(&input, Some(&sink));
            serialize(result)
        }
        _ => Err(format!("unknown command: {cmd}")),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unknown_command_returns_error_json() {
        let out = invoke_cmd("nope", "{}");
        let v: serde_json::Value = serde_json::from_str(&out).unwrap();
        assert!(v.get("__error").is_some());
    }

    #[test]
    fn parse_custom_stats_dispatches() {
        let out = invoke_cmd("parse_custom_stats", r#"{"values":["+10% damage"]}"#);
        let v: serde_json::Value = serde_json::from_str(&out).unwrap();
        assert!(v.is_array());
    }
}
