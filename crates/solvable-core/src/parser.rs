use crate::error::ParseError;
use crate::lexer::{Section, Token, TokenKind};
use crate::model::*;

pub struct Parser {
    tokens: Vec<Token>,
    position: usize,
    errors: Vec<ParseError>,
}

impl Parser {
    pub fn new(tokens: Vec<Token>) -> Self {
        Self {
            tokens,
            position: 0,
            errors: Vec::new(),
        }
    }

    pub fn parse(mut self) -> (Option<Model>, Vec<ParseError>) {
        let mut sense: Option<Sense> = None;
        let mut objective: Option<(Option<String>, LinearExpression)> = None;
        let mut constraints: Vec<Constraint> = Vec::new();
        let mut bounds: Vec<(String, f64, f64)> = Vec::new();
        let mut integer_variables: Vec<String> = Vec::new();
        let mut binary_variables: Vec<String> = Vec::new();
        let mut constraint_counter = 0;

        while {
            self.skip_newlines();
            !self.is_at_end()
        } {
            match self.current_kind() {
                TokenKind::SectionKeyword(Section::Minimize) => {
                    self.advance();
                    sense = Some(Sense::Minimize);
                    self.skip_newlines();
                    objective = Some(self.parse_objective());
                }
                TokenKind::SectionKeyword(Section::Maximize) => {
                    self.advance();
                    sense = Some(Sense::Maximize);
                    self.skip_newlines();
                    objective = Some(self.parse_objective());
                }
                TokenKind::SectionKeyword(Section::SubjectTo) => {
                    self.advance();
                    self.skip_newlines();
                    while !self.is_at_end() && !self.is_at_section_keyword() {
                        match self.parse_constraint(&mut constraint_counter) {
                            Some(constraint) => constraints.push(constraint),
                            None => self.recover_to_next_statement(),
                        }
                        self.skip_newlines();
                    }
                }
                TokenKind::SectionKeyword(Section::Bounds) => {
                    self.advance();
                    self.skip_newlines();
                    while !self.is_at_end() && !self.is_at_section_keyword() {
                        match self.parse_bound() {
                            Some(bound) => bounds.push(bound),
                            None => self.recover_to_next_statement(),
                        }
                        self.skip_newlines();
                    }
                }
                TokenKind::SectionKeyword(Section::General) => {
                    self.advance();
                    self.skip_newlines();
                    while !self.is_at_end() && !self.is_at_section_keyword() {
                        if let TokenKind::Identifier(name) = self.current_kind().clone() {
                            integer_variables.push(name);
                            self.advance();
                        } else {
                            self.skip_newlines_or_one_token();
                        }
                        self.skip_newlines();
                    }
                }
                TokenKind::SectionKeyword(Section::Binary) => {
                    self.advance();
                    self.skip_newlines();
                    while !self.is_at_end() && !self.is_at_section_keyword() {
                        if let TokenKind::Identifier(name) = self.current_kind().clone() {
                            binary_variables.push(name);
                            self.advance();
                        } else {
                            self.skip_newlines_or_one_token();
                        }
                        self.skip_newlines();
                    }
                }
                TokenKind::SectionKeyword(Section::End) => {
                    self.advance();
                    break;
                }
                _ => {
                    let token = self.current_token();
                    self.errors.push(ParseError::error(
                        token.line,
                        token.column,
                        format!(
                            "Expected a section keyword (Minimize, Maximize, Subject To, Bounds, General, Binary, End), but found '{}'",
                            self.describe_current_token()
                        ),
                    ));
                    self.recover_to_next_section();
                }
            }
        }

        let sense = match sense {
            Some(sense) => sense,
            None => {
                self.errors.push(ParseError::error(
                    1,
                    1,
                    "Missing objective function. The model must start with 'Minimize' or 'Maximize' followed by an objective expression.",
                ));
                return (None, self.errors);
            }
        };

        let (objective_name, objective_expression) = match objective {
            Some(obj) => obj,
            None => {
                self.errors.push(ParseError::error(
                    1,
                    1,
                    "Missing objective expression after Minimize/Maximize keyword.",
                ));
                return (None, self.errors);
            }
        };

        // Build variable list from all referenced variables
        let mut variable_names = std::collections::HashSet::new();
        let mut ordered_variable_names = Vec::new();

        let mut register_variable = |name: &str| {
            if variable_names.insert(name.to_string()) {
                ordered_variable_names.push(name.to_string());
            }
        };

        for term in &objective_expression.terms {
            register_variable(&term.variable_name);
        }
        for constraint in &constraints {
            for term in &constraint.expression.terms {
                register_variable(&term.variable_name);
            }
        }
        for (name, _, _) in &bounds {
            register_variable(name);
        }
        for name in &integer_variables {
            register_variable(name);
        }
        for name in &binary_variables {
            register_variable(name);
        }

        let variables: Vec<Variable> = ordered_variable_names
            .iter()
            .map(|name| {
                let is_binary = binary_variables.contains(name);
                let is_integer = integer_variables.contains(name);

                let variable_type = if is_binary {
                    VariableType::Binary
                } else if is_integer {
                    VariableType::Integer
                } else {
                    VariableType::Continuous
                };

                let (lower_bound, upper_bound) = if is_binary {
                    (0.0, 1.0)
                } else if let Some((_, lb, ub)) = bounds.iter().find(|(bound_name, _, _)| bound_name == name) {
                    (*lb, *ub)
                } else {
                    (0.0, f64::INFINITY)
                };

                Variable {
                    name: name.clone(),
                    variable_type,
                    lower_bound,
                    upper_bound,
                }
            })
            .collect();

        let _ = objective_name; // reserved for future use

        let model = Model {
            name: None,
            sense,
            objective: objective_expression,
            variables,
            constraints,
        };

        (Some(model), self.errors)
    }

    fn parse_objective(&mut self) -> (Option<String>, LinearExpression) {
        let name = self.try_parse_label();
        let expression = self.parse_linear_expression();
        (name, expression)
    }

    fn parse_constraint(&mut self, constraint_counter: &mut usize) -> Option<Constraint> {
        let name = self.try_parse_label();
        let expression = self.parse_linear_expression();

        if expression.terms.is_empty() && expression.constant == 0.0 {
            return None;
        }

        let operator = match self.current_kind() {
            TokenKind::LessEqual => {
                self.advance();
                ConstraintOperator::LessEqual
            }
            TokenKind::GreaterEqual => {
                self.advance();
                ConstraintOperator::GreaterEqual
            }
            TokenKind::Equal => {
                self.advance();
                ConstraintOperator::Equal
            }
            _ => {
                let token = self.current_token();
                self.errors.push(ParseError::error(
                    token.line,
                    token.column,
                    format!(
                        "Expected a comparison operator (<=, >=, =) after the expression, but found '{}'",
                        self.describe_current_token()
                    ),
                ));
                return None;
            }
        };

        let rhs = self.parse_rhs_value();

        let constraint_name = name.unwrap_or_else(|| {
            *constraint_counter += 1;
            format!("c{}", constraint_counter)
        });

        Some(Constraint {
            name: Some(constraint_name),
            expression,
            operator,
            rhs,
        })
    }

    fn parse_rhs_value(&mut self) -> f64 {
        let negative = if matches!(self.current_kind(), TokenKind::Minus) {
            self.advance();
            true
        } else {
            if matches!(self.current_kind(), TokenKind::Plus) {
                self.advance();
            }
            false
        };

        match self.current_kind() {
            TokenKind::Number(value) => {
                let value = *value;
                self.advance();
                if negative { -value } else { value }
            }
            _ => {
                let token = self.current_token();
                self.errors.push(ParseError::error(
                    token.line,
                    token.column,
                    format!(
                        "Expected a number on the right-hand side, but found '{}'",
                        self.describe_current_token()
                    ),
                ));
                0.0
            }
        }
    }

    fn parse_bound(&mut self) -> Option<(String, f64, f64)> {
        // Formats:
        //   lb <= var <= ub
        //   lb <= var
        //   var <= ub
        //   var >= lb
        //   var = value
        //   var free
        //   -inf <= var <= ub (using -inf or -infinity)

        // Check for: number/sign <= var ...
        if matches!(self.current_kind(), TokenKind::Number(_) | TokenKind::Minus) {
            let lower = self.parse_rhs_value();

            if !matches!(self.current_kind(), TokenKind::LessEqual) {
                let token = self.current_token();
                self.errors.push(ParseError::error(
                    token.line,
                    token.column,
                    "Expected '<=' after lower bound value in bounds declaration",
                ));
                return None;
            }
            self.advance(); // consume <=

            let variable_name = match self.current_kind().clone() {
                TokenKind::Identifier(name) => {
                    self.advance();
                    name
                }
                _ => {
                    let token = self.current_token();
                    self.errors.push(ParseError::error(
                        token.line,
                        token.column,
                        "Expected a variable name after '<=' in bounds declaration",
                    ));
                    return None;
                }
            };

            // Check for optional upper bound: <= ub
            let upper = if matches!(self.current_kind(), TokenKind::LessEqual) {
                self.advance();
                self.parse_rhs_value()
            } else {
                f64::INFINITY
            };

            return Some((variable_name, lower, upper));
        }

        // Check for: var ...
        if let TokenKind::Identifier(name) = self.current_kind().clone() {
            self.advance();

            match self.current_kind() {
                TokenKind::Free => {
                    self.advance();
                    return Some((name, f64::NEG_INFINITY, f64::INFINITY));
                }
                TokenKind::LessEqual => {
                    self.advance();
                    let upper = self.parse_rhs_value();
                    return Some((name, 0.0, upper));
                }
                TokenKind::GreaterEqual => {
                    self.advance();
                    let lower = self.parse_rhs_value();
                    return Some((name, lower, f64::INFINITY));
                }
                TokenKind::Equal => {
                    self.advance();
                    let value = self.parse_rhs_value();
                    return Some((name, value, value));
                }
                _ => {
                    let token = self.current_token();
                    self.errors.push(ParseError::error(
                        token.line,
                        token.column,
                        format!(
                            "Expected '<=', '>=', '=', or 'free' after variable '{}' in bounds declaration",
                            name
                        ),
                    ));
                    return None;
                }
            }
        }

        let token = self.current_token();
        self.errors.push(ParseError::error(
            token.line,
            token.column,
            format!(
                "Expected a bounds declaration (e.g., '0 <= x <= 10' or 'x free'), but found '{}'",
                self.describe_current_token()
            ),
        ));
        None
    }

    fn try_parse_label(&mut self) -> Option<String> {
        // Look ahead: identifier followed by colon
        if self.position + 1 < self.tokens.len() {
            if let TokenKind::Identifier(name) = &self.tokens[self.position].kind {
                if matches!(self.tokens[self.position + 1].kind, TokenKind::Colon) {
                    let name = name.clone();
                    self.advance(); // consume identifier
                    self.advance(); // consume colon
                    return Some(name);
                }
            }
        }
        None
    }

    fn parse_linear_expression(&mut self) -> LinearExpression {
        let mut expression = LinearExpression::new();
        let mut expecting_term = true;
        let mut sign: f64 = 1.0;

        loop {
            self.skip_newlines_if_continuation();

            match self.current_kind().clone() {
                TokenKind::Plus => {
                    self.advance();
                    sign = 1.0;
                    expecting_term = true;
                }
                TokenKind::Minus => {
                    self.advance();
                    sign = -1.0;
                    expecting_term = true;
                }
                TokenKind::Number(value) => {
                    self.advance();
                    self.skip_newlines_if_continuation();
                    // Check if followed by a variable name
                    if let TokenKind::Identifier(name) = self.current_kind().clone() {
                        self.advance();
                        expression.add_term(sign * value, name);
                    } else {
                        // Standalone number — could be a constant or we've hit the RHS
                        expression.constant += sign * value;
                    }
                    expecting_term = false;
                    sign = 1.0;
                }
                TokenKind::Identifier(name) => {
                    // Implicit coefficient of 1
                    self.advance();
                    expression.add_term(sign * 1.0, name);
                    expecting_term = false;
                    sign = 1.0;
                }
                _ => {
                    // End of expression
                    if expecting_term && !expression.terms.is_empty() {
                        // We had a trailing +/- but no term followed
                        let token = self.current_token();
                        self.errors.push(ParseError::warning(
                            token.line,
                            token.column,
                            "Trailing operator with no term following it",
                        ));
                    }
                    break;
                }
            }
        }

        expression
    }

    // Skip newlines only if the next non-newline token looks like a continuation
    // of an expression (starts with +, -, number, or identifier)
    fn skip_newlines_if_continuation(&mut self) {
        let saved_position = self.position;
        let mut skipped = 0;

        while self.position < self.tokens.len() {
            if matches!(self.tokens[self.position].kind, TokenKind::Newline) {
                self.position += 1;
                skipped += 1;
            } else {
                break;
            }
        }

        if skipped > 0 {
            // Check if the next token looks like an expression continuation
            if self.position < self.tokens.len()
                && self.tokens[self.position].is_expression_continuation()
                && !self.tokens[self.position].is_section_keyword()
            {
                // Keep the advanced position — this is a continuation line
            } else {
                // Not a continuation — restore position
                self.position = saved_position;
            }
        }
    }

    fn current_token(&self) -> &Token {
        &self.tokens[self.position.min(self.tokens.len() - 1)]
    }

    fn current_kind(&self) -> &TokenKind {
        &self.current_token().kind
    }

    fn advance(&mut self) {
        if self.position < self.tokens.len() {
            self.position += 1;
        }
    }

    fn is_at_end(&self) -> bool {
        self.position >= self.tokens.len()
            || matches!(self.tokens[self.position].kind, TokenKind::Eof)
    }

    fn is_at_section_keyword(&self) -> bool {
        matches!(self.current_kind(), TokenKind::SectionKeyword(_))
    }

    fn skip_newlines(&mut self) {
        while !self.is_at_end() && matches!(self.current_kind(), TokenKind::Newline) {
            self.advance();
        }
    }

    fn skip_newlines_or_one_token(&mut self) {
        if matches!(self.current_kind(), TokenKind::Newline) {
            self.skip_newlines();
        } else {
            self.advance();
        }
    }

    fn recover_to_next_statement(&mut self) {
        // Skip until we find a newline followed by something that could start a new statement,
        // or a section keyword
        while !self.is_at_end() {
            if self.is_at_section_keyword() {
                return;
            }
            if matches!(self.current_kind(), TokenKind::Newline) {
                self.advance();
                // Check if next token could start a new constraint or bound
                if self.is_at_end()
                    || self.is_at_section_keyword()
                    || matches!(
                        self.current_kind(),
                        TokenKind::Identifier(_) | TokenKind::Number(_) | TokenKind::Minus
                    )
                {
                    return;
                }
            } else {
                self.advance();
            }
        }
    }

    fn recover_to_next_section(&mut self) {
        while !self.is_at_end() {
            if self.is_at_section_keyword() {
                return;
            }
            self.advance();
        }
    }

    fn describe_current_token(&self) -> String {
        match self.current_kind() {
            TokenKind::SectionKeyword(section) => format!("{section:?}"),
            TokenKind::Identifier(name) => name.clone(),
            TokenKind::Number(value) => value.to_string(),
            TokenKind::Plus => "+".to_string(),
            TokenKind::Minus => "-".to_string(),
            TokenKind::Colon => ":".to_string(),
            TokenKind::LessEqual => "<=".to_string(),
            TokenKind::GreaterEqual => ">=".to_string(),
            TokenKind::Equal => "=".to_string(),
            TokenKind::Free => "free".to_string(),
            TokenKind::Newline => "newline".to_string(),
            TokenKind::Eof => "end of input".to_string(),
        }
    }
}

pub fn parse_tokens(tokens: Vec<Token>) -> (Option<Model>, Vec<ParseError>) {
    Parser::new(tokens).parse()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::lexer;

    fn parse_lp(input: &str) -> (Option<Model>, Vec<ParseError>) {
        let (tokens, _) = lexer::lex(input);
        parse_tokens(tokens)
    }

    #[test]
    fn test_parse_simple_maximization() {
        let input = "\
Maximize
  obj: 5 x + 4 y
Subject To
  capacity: x + y <= 10
  x_limit: x <= 6
Bounds
  0 <= x <= 10
  0 <= y <= 8
End";

        let (model, errors) = parse_lp(input);
        assert!(errors.is_empty(), "unexpected errors: {errors:?}");
        let model = model.unwrap();

        assert_eq!(model.sense, Sense::Maximize);
        assert_eq!(model.objective.terms.len(), 2);
        assert_eq!(model.objective.terms[0].coefficient, 5.0);
        assert_eq!(model.objective.terms[0].variable_name, "x");
        assert_eq!(model.objective.terms[1].coefficient, 4.0);
        assert_eq!(model.objective.terms[1].variable_name, "y");

        assert_eq!(model.constraints.len(), 2);
        assert_eq!(model.constraints[0].name, Some("capacity".to_string()));
        assert_eq!(model.constraints[0].operator, ConstraintOperator::LessEqual);
        assert_eq!(model.constraints[0].rhs, 10.0);

        assert_eq!(model.variables.len(), 2);
        assert_eq!(model.variables[0].name, "x");
        assert_eq!(model.variables[0].lower_bound, 0.0);
        assert_eq!(model.variables[0].upper_bound, 10.0);
        assert_eq!(model.variables[1].name, "y");
        assert_eq!(model.variables[1].upper_bound, 8.0);
    }

    #[test]
    fn test_parse_minimization_with_implicit_coefficients() {
        let input = "\
Minimize
  x + y
Subject To
  x + y >= 1
End";

        let (model, errors) = parse_lp(input);
        assert!(errors.is_empty(), "unexpected errors: {errors:?}");
        let model = model.unwrap();

        assert_eq!(model.sense, Sense::Minimize);
        assert_eq!(model.objective.terms[0].coefficient, 1.0);
        assert_eq!(model.objective.terms[1].coefficient, 1.0);
        assert_eq!(model.constraints[0].operator, ConstraintOperator::GreaterEqual);
    }

    #[test]
    fn test_parse_negative_coefficients() {
        let input = "\
Minimize
  2 x - 3 y + z
Subject To
  x - y <= 5
End";

        let (model, errors) = parse_lp(input);
        assert!(errors.is_empty(), "unexpected errors: {errors:?}");
        let model = model.unwrap();

        assert_eq!(model.objective.terms[0].coefficient, 2.0);
        assert_eq!(model.objective.terms[1].coefficient, -3.0);
        assert_eq!(model.objective.terms[2].coefficient, 1.0);

        assert_eq!(model.constraints[0].expression.terms[1].coefficient, -1.0);
    }

    #[test]
    fn test_parse_auto_generates_constraint_names() {
        let input = "\
Minimize
  x
Subject To
  x >= 0
  x <= 10
End";

        let (model, errors) = parse_lp(input);
        assert!(errors.is_empty(), "unexpected errors: {errors:?}");
        let model = model.unwrap();

        assert_eq!(model.constraints[0].name, Some("c1".to_string()));
        assert_eq!(model.constraints[1].name, Some("c2".to_string()));
    }

    #[test]
    fn test_parse_free_variable_bounds() {
        let input = "\
Minimize
  x
Subject To
  x >= -10
Bounds
  x free
End";

        let (model, errors) = parse_lp(input);
        assert!(errors.is_empty(), "unexpected errors: {errors:?}");
        let model = model.unwrap();

        assert_eq!(model.variables[0].lower_bound, f64::NEG_INFINITY);
        assert!(model.variables[0].upper_bound.is_infinite());
    }

    #[test]
    fn test_parse_integer_and_binary_variables() {
        let input = "\
Maximize
  x + y + z
Subject To
  x + y + z <= 10
General
  x
Binary
  z
End";

        let (model, errors) = parse_lp(input);
        assert!(errors.is_empty(), "unexpected errors: {errors:?}");
        let model = model.unwrap();

        assert_eq!(model.variables.iter().find(|v| v.name == "x").unwrap().variable_type, VariableType::Integer);
        assert_eq!(model.variables.iter().find(|v| v.name == "y").unwrap().variable_type, VariableType::Continuous);
        assert_eq!(model.variables.iter().find(|v| v.name == "z").unwrap().variable_type, VariableType::Binary);
        assert!(model.has_integer_variables());
    }

    #[test]
    fn test_parse_no_bounds_section_uses_defaults() {
        let input = "\
Minimize
  x + y
Subject To
  x + y >= 1
End";

        let (model, errors) = parse_lp(input);
        assert!(errors.is_empty(), "unexpected errors: {errors:?}");
        let model = model.unwrap();

        for variable in &model.variables {
            assert_eq!(variable.lower_bound, 0.0);
            assert!(variable.upper_bound.is_infinite());
        }
    }

    #[test]
    fn test_parse_comments_are_ignored() {
        let input = "\
\\ This is a diet problem
Minimize
  \\ Objective: minimize cost
  cost: 2 bread + 3 milk
Subject To
  \\ Protein constraint
  protein: bread + milk >= 5
End";

        let (model, errors) = parse_lp(input);
        assert!(errors.is_empty(), "unexpected errors: {errors:?}");
        let model = model.unwrap();

        assert_eq!(model.objective.terms.len(), 2);
        assert_eq!(model.constraints.len(), 1);
    }

    #[test]
    fn test_parse_multiline_expression() {
        let input = "\
Minimize
  cost: 2 bread + 3.5 milk
        + 8 cheese + 1.5 potato
        + 4.2 fish
Subject To
  protein: 0.1 bread
           + 0.15 milk
           + 0.25 cheese >= 55
End";

        let (model, errors) = parse_lp(input);
        assert!(errors.is_empty(), "unexpected errors: {errors:?}");
        let model = model.unwrap();

        assert_eq!(model.objective.terms.len(), 5);
        assert_eq!(model.constraints[0].expression.terms.len(), 3);
        assert_eq!(model.constraints[0].rhs, 55.0);
    }

    #[test]
    fn test_parse_missing_objective_reports_error() {
        let input = "\
Subject To
  x >= 0
End";

        let (model, errors) = parse_lp(input);
        assert!(model.is_none());
        assert!(errors.iter().any(|e| e.message.contains("Missing objective")));
    }

    #[test]
    fn test_parse_equality_constraint() {
        let input = "\
Minimize
  x
Subject To
  fix: x = 5
End";

        let (model, errors) = parse_lp(input);
        assert!(errors.is_empty(), "unexpected errors: {errors:?}");
        let model = model.unwrap();

        assert_eq!(model.constraints[0].operator, ConstraintOperator::Equal);
        assert_eq!(model.constraints[0].rhs, 5.0);
    }

    #[test]
    fn test_parse_sections_in_nonstandard_order() {
        let input = "\
Maximize
  x + y
Bounds
  0 <= x <= 10
  0 <= y <= 10
Subject To
  x + y <= 15
End";

        let (model, errors) = parse_lp(input);
        assert!(errors.is_empty(), "unexpected errors: {errors:?}");
        let model = model.unwrap();

        assert_eq!(model.constraints.len(), 1);
        assert_eq!(model.variables[0].upper_bound, 10.0);
    }

    #[test]
    fn test_parse_negative_rhs() {
        let input = "\
Minimize
  x
Subject To
  c1: x >= -5
End";

        let (model, errors) = parse_lp(input);
        assert!(errors.is_empty(), "unexpected errors: {errors:?}");
        let model = model.unwrap();

        assert_eq!(model.constraints[0].rhs, -5.0);
    }
}
