use super::*;
use serde_json::json;

#[test]
fn test_run_jq_identity() {
    let json = json!({"name": "test"});
    let result = run_jq(".".to_string(), json).unwrap();
    assert_eq!(result["name"], "test");
}

#[test]
fn test_run_jq_filter() {
    let json = json!({
        "items": [
            {"id": 1},
            {"id": 2}
        ]
    });
    let result = run_jq(".items[].id".to_string(), json).unwrap();
    assert!(result.is_array());
    assert_eq!(result[0], 1);
    assert_eq!(result[1], 2);
}

#[test]
fn test_run_jsonpath() {
    let json = json!({
        "user": {
            "profile": {"name": "Alex"}
        }
    });
    let result = run_jsonpath("$.user.profile.name".to_string(), json).unwrap();
    // jsonpath_lib returns results according to selection
    assert_eq!(result, "Alex");
}

#[test]
fn test_anonymize_data() {
    let json = json!({
        "name": "Secret User",
        "email": "private@example.com",
        "other": "public"
    });
    let result = anonymize_data(json).unwrap();
    assert_eq!(result["name"], "REDACTED");
    assert_eq!(result["email"], "XXXX@example.com");
    assert_eq!(result["other"], "public");
}
