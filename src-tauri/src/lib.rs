use tauri::{Emitter, Manager};
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            #[cfg(target_os = "macos")]
            {
                use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
                apply_vibrancy(
                    &window,
                    NSVisualEffectMaterial::UnderWindowBackground,
                    None,
                    None,
                )
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");
            }

            use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};

            let open_i = MenuItem::with_id(app, "open", "Open...", true, Some("CmdOrCtrl+O"))?;
            let recent_menu = Submenu::new(app, "Open Recent", true)?;

            // Populate recent files on startup
            #[cfg(desktop)]
            {
                use tauri_plugin_store::StoreExt;
                if let Some(store) = app.get_store("settings.json") {
                    let recent_files: Vec<String> = store
                        .get("recent_files")
                        .and_then(|v| serde_json::from_value(v).ok())
                        .unwrap_or_default();

                    for path in recent_files {
                        let name = std::path::Path::new(&path)
                            .file_name()
                            .and_then(|n| n.to_str())
                            .unwrap_or(&path);

                        let recent_item = MenuItem::with_id(
                            app,
                            format!("recent:{}", path),
                            name,
                            true,
                            None::<&str>,
                        )?;
                        recent_menu.append(&recent_item)?;
                    }
                }
            }

            let save_i = MenuItem::with_id(app, "save", "Save", true, Some("CmdOrCtrl+S"))?;
            let export_i =
                MenuItem::with_id(app, "export", "Export Graph", true, Some("CmdOrCtrl+E"))?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, Some("CmdOrCtrl+Q"))?;

            let file_menu = Submenu::with_items(
                app,
                "File",
                true,
                &[
                    &open_i,
                    &recent_menu,
                    &save_i,
                    &export_i,
                    &PredefinedMenuItem::separator(app)?,
                    &quit_i,
                ],
            )?;

            let menu = Menu::with_items(app, &[&file_menu])?;
            app.set_menu(menu)?;

            app.on_menu_event(move |app, event| {
                let id = event.id().as_ref();
                if id == "open" {
                    let _ = app.emit("menu-open", ());
                } else if id == "save" {
                    let _ = app.emit("menu-save", ());
                } else if id == "export" {
                    let _ = app.emit("menu-export", ());
                } else if id.starts_with("recent:") {
                    let path = id.strip_prefix("recent:").unwrap();
                    let _ = app.emit("menu-recent-open", path);
                } else if id == "quit" {
                    std::process::exit(0);
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::parser::parse_content,
            commands::converter::convert_format,
            commands::tools::run_jq,
            commands::tools::run_jsonpath,
            commands::tools::anonymize_data,
            commands::tools::decode_jwt,
            commands::storage::add_recent_file,
            commands::storage::get_recent_files,
            commands::storage::get_setting,
            commands::storage::set_setting,
            commands::storage::show_notification,
            commands::network::fetch_url,
            commands::schema::generate_schema,
            commands::schema::generate_mock_data,
            commands::schema::validate_json_schema
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
