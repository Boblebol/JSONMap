use super::*;

#[tokio::test]
async fn test_fetch_url_valid() {
    // Using a reliable public API for testing
    let url = "https://jsonplaceholder.typicode.com/todos/1".to_string();
    let result = fetch_url(url).await;
    assert!(result.is_ok());
    let text = result.unwrap();
    assert!(text.contains("\"userId\": 1"));
}

#[tokio::test]
async fn test_fetch_url_invalid() {
    let url = "https://invalid.url.that.does.not.exist.jsonmap".to_string();
    let result = fetch_url(url).await;
    assert!(result.is_err());
}
