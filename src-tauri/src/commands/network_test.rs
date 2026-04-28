use super::*;
use std::io::{Read, Write};
use std::net::TcpListener;
use std::thread;

fn spawn_test_server(body: &'static str) -> String {
    let listener = TcpListener::bind("127.0.0.1:0").expect("bind local test server");
    let address = listener.local_addr().expect("read local test server address");

    thread::spawn(move || {
        let (mut stream, _) = listener.accept().expect("accept local test request");
        let mut buffer = [0; 1024];
        let _ = stream.read(&mut buffer);
        let response = format!(
            "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
            body.len(),
            body
        );
        stream
            .write_all(response.as_bytes())
            .expect("write local test response");
    });

    format!("http://{address}")
}

#[tokio::test]
async fn test_fetch_url_valid() {
    let url = spawn_test_server(r#"{"userId":1}"#);
    let result = fetch_url(url).await;
    assert!(result.is_ok());
    let text = result.unwrap();
    assert!(text.contains("\"userId\":1"));
}

#[tokio::test]
async fn test_fetch_url_invalid() {
    let url = "not-a-valid-url".to_string();
    let result = fetch_url(url).await;
    assert!(result.is_err());
}
