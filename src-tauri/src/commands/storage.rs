use serde_json::json;
use tauri::{command, AppHandle};
use tauri_plugin_store::StoreExt;

const SETTINGS_FILE: &str = "settings.json";
const RECENT_FILES_KEY: &str = "recent_files";

#[command]
pub fn add_recent_file(app: AppHandle, path: String) -> Result<(), String> {
    let store = app.get_store(SETTINGS_FILE).ok_or("Failed to get store")?;

    let mut recent_files: Vec<String> = store
        .get(RECENT_FILES_KEY)
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_default();

    recent_files.retain(|p| p != &path);
    recent_files.insert(0, path);
    recent_files.truncate(10);

    store.set(RECENT_FILES_KEY, json!(recent_files));
    Ok(())
}

#[command]
pub fn get_recent_files(app: AppHandle) -> Result<Vec<String>, String> {
    let store = app.get_store(SETTINGS_FILE).ok_or("Failed to get store")?;

    let recent_files: Vec<String> = store
        .get(RECENT_FILES_KEY)
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_default();

    Ok(recent_files)
}

#[command]
pub fn get_setting(app: AppHandle, key: String) -> Result<serde_json::Value, String> {
    let store = app.get_store(SETTINGS_FILE).ok_or("Failed to get store")?;
    Ok(store.get(&key).unwrap_or(serde_json::Value::Null))
}

#[command]
pub fn set_setting(app: AppHandle, key: String, value: serde_json::Value) -> Result<(), String> {
    let store = app.get_store(SETTINGS_FILE).ok_or("Failed to get store")?;
    store.set(key, value);
    Ok(())
}

#[command]
pub fn show_notification(app: AppHandle, title: String, body: String) -> Result<(), String> {
    use tauri_plugin_notification::NotificationExt;
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| e.to_string())?;
    Ok(())
}
