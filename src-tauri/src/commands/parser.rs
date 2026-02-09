use serde_json::Value;
use tauri::command;

#[command]
pub fn parse_content(content: String, format: String) -> Result<Value, String> {
    match format.to_lowercase().as_str() {
        "json" => serde_json::from_str(&content).map_err(|e| e.to_string()),
        "yaml" | "yml" => serde_yaml::from_str(&content).map_err(|e| e.to_string()),
        "toml" => toml::from_str(&content).map_err(|e| e.to_string()),
        "csv" => {
            let mut reader = csv::ReaderBuilder::new()
                .has_headers(true)
                .from_reader(content.as_bytes());

            let mut data = Vec::new();
            for result in reader.deserialize() {
                let record: serde_json::Map<String, Value> = result.map_err(|e| e.to_string())?;
                data.push(Value::Object(record));
            }
            Ok(Value::Array(data))
        }
        "xml" => quick_xml::de::from_str(&content).map_err(|e| e.to_string()),
        _ => Err(format!("Unsupported format: {}", format)),
    }
}

#[cfg(test)]
#[path = "parser_test.rs"]
mod parser_test;
