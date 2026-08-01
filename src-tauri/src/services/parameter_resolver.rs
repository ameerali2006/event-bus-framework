#![allow(dead_code)]

use std::collections::HashMap;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct ParameterItem {
    #[serde(rename = "Key")]
    key: String,
    #[serde(rename = "Value")]
    value: String,
}

/// Service responsible for parsing actions parameter lists and resolving payload placeholders.
pub struct ParameterResolver;

impl ParameterResolver {
    /// Resolves placeholder variables (e.g. `[:FieldName]`) inside action parameters JSON.
    pub fn resolve(
        params_json: &str,
        payload: &HashMap<String, String>,
    ) -> Result<HashMap<String, String>, String> {
        let mut resolved = HashMap::new();
        if params_json.trim().is_empty() {
            return Ok(resolved);
        }

        let items: Vec<ParameterItem> = serde_json::from_str(params_json)
            .map_err(|e| format!("Failed to parse action parameters JSON structure: {}", e))?;

        for item in items {
            let resolved_value = if item.value.starts_with("[:") && item.value.ends_with(']') {
                let key_name = &item.value[2..item.value.len() - 1];
                payload.get(key_name)
                    .cloned()
                    .ok_or_else(|| format!("Placeholder variable '{}' is missing from incoming event payload", key_name))?
            } else {
                item.value
            };

            resolved.insert(item.key, resolved_value);
        }

        Ok(resolved)
    }
}
