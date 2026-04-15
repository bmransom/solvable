use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::collections::HashMap;

mod float_serialization {
    use super::*;

    pub fn serialize<S: Serializer>(value: &f64, serializer: S) -> Result<S::Ok, S::Error> {
        if value.is_infinite() {
            if *value > 0.0 {
                serializer.serialize_str("Infinity")
            } else {
                serializer.serialize_str("-Infinity")
            }
        } else if value.is_nan() {
            serializer.serialize_str("NaN")
        } else {
            serializer.serialize_f64(*value)
        }
    }

    pub fn deserialize<'de, D: Deserializer<'de>>(deserializer: D) -> Result<f64, D::Error> {
        use serde::de;

        struct FloatVisitor;

        impl<'de> de::Visitor<'de> for FloatVisitor {
            type Value = f64;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("a float, \"Infinity\", \"-Infinity\", or \"NaN\"")
            }

            fn visit_f64<E: de::Error>(self, value: f64) -> Result<f64, E> {
                Ok(value)
            }

            fn visit_i64<E: de::Error>(self, value: i64) -> Result<f64, E> {
                Ok(value as f64)
            }

            fn visit_u64<E: de::Error>(self, value: u64) -> Result<f64, E> {
                Ok(value as f64)
            }

            fn visit_str<E: de::Error>(self, value: &str) -> Result<f64, E> {
                match value {
                    "Infinity" | "inf" => Ok(f64::INFINITY),
                    "-Infinity" | "-inf" => Ok(f64::NEG_INFINITY),
                    "NaN" => Ok(f64::NAN),
                    _ => Err(de::Error::custom(format!("unexpected string: {value}"))),
                }
            }
        }

        deserializer.deserialize_any(FloatVisitor)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Sense {
    Minimize,
    Maximize,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum VariableType {
    Continuous,
    Integer,
    Binary,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Variable {
    pub name: String,
    pub variable_type: VariableType,
    #[serde(with = "float_serialization")]
    pub lower_bound: f64,
    #[serde(with = "float_serialization")]
    pub upper_bound: f64,
}

impl Variable {
    pub fn continuous(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            variable_type: VariableType::Continuous,
            lower_bound: 0.0,
            upper_bound: f64::INFINITY,
        }
    }

    pub fn integer(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            variable_type: VariableType::Integer,
            lower_bound: 0.0,
            upper_bound: f64::INFINITY,
        }
    }

    pub fn binary(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            variable_type: VariableType::Binary,
            lower_bound: 0.0,
            upper_bound: 1.0,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ConstraintOperator {
    LessEqual,
    GreaterEqual,
    Equal,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct LinearTerm {
    pub coefficient: f64,
    pub variable_name: String,
}

#[derive(Debug, Clone, PartialEq, Default, Serialize, Deserialize)]
pub struct LinearExpression {
    pub terms: Vec<LinearTerm>,
    pub constant: f64,
}

impl LinearExpression {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn add_term(&mut self, coefficient: f64, variable_name: impl Into<String>) {
        self.terms.push(LinearTerm {
            coefficient,
            variable_name: variable_name.into(),
        });
    }

    pub fn variable_names(&self) -> impl Iterator<Item = &str> {
        self.terms.iter().map(|term| term.variable_name.as_str())
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Constraint {
    pub name: Option<String>,
    pub expression: LinearExpression,
    pub operator: ConstraintOperator,
    pub rhs: f64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Model {
    pub name: Option<String>,
    pub sense: Sense,
    pub objective: LinearExpression,
    pub variables: Vec<Variable>,
    pub constraints: Vec<Constraint>,
}

impl Model {
    pub fn variable_by_name(&self, name: &str) -> Option<&Variable> {
        self.variables.iter().find(|variable| variable.name == name)
    }

    pub fn variable_count(&self) -> usize {
        self.variables.len()
    }

    pub fn constraint_count(&self) -> usize {
        self.constraints.len()
    }

    pub fn has_integer_variables(&self) -> bool {
        self.variables
            .iter()
            .any(|variable| matches!(variable.variable_type, VariableType::Integer | VariableType::Binary))
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ModelSummary {
    pub variable_count: usize,
    pub constraint_count: usize,
    pub sense: Sense,
    pub has_integer_variables: bool,
}

impl From<&Model> for ModelSummary {
    fn from(model: &Model) -> Self {
        Self {
            variable_count: model.variable_count(),
            constraint_count: model.constraint_count(),
            sense: model.sense,
            has_integer_variables: model.has_integer_variables(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum SolveStatus {
    Optimal,
    Infeasible,
    Unbounded,
    TimeLimit,
    Error(String),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum BasisStatus {
    Basic,
    AtLowerBound,
    AtUpperBound,
    Superbasic,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ConstraintSensitivity {
    pub name: String,
    pub slack_or_surplus: f64,
    pub shadow_price: f64,
    pub rhs_value: f64,
    #[serde(with = "float_serialization")]
    pub rhs_allowable_increase: f64,
    #[serde(with = "float_serialization")]
    pub rhs_allowable_decrease: f64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct VariableSensitivity {
    pub name: String,
    pub value: f64,
    pub basis_status: BasisStatus,
    pub reduced_cost: f64,
    pub objective_coefficient: f64,
    #[serde(with = "float_serialization")]
    pub objective_allowable_increase: f64,
    #[serde(with = "float_serialization")]
    pub objective_allowable_decrease: f64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SensitivityReport {
    pub constraint_sensitivity: Vec<ConstraintSensitivity>,
    pub variable_sensitivity: Vec<VariableSensitivity>,
    pub is_degenerate: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Solution {
    pub status: SolveStatus,
    pub objective_value: Option<f64>,
    pub variable_values: HashMap<String, f64>,
    pub solve_time_ms: f64,
    pub sensitivity: Option<SensitivityReport>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SolveOptions {
    pub time_limit_seconds: Option<f64>,
}

impl Default for SolveOptions {
    fn default() -> Self {
        Self {
            time_limit_seconds: None,
        }
    }
}
