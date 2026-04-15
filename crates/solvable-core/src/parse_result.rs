use serde::{Deserialize, Serialize};

use crate::error::ParseError;
use crate::model::{Model, ModelSummary};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ParseResult {
    pub model: Option<Model>,
    pub errors: Vec<ParseError>,
    pub summary: Option<ModelSummary>,
}

impl ParseResult {
    pub fn success(model: Model) -> Self {
        let summary = Some(ModelSummary::from(&model));
        Self {
            model: Some(model),
            errors: Vec::new(),
            summary,
        }
    }

    pub fn with_warnings(model: Model, errors: Vec<ParseError>) -> Self {
        let summary = Some(ModelSummary::from(&model));
        Self {
            model: Some(model),
            errors,
            summary,
        }
    }

    pub fn failure(errors: Vec<ParseError>) -> Self {
        Self {
            model: None,
            errors,
            summary: None,
        }
    }

    pub fn has_errors(&self) -> bool {
        self.errors.iter().any(|error| error.is_error())
    }

    pub fn is_success(&self) -> bool {
        self.model.is_some()
    }
}
