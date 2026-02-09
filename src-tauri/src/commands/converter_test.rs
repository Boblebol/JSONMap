use super::*;

#[test]
fn test_convert_json_to_yaml() {
    let content = r#"{"name": "test"}"#;
    let result =
        convert_format(content.to_string(), "json".to_string(), "yaml".to_string()).unwrap();
    assert!(result.contains("name: test"));
}

#[test]
fn test_convert_yaml_to_json() {
    let content = "name: test";
    let result =
        convert_format(content.to_string(), "yaml".to_string(), "json".to_string()).unwrap();
    assert!(result.contains(r#""name": "test""#));
}

#[test]
fn test_convert_json_to_csv() {
    let content =
        r#"[{"user": {"name": "Alex", "age": 30}}, {"user": {"name": "Bob", "age": 25}}]"#;
    let result =
        convert_format(content.to_string(), "json".to_string(), "csv".to_string()).unwrap();
    assert!(result.contains("user.age,user.name"));
    assert!(result.contains("30,Alex"));
    assert!(result.contains("25,Bob"));
}
