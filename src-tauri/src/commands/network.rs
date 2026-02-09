use tauri::command;

#[command]
pub async fn fetch_url(url: String) -> Result<String, String> {
    let response = reqwest::get(url)
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response body: {}", e))?;

    Ok(text)
}

#[cfg(test)]
#[path = "network_test.rs"]
mod network_test;
