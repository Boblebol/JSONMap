use base64::prelude::*;
use serde_json::Value;
use tauri::command;

#[command]
pub fn run_jq(filter: String, json: Value) -> Result<Value, String> {
    use jaq_core::load::{Arena, File, Loader};
    use jaq_core::{Compiler, Ctx, RcIter};

    let program = File {
        code: filter.as_str(),
        path: (),
    };

    // Combine standard library and JSON integration definitions
    let loader = Loader::new(jaq_std::defs().chain(jaq_json::defs()));
    let arena = Arena::default();

    // Parse the filter
    let modules = loader
        .load(&arena, program)
        .map_err(|e| format!("Load error: {:?}", e))?;

    // Compile the filter with native functions
    let compiler = Compiler::default();
    let filter_obj = compiler
        .with_funs(jaq_std::funs().chain(jaq_json::funs()))
        .compile(modules)
        .map_err(|e| format!("Compile error: {:?}", e))?;

    let inputs = RcIter::new(core::iter::empty());

    // Convert input to jaq's internal Val using jaq-json
    let input_val = jaq_json::Val::from(json);

    let mut results = Vec::new();
    // Iterator over output values
    for out in filter_obj.run((Ctx::new([], &inputs), input_val)) {
        match out {
            Ok(v) => results.push(Value::from(v)),
            Err(e) => return Err(format!("Runtime error: {:?}", e)),
        }
    }

    if results.len() == 1 {
        Ok(results[0].clone())
    } else {
        Ok(Value::Array(results))
    }
}

#[command]
pub fn run_jsonpath(path: String, json: Value) -> Result<Value, String> {
    jsonpath_lib::select(&json, &path)
        .map(|res| {
            if res.len() == 1 {
                res[0].clone()
            } else {
                Value::Array(res.into_iter().cloned().collect())
            }
        })
        .map_err(|e| e.to_string())
}

#[command]
pub fn anonymize_data(json: Value) -> Result<Value, String> {
    fn anonymize(v: &mut Value) {
        match v {
            Value::Object(map) => {
                for (k, val) in map.iter_mut() {
                    let key_lower = k.to_lowercase();
                    if key_lower.contains("email") {
                        *val = Value::String("XXXX@example.com".to_string());
                    } else if key_lower.contains("password")
                        || key_lower.contains("token")
                        || key_lower.contains("secret")
                    {
                        *val = Value::String("********".to_string());
                    } else if key_lower.contains("name")
                        || key_lower.contains("phone")
                        || key_lower.contains("address")
                    {
                        *val = Value::String("REDACTED".to_string());
                    } else {
                        anonymize(val);
                    }
                }
            }
            Value::Array(arr) => {
                for item in arr.iter_mut() {
                    anonymize(item);
                }
            }
            _ => {}
        }
    }

    let mut cloned = json.clone();
    anonymize(&mut cloned);
    Ok(cloned)
}

#[command]
pub fn decode_jwt(token: String) -> Result<Value, String> {
    let header = jsonwebtoken::decode_header(&token).map_err(|e| e.to_string())?;
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() < 2 {
        return Err("Invalid JWT format".to_string());
    }

    let payload_bytes = BASE64_URL_SAFE_NO_PAD
        .decode(parts[1])
        .map_err(|e| e.to_string())?;
    let payload: Value = serde_json::from_slice(&payload_bytes).map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "header": header,
        "payload": payload
    }))
}

#[cfg(test)]
#[path = "tools_test.rs"]
mod tools_test;
