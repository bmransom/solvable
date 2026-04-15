use std::collections::HashSet;

use crate::error::ParseError;
use crate::model::Model;

pub fn validate(model: &Model) -> Vec<ParseError> {
    let mut warnings = Vec::new();

    // Collect variable names referenced in objective and constraints
    let mut referenced_in_expressions: HashSet<&str> = HashSet::new();
    for term in &model.objective.terms {
        referenced_in_expressions.insert(&term.variable_name);
    }
    for constraint in &model.constraints {
        for term in &constraint.expression.terms {
            referenced_in_expressions.insert(&term.variable_name);
        }
    }

    // Warn about declared-but-unused variables (in Bounds but never in objective or constraints)
    for variable in &model.variables {
        if !referenced_in_expressions.contains(variable.name.as_str()) {
            warnings.push(ParseError::warning(
                0,
                0,
                format!(
                    "Variable '{}' is declared but never used in the objective or any constraint. Did you mean to include it?",
                    variable.name
                ),
            ));
        }
    }

    // Warn about empty constraints
    for constraint in &model.constraints {
        if constraint.expression.terms.is_empty() {
            let constraint_name = constraint
                .name
                .as_deref()
                .unwrap_or("(unnamed)");
            warnings.push(ParseError::warning(
                0,
                0,
                format!(
                    "Constraint '{constraint_name}' has no variables — it is always {} (constant {} vs. RHS {})",
                    if constraint.expression.constant <= constraint.rhs { "satisfied" } else { "violated" },
                    constraint.expression.constant,
                    constraint.rhs,
                ),
            ));
        }
    }

    // Check for duplicate variable names
    let mut seen_variable_names: HashSet<&str> = HashSet::new();
    for variable in &model.variables {
        if !seen_variable_names.insert(&variable.name) {
            warnings.push(ParseError::warning(
                0,
                0,
                format!("Duplicate variable name: '{}'", variable.name),
            ));
        }
    }

    // Check for duplicate constraint names
    let mut seen_constraint_names: HashSet<&str> = HashSet::new();
    for constraint in &model.constraints {
        if let Some(name) = &constraint.name {
            if !seen_constraint_names.insert(name) {
                warnings.push(ParseError::warning(
                    0,
                    0,
                    format!("Duplicate constraint name: '{name}'"),
                ));
            }
        }
    }

    warnings
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::*;

    fn make_simple_model() -> Model {
        let mut objective = LinearExpression::new();
        objective.add_term(1.0, "x");

        Model {
            name: None,
            sense: Sense::Minimize,
            objective,
            variables: vec![Variable::continuous("x")],
            constraints: vec![Constraint {
                name: Some("c1".to_string()),
                expression: {
                    let mut expression = LinearExpression::new();
                    expression.add_term(1.0, "x");
                    expression
                },
                operator: ConstraintOperator::GreaterEqual,
                rhs: 0.0,
            }],
        }
    }

    #[test]
    fn test_validate_clean_model_has_no_warnings() {
        let model = make_simple_model();
        let warnings = validate(&model);
        assert!(warnings.is_empty());
    }

    #[test]
    fn test_validate_warns_on_unused_variable() {
        let mut model = make_simple_model();
        model.variables.push(Variable::continuous("unused_var"));
        let warnings = validate(&model);
        assert_eq!(warnings.len(), 1);
        assert!(warnings[0].message.contains("unused_var"));
        assert!(warnings[0].message.contains("never used"));
    }

    #[test]
    fn test_validate_warns_on_empty_constraint() {
        let mut model = make_simple_model();
        model.constraints.push(Constraint {
            name: Some("empty".to_string()),
            expression: LinearExpression::new(),
            operator: ConstraintOperator::LessEqual,
            rhs: 10.0,
        });
        let warnings = validate(&model);
        assert!(warnings.iter().any(|w| w.message.contains("empty")));
    }

    #[test]
    fn test_validate_warns_on_duplicate_constraint_names() {
        let mut model = make_simple_model();
        model.constraints.push(Constraint {
            name: Some("c1".to_string()),
            expression: {
                let mut expression = LinearExpression::new();
                expression.add_term(1.0, "x");
                expression
            },
            operator: ConstraintOperator::LessEqual,
            rhs: 10.0,
        });
        let warnings = validate(&model);
        assert!(warnings.iter().any(|w| w.message.contains("Duplicate constraint")));
    }
}
