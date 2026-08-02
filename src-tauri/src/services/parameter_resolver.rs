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
            let mut resolved_value = item.value.clone();

            // Replace every placeholder like [:Subject] anywhere in the string
            for (key, value) in payload {
                let placeholder = format!("[:{}]", key);
                resolved_value = resolved_value.replace(&placeholder, value);
            }

            // Verify that no unresolved placeholders remain
            if let Some(start) = resolved_value.find("[:") {
                if let Some(end) = resolved_value[start..].find(']') {
                    let missing =
                        &resolved_value[start + 2..start + end];
                    return Err(format!(
                        "Placeholder variable '{}' is missing from incoming event payload",
                        missing
                    ));
                }
            }

            resolved.insert(item.key, resolved_value);
        }
        Ok(resolved)
    }
}
