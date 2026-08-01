#![allow(dead_code)]

use std::collections::HashMap;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct RuleConstraintItem {
    #[serde(rename = "L")]
    left: String,
    #[serde(rename = "O")]
    operator: String,
    #[serde(rename = "R")]
    right: String,
}

/// Evaluator engine for validating event execution constraints.
pub struct ConstraintEvaluator;

impl ConstraintEvaluator {
    /// Evaluates all configured database constraint types (EventConstraint, CustomConstraint, RuleConstraint) against the payload.
    pub fn evaluate(
        event_constraints: Option<&str>,
        custom_constraints: Option<&str>,
        rule_constraints: Option<&str>,
        payload: &HashMap<String, String>,
    ) -> Result<(), String> {
        if let Some(ec) = event_constraints {
            if !Self::evaluate_event_constraint(ec, payload)? {
                return Err(format!("EventConstraint failed: '{}'", ec));
            }
        }

        if let Some(cc) = custom_constraints {
            if !Self::evaluate_custom_constraint(cc, payload)? {
                return Err(format!("CustomConstraint failed: '{}'", cc));
            }
        }

        if let Some(rc) = rule_constraints {
            if !Self::evaluate_rule_constraint(rc, payload)? {
                return Err(format!("RuleConstraint failed: '{}'", rc));
            }
        }

        Ok(())
    }

    /// Evaluates string equality constraint (e.g. `AutomationCommandName;=;RefundTicket`).
    fn evaluate_event_constraint(ec: &str, payload: &HashMap<String, String>) -> Result<bool, String> {
        if ec.trim().is_empty() {
            return Ok(true);
        }

        let parts: Vec<&str> = ec.split(';').map(|s| s.trim()).collect();
        if parts.len() != 3 {
            return Err(format!("Invalid EventConstraint format: '{}'. Expected 'Key;Operator;Value'", ec));
        }

        let key = parts[0];
        let op = parts[1];
        let target = parts[2];

        let value = payload.get(key).map(|s| s.as_str()).unwrap_or("");

        match op {
            "=" => Ok(value == target),
            "!=" => Ok(value != target),
            _ => Err(format!("Unsupported EventConstraint operator: '{}'", op)),
        }
    }

    /// Evaluates simple comparison constraint (e.g. `'TICKET TOTAL' > 0`).
    fn evaluate_custom_constraint(cc: &str, payload: &HashMap<String, String>) -> Result<bool, String> {
        if cc.trim().is_empty() {
            return Ok(true);
        }

        // Search operators (ordered by length to prevent partial matches)
        let ops = vec![">=", "<=", "==", "!=", ">", "<"];
        let mut found_op = None;

        for op in &ops {
            if let Some(pos) = cc.find(op) {
                found_op = Some((*op, pos));
                break;
            }
        }

        let (op, pos) = found_op.ok_or_else(|| {
            format!("No supported operator found in CustomConstraint expression: '{}'", cc)
        })?;

        let lhs = cc[..pos].trim();
        let rhs = cc[pos + op.len()..].trim();

        // Strip single quotes on left side key if present
        let clean_key = if lhs.starts_with('\'') && lhs.ends_with('\'') {
            &lhs[1..lhs.len() - 1]
        } else {
            lhs
        };

        let payload_val = payload.get(clean_key).map(|s| s.as_str()).unwrap_or("");

        // Strip single quotes on right side target if present
        let clean_rhs = if rhs.starts_with('\'') && rhs.ends_with('\'') {
            &rhs[1..rhs.len() - 1]
        } else {
            rhs
        };

        // Attempt numeric comparison
        if let (Ok(p_num), Ok(r_num)) = (payload_val.parse::<f64>(), clean_rhs.parse::<f64>()) {
            match op {
                ">" => Ok(p_num > r_num),
                "<" => Ok(p_num < r_num),
                ">=" => Ok(p_num >= r_num),
                "<=" => Ok(p_num <= r_num),
                "==" => Ok((p_num - r_num).abs() < f64::EPSILON),
                "!=" => Ok((p_num - r_num).abs() >= f64::EPSILON),
                _ => Err(format!("Unsupported operator: {}", op)),
            }
        } else {
            // String comparison fallback
            match op {
                "==" => Ok(payload_val == clean_rhs),
                "!=" => Ok(payload_val != clean_rhs),
                ">" => Ok(payload_val > clean_rhs),
                "<" => Ok(payload_val < clean_rhs),
                ">=" => Ok(payload_val >= clean_rhs),
                "<=" => Ok(payload_val <= clean_rhs),
                _ => Err(format!("Unsupported operator for string comparison: {}", op)),
            }
        }
    }

    /// Evaluates rules engine JSON list constraint (e.g. `[{"L":"Name","O":"Equal","R":"Value"}]`).
    fn evaluate_rule_constraint(rc: &str, payload: &HashMap<String, String>) -> Result<bool, String> {
        if rc.trim().is_empty() {
            return Ok(true);
        }

        let items: Vec<RuleConstraintItem> = serde_json::from_str(rc)
            .map_err(|e| format!("Failed to parse RuleConstraint JSON array: {}", e))?;

        for item in items {
            if item.operator != "Equal" {
                return Err(format!("Unsupported RuleConstraint operator: '{}'. Only 'Equal' is supported.", item.operator));
            }

            let value = payload.get(&item.left).map(|s| s.as_str()).unwrap_or("");
            if value != item.right {
                return Ok(false);
            }
        }

        Ok(true)
    }
}
