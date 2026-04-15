use solvable_core::*;

fn parse_example(filename: &str) -> ParseResult {
    let path = format!(
        "{}/../../examples/{filename}",
        env!("CARGO_MANIFEST_DIR")
    );
    let content = std::fs::read_to_string(&path)
        .unwrap_or_else(|error| panic!("Failed to read {path}: {error}"));
    parse_lp(&content)
}

#[test]
fn test_parse_production_mix() {
    let result = parse_example("production_mix.lp");
    assert!(!result.has_errors(), "errors: {:?}", result.errors);
    let model = result.model.unwrap();

    assert_eq!(model.sense, Sense::Maximize);
    assert_eq!(model.variable_count(), 2);
    assert_eq!(model.constraint_count(), 3);
    assert!(!model.has_integer_variables());

    assert_eq!(model.objective.terms[0].variable_name, "x");
    assert_eq!(model.objective.terms[0].coefficient, 5.0);
    assert_eq!(model.objective.terms[1].variable_name, "y");
    assert_eq!(model.objective.terms[1].coefficient, 4.0);

    assert_eq!(model.constraints[0].name, Some("capacity".to_string()));
    assert_eq!(model.constraints[0].rhs, 10.0);
}

#[test]
fn test_parse_diet_problem() {
    let result = parse_example("diet_problem.lp");
    assert!(!result.has_errors(), "errors: {:?}", result.errors);
    let model = result.model.unwrap();

    assert_eq!(model.sense, Sense::Minimize);
    assert_eq!(model.variable_count(), 6);
    assert_eq!(model.constraint_count(), 3);

    // Verify multi-line expression parsed correctly
    assert_eq!(model.objective.terms.len(), 6);

    // All variables should have bounds [0, 10]
    for variable in &model.variables {
        assert_eq!(variable.lower_bound, 0.0, "variable {}", variable.name);
        assert_eq!(variable.upper_bound, 10.0, "variable {}", variable.name);
    }

    // Protein constraint should have 6 terms
    assert_eq!(model.constraints[0].expression.terms.len(), 6);
    assert_eq!(model.constraints[0].rhs, 55.0);
}

#[test]
fn test_parse_transportation() {
    let result = parse_example("transportation.lp");
    assert!(!result.has_errors(), "errors: {:?}", result.errors);
    let model = result.model.unwrap();

    assert_eq!(model.sense, Sense::Minimize);
    assert_eq!(model.variable_count(), 6);
    assert_eq!(model.constraint_count(), 5);

    // Multi-line objective
    assert_eq!(model.objective.terms.len(), 6);
}

#[test]
fn test_parse_knapsack() {
    let result = parse_example("knapsack.lp");
    assert!(!result.has_errors(), "errors: {:?}", result.errors);
    let model = result.model.unwrap();

    assert_eq!(model.sense, Sense::Maximize);
    assert_eq!(model.variable_count(), 5);
    assert_eq!(model.constraint_count(), 1);
    assert!(model.has_integer_variables());

    // All variables should be binary
    for variable in &model.variables {
        assert_eq!(variable.variable_type, VariableType::Binary, "variable {}", variable.name);
        assert_eq!(variable.lower_bound, 0.0);
        assert_eq!(variable.upper_bound, 1.0);
    }
}

#[test]
fn test_parse_portfolio() {
    let result = parse_example("portfolio.lp");
    assert!(!result.has_errors(), "errors: {:?}", result.errors);
    let model = result.model.unwrap();

    assert_eq!(model.sense, Sense::Maximize);
    assert_eq!(model.variable_count(), 4);
    assert_eq!(model.constraint_count(), 4);

    // Budget constraint is equality
    let budget_constraint = model.constraints.iter().find(|c| c.name.as_deref() == Some("budget")).unwrap();
    assert_eq!(budget_constraint.operator, ConstraintOperator::Equal);
    assert_eq!(budget_constraint.rhs, 1.0);
}

#[test]
fn test_parse_summary_matches_model() {
    let result = parse_example("production_mix.lp");
    let summary = result.summary.unwrap();

    assert_eq!(summary.variable_count, 2);
    assert_eq!(summary.constraint_count, 3);
    assert_eq!(summary.sense, Sense::Maximize);
    assert!(!summary.has_integer_variables);
}

#[test]
fn test_parse_lp_api_returns_model_and_no_hard_errors_for_valid_input() {
    let input = "\
Minimize
  x + y
Subject To
  x + y >= 1
End";

    let result = parse_lp(input);
    assert!(result.is_success());
    assert!(!result.has_errors());
    assert!(result.model.is_some());
    assert!(result.summary.is_some());
}

#[test]
fn test_parse_lp_api_returns_errors_for_missing_objective() {
    let input = "\
Subject To
  x >= 0
End";

    let result = parse_lp(input);
    assert!(!result.is_success());
    assert!(result.has_errors());
    assert!(result.errors.iter().any(|e| e.message.contains("Missing objective")));
}
