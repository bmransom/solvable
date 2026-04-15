use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn initialize() {
    console_error_panic_hook::set_once();
}

/// Parse a CPLEX LP format string and return the result as JSON.
///
/// Returns a JSON string with the shape:
/// ```json
/// {
///   "model": { ... } | null,
///   "errors": [{ "line": 1, "column": 1, "message": "...", "severity": "Error" }],
///   "summary": { "variable_count": 2, "constraint_count": 3, "sense": "Maximize", "has_integer_variables": false } | null
/// }
/// ```
#[wasm_bindgen]
pub fn parse(lp_string: &str) -> String {
    let result = solvable_core::parse_lp(lp_string);
    serde_json::to_string(&result).unwrap_or_else(|error| {
        format!(r#"{{"model":null,"errors":[{{"line":0,"column":0,"message":"Serialization error: {error}","severity":"Error"}}],"summary":null}}"#)
    })
}

/// Return version information as a string.
#[wasm_bindgen]
pub fn version() -> String {
    format!("solvable {}", env!("CARGO_PKG_VERSION"))
}
