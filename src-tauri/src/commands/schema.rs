use serde_json::{json, Value};
use tauri::command;

#[command]
pub fn generate_schema(json: Value) -> Result<Value, String> {
    Ok(infer_schema(&json))
}

fn infer_schema(v: &Value) -> Value {
    match v {
        Value::Null => json!({ "type": "null" }),
        Value::Bool(_) => json!({ "type": "boolean" }),
        Value::Number(_) => json!({ "type": "number" }),
        Value::String(_) => json!({ "type": "string" }),
        Value::Array(arr) => {
            if arr.is_empty() {
                json!({ "type": "array" })
            } else {
                let items_schema = infer_schema(&arr[0]);
                json!({ "type": "array", "items": items_schema })
            }
        }
        Value::Object(map) => {
            let mut properties = serde_json::Map::new();
            for (k, v) in map {
                properties.insert(k.clone(), infer_schema(v));
            }
            json!({
                "type": "object",
                "properties": properties
            })
        }
    }
}

#[command]
pub fn validate_json_schema(json: Value, schema: Value) -> Result<Vec<String>, String> {
    let compiled =
        jsonschema::JSONSchema::compile(&schema).map_err(|e| format!("Invalid schema: {}", e))?;

    let result = compiled.validate(&json);

    if let Err(errors) = result {
        let error_messages: Vec<String> = errors.map(|e| e.to_string()).collect();
        Ok(error_messages)
    } else {
        Ok(vec![])
    }
}

#[command]
pub fn generate_mock_data(schema: Value) -> Result<Value, String> {
    Ok(mock_from_schema(&schema))
}

fn mock_from_schema(schema: &Value) -> Value {
    if let Some(schema_type) = schema.get("type").and_then(|t| t.as_str()) {
        match schema_type {
            "string" => json!("mock_string"),
            "number" | "integer" => json!(42),
            "boolean" => json!(true),
            "array" => {
                if let Some(items) = schema.get("items") {
                    json!([mock_from_schema(items)])
                } else {
                    json!([])
                }
            }
            "object" => {
                let mut obj = serde_json::Map::new();
                if let Some(properties) = schema.get("properties").and_then(|p| p.as_object()) {
                    for (k, v) in properties {
                        obj.insert(k.clone(), mock_from_schema(v));
                    }
                }
                Value::Object(obj)
            }
            _ => Value::Null,
        }
    } else {
        Value::Null
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_infer_schema() {
        let data = json!({ "name": "test", "age": 25 });
        let schema = infer_schema(&data);
        assert_eq!(schema["type"], "object");
        assert_eq!(schema["properties"]["name"]["type"], "string");
        assert_eq!(schema["properties"]["age"]["type"], "number");
    }
}
