use crate::commands::parser::parse_content;
use serde_json::{Map, Value};
use std::collections::BTreeSet;
use tauri::command;

fn flatten_value(value: &Value, prefix: String, map: &mut Map<String, Value>) {
    match value {
        Value::Object(obj) => {
            for (k, v) in obj {
                let new_prefix = if prefix.is_empty() {
                    k.clone()
                } else {
                    format!("{}.{}", prefix, k)
                };
                flatten_value(v, new_prefix, map);
            }
        }
        Value::Array(arr) => {
            for (i, v) in arr.iter().enumerate() {
                let new_prefix = format!("{}[{}]", prefix, i);
                flatten_value(v, new_prefix, map);
            }
        }
        _ => {
            map.insert(prefix, value.clone());
        }
    }
}

fn json_to_csv(value: &Value) -> Result<String, String> {
    let mut writer = csv::Writer::from_writer(vec![]);

    let array = match value {
        Value::Array(arr) => arr.clone(),
        _ => vec![value.clone()],
    };

    let mut flattened_rows = Vec::new();
    let mut all_headers = BTreeSet::new();

    for item in array {
        let mut row_map = Map::new();
        flatten_value(&item, String::new(), &mut row_map);
        for key in row_map.keys() {
            all_headers.insert(key.clone());
        }
        flattened_rows.push(row_map);
    }

    let headers: Vec<String> = all_headers.into_iter().collect();
    writer.write_record(&headers).map_err(|e| e.to_string())?;

    for row in flattened_rows {
        let mut record = Vec::new();
        for header in &headers {
            let val = row.get(header).unwrap_or(&Value::Null);
            record.push(match val {
                Value::Null => String::new(),
                Value::String(s) => s.clone(),
                _ => val.to_string(),
            });
        }
        writer.write_record(&record).map_err(|e| e.to_string())?;
    }

    let buf = writer.into_inner().map_err(|e| e.to_string())?;
    String::from_utf8(buf).map_err(|e| e.to_string())
}

#[command]
pub fn convert_format(
    content: String,
    source_format: String,
    target_format: String,
) -> Result<String, String> {
    // Reuse the parser logic to get a generic generic Value
    let value = parse_content(content, source_format)?;

    match target_format.to_lowercase().as_str() {
        "json" => serde_json::to_string_pretty(&value).map_err(|e| e.to_string()),
        "yaml" | "yml" => serde_yaml::to_string(&value).map_err(|e| e.to_string()),
        "toml" => toml::to_string_pretty(&value).map_err(|e| e.to_string()),
        "xml" => quick_xml::se::to_string(&value).map_err(|e| e.to_string()),
        "csv" => json_to_csv(&value),
        _ => Err(format!("Unsupported target format: {}", target_format)),
    }
}

#[cfg(test)]
#[path = "converter_test.rs"]
mod converter_test;
