pub mod error;
pub mod lexer;
pub mod model;
pub mod parse_result;
pub mod parser;
pub mod validate;

pub use error::{ErrorSeverity, ParseError};
pub use model::*;
pub use parse_result::ParseResult;

/// Parse a CPLEX LP format string into a validated Model.
///
/// Returns a `ParseResult` containing the parsed model (if successful),
/// any errors and warnings, and a model summary.
pub fn parse_lp(input: &str) -> ParseResult {
    let (tokens, lex_errors) = lexer::lex(input);

    let mut all_errors: Vec<ParseError> = lex_errors
        .into_iter()
        .map(|lex_error| ParseError::error(lex_error.line, lex_error.column, lex_error.message))
        .collect();

    let (model, parse_errors) = parser::parse_tokens(tokens);
    all_errors.extend(parse_errors);

    match model {
        Some(model) => {
            let validation_warnings = validate::validate(&model);
            all_errors.extend(validation_warnings);

            if all_errors.iter().any(|error| error.is_error()) {
                ParseResult {
                    summary: Some(ModelSummary::from(&model)),
                    model: Some(model),
                    errors: all_errors,
                }
            } else {
                ParseResult::with_warnings(model, all_errors)
            }
        }
        None => ParseResult::failure(all_errors),
    }
}
