use super::*;
use serde_json::json;

#[test]
fn test_infer_schema_basic() {
    let data = json!({ "name": "test", "age": 25 });
    let schema = infer_schema(&data);
    assert_eq!(schema["type"], "object");
    assert_eq!(schema["properties"]["name"]["type"], "string");
    assert_eq!(schema["properties"]["age"]["type"], "number");
}

#[test]
fn test_infer_schema_nested() {
    let data = json!({
        "user": {
            "id": 1,
            "profile": { "bio": "hello" }
        },
        "tags": ["rust", "tauri"]
    });
    let schema = infer_schema(&data);
    assert_eq!(schema["type"], "object");
    assert_eq!(schema["properties"]["user"]["type"], "object");
    assert_eq!(
        schema["properties"]["user"]["properties"]["profile"]["type"],
        "object"
    );
    assert_eq!(schema["properties"]["tags"]["type"], "array");
    assert_eq!(schema["properties"]["tags"]["items"]["type"], "string");
}

#[test]
fn test_validate_json_schema_valid() {
    let schema = json!({
        "type": "object",
        "properties": {
            "name": { "type": "string" }
        }
    });
    let data = json!({ "name": "test" });
    let result = validate_json_schema(data, schema).unwrap();
    assert!(result.is_empty());
}

#[test]
fn test_validate_json_schema_invalid() {
    let schema = json!({
        "type": "object",
        "properties": {
            "age": { "type": "number" }
        }
    });
    let data = json!({ "age": "25" }); // Should be number
    let result = validate_json_schema(data, schema).unwrap();
    assert!(!result.is_empty());
    assert!(result[0].contains("is not of type \"number\""));
}

#[test]
fn test_generate_mock_data() {
    let schema = json!({
        "type": "object",
        "properties": {
            "name": { "type": "string" },
            "count": { "type": "number" },
            "active": { "type": "boolean" },
            "list": {
                "type": "array",
                "items": { "type": "string" }
            }
        }
    });
    let mock = generate_mock_data(schema).unwrap();
    assert_eq!(mock["name"], "mock_string");
    assert_eq!(mock["count"], 42);
    assert_eq!(mock["active"], true);
    assert!(mock["list"].is_array());
    assert_eq!(mock["list"][0], "mock_string");
}
