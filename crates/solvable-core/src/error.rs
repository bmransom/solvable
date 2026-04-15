use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ErrorSeverity {
    Error,
    Warning,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ParseError {
    pub line: usize,
    pub column: usize,
    pub message: String,
    pub severity: ErrorSeverity,
}

impl ParseError {
    pub fn error(line: usize, column: usize, message: impl Into<String>) -> Self {
        Self {
            line,
            column,
            message: message.into(),
            severity: ErrorSeverity::Error,
        }
    }

    pub fn warning(line: usize, column: usize, message: impl Into<String>) -> Self {
        Self {
            line,
            column,
            message: message.into(),
            severity: ErrorSeverity::Warning,
        }
    }

    pub fn is_error(&self) -> bool {
        self.severity == ErrorSeverity::Error
    }
}

impl std::fmt::Display for ParseError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let severity_label = match self.severity {
            ErrorSeverity::Error => "Error",
            ErrorSeverity::Warning => "Warning",
        };
        write!(
            formatter,
            "{} at line {}, column {}: {}",
            severity_label, self.line, self.column, self.message
        )
    }
}
