# Implementation Plan

- [ ] 1. Implement the lexer
  - Create `crates/solvable-core/src/lexer.rs` with `Token`, `TokenKind`, `Section` types
  - Implement `lex(input: &str) -> Vec<Token>` with line/column tracking
  - Handle case-insensitive section keywords and keyword aliases (`st`, `s.t.` for Subject To)
  - Handle comments (lines starting with `\`)
  - Handle number parsing including decimals and optional scientific notation
  - Write unit tests for each token type and edge cases
  - _Requirements: PARSER-1.6, PARSER-1.7, PARSER-1.8, PARSER-2.5_

- [ ] 2. Implement the parser core
  - Create `crates/solvable-core/src/parser.rs`
  - Implement section dispatching: detect section keywords and dispatch to sub-parsers in any order (only Minimize/Maximize must appear first)
  - Implement objective parsing: `sense: coeff var + coeff var ...`
  - Implement constraint parsing: `name: expr >= rhs` and `expr >= rhs`
  - Implement multi-line expression handling: continuation lines starting with `+`, `-`, or a coefficient join the previous expression
  - Implement bounds parsing: `lb <= var <= ub`, `var >= lb`, `var <= ub`, `var free`
  - Implement integer/binary section parsing: list of variable names
  - Implement error recovery (skip to next section keyword on failure, NOT next newline — expressions span lines)
  - Collect all errors rather than stopping at the first
  - _Requirements: PARSER-1.1, PARSER-1.2, PARSER-1.3, PARSER-1.4, PARSER-1.5, PARSER-1.7, PARSER-1.8, PARSER-1.9, PARSER-1.10, PARSER-2.5, PARSER-2.6, PARSER-3.1, PARSER-3.2, PARSER-3.3_

- [ ] 3. Implement model validation
  - Create `crates/solvable-core/src/validate.rs`
  - Auto-create variables that appear in constraints/objective but lack Bounds declarations (default: 0 to +inf, continuous)
  - Validate: objective function is present
  - Warn: empty constraints, declared-but-unused variables (in Bounds/General/Binary but not in objective or constraints), duplicate names
  - Suggest corrections for misspelled section keywords (Levenshtein distance)
  - Return structured errors with line numbers and helpful messages
  - _Requirements: PARSER-2.1, PARSER-2.2, PARSER-2.3, PARSER-2.4, PARSER-2.5, PARSER-2.6, PARSER-2.7_

- [ ] 4. Create the public parse API
  - Implement `pub fn parse_lp(input: &str) -> ParseResult` in `lib.rs`
  - `ParseResult` includes optional `Model`, `Vec<ParseError>`, and model summary
  - Wire up lexer → parser → validator pipeline
  - Export types from crate root
  - _Requirements: PARSER-4.1, PARSER-4.2_

- [ ] 5. Write parser integration tests against example corpus
  - Create `examples/` directory with LP files: diet problem, transportation, knapsack, portfolio, production mix
  - Write tests that parse each example and verify model structure (variable count, constraint count, sense, names)
  - Write tests for common student mistakes: misspelled keywords, missing End, undefined variables, missing objective
  - Write tests for edge cases: comments only, empty model, very large coefficients, zero coefficients, multi-line expressions, sections in non-standard order
  - _Requirements: PARSER-1.1, PARSER-1.2, PARSER-1.3, PARSER-1.4, PARSER-1.5, PARSER-1.6, PARSER-1.7, PARSER-1.8, PARSER-2.1, PARSER-2.2, PARSER-2.3, PARSER-2.4_

- [ ] 6. Performance validation
  - Write a benchmark that generates a 1000-constraint LP model
  - Assert parsing completes in under 50ms
  - Profile and optimize hot paths if needed
  - _Requirements: PARSER-4.1_
