use solvable_core::*;

#[test]
fn test_variable_constructors_set_correct_defaults() {
    let continuous = Variable::continuous("x");
    assert_eq!(continuous.name, "x");
    assert_eq!(continuous.variable_type, VariableType::Continuous);
    assert_eq!(continuous.lower_bound, 0.0);
    assert!(continuous.upper_bound.is_infinite());

    let integer = Variable::integer("y");
    assert_eq!(integer.variable_type, VariableType::Integer);
    assert_eq!(integer.lower_bound, 0.0);

    let binary = Variable::binary("z");
    assert_eq!(binary.variable_type, VariableType::Binary);
    assert_eq!(binary.lower_bound, 0.0);
    assert_eq!(binary.upper_bound, 1.0);
}

#[test]
fn test_linear_expression_collects_variable_names() {
    let mut expression = LinearExpression::new();
    expression.add_term(2.0, "x");
    expression.add_term(3.0, "y");

    let names: Vec<&str> = expression.variable_names().collect();
    assert_eq!(names, vec!["x", "y"]);
}

#[test]
fn test_model_detects_integer_variables() {
    let lp_model = Model {
        name: None,
        sense: Sense::Maximize,
        objective: LinearExpression::new(),
        variables: vec![Variable::continuous("x"), Variable::continuous("y")],
        constraints: vec![],
    };
    assert!(!lp_model.has_integer_variables());

    let mip_model = Model {
        name: None,
        sense: Sense::Minimize,
        objective: LinearExpression::new(),
        variables: vec![Variable::continuous("x"), Variable::binary("z")],
        constraints: vec![],
    };
    assert!(mip_model.has_integer_variables());
}

#[test]
fn test_model_summary_captures_structure() {
    let model = Model {
        name: Some("test".to_string()),
        sense: Sense::Maximize,
        objective: LinearExpression::new(),
        variables: vec![
            Variable::continuous("x"),
            Variable::continuous("y"),
            Variable::integer("z"),
        ],
        constraints: vec![
            Constraint {
                name: Some("c1".to_string()),
                expression: LinearExpression::new(),
                operator: ConstraintOperator::LessEqual,
                rhs: 10.0,
            },
        ],
    };

    let summary = ModelSummary::from(&model);
    assert_eq!(summary.variable_count, 3);
    assert_eq!(summary.constraint_count, 1);
    assert_eq!(summary.sense, Sense::Maximize);
    assert!(summary.has_integer_variables);
}

#[test]
fn test_model_serializes_to_json_and_back() {
    let mut objective = LinearExpression::new();
    objective.add_term(5.0, "x");
    objective.add_term(4.0, "y");

    let mut constraint_expression = LinearExpression::new();
    constraint_expression.add_term(1.0, "x");
    constraint_expression.add_term(1.0, "y");

    let model = Model {
        name: Some("production_mix".to_string()),
        sense: Sense::Maximize,
        objective,
        variables: vec![Variable::continuous("x"), Variable::continuous("y")],
        constraints: vec![Constraint {
            name: Some("capacity".to_string()),
            expression: constraint_expression,
            operator: ConstraintOperator::LessEqual,
            rhs: 10.0,
        }],
    };

    let json = serde_json::to_string(&model).unwrap();
    let deserialized: Model = serde_json::from_str(&json).unwrap();
    assert_eq!(model, deserialized);
}

#[test]
fn test_parse_error_display_formatting() {
    let error = ParseError::error(5, 12, "Variable 'bread' is not defined");
    assert_eq!(
        error.to_string(),
        "Error at line 5, column 12: Variable 'bread' is not defined"
    );

    let warning = ParseError::warning(3, 1, "Constraint 'c1' has no variables");
    assert!(!warning.is_error());
    assert!(warning.to_string().starts_with("Warning"));
}

#[test]
fn test_parse_result_success_includes_summary() {
    let model = Model {
        name: None,
        sense: Sense::Minimize,
        objective: LinearExpression::new(),
        variables: vec![Variable::continuous("x")],
        constraints: vec![],
    };

    let result = ParseResult::success(model);
    assert!(result.is_success());
    assert!(!result.has_errors());
    assert_eq!(result.summary.unwrap().variable_count, 1);
}

#[test]
fn test_parse_result_failure_has_no_model() {
    let errors = vec![ParseError::error(1, 1, "Missing objective function")];
    let result = ParseResult::failure(errors);
    assert!(!result.is_success());
    assert!(result.has_errors());
    assert!(result.model.is_none());
}

#[test]
fn test_solution_serializes_to_json() {
    use std::collections::HashMap;

    let solution = Solution {
        status: SolveStatus::Optimal,
        objective_value: Some(42.0),
        variable_values: HashMap::from([
            ("x".to_string(), 6.0),
            ("y".to_string(), 4.0),
        ]),
        solve_time_ms: 1.5,
        sensitivity: None,
    };

    let json = serde_json::to_string(&solution).unwrap();
    let deserialized: Solution = serde_json::from_str(&json).unwrap();
    assert_eq!(solution, deserialized);
}
