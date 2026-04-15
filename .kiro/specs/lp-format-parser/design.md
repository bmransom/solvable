# LP Format Parser - Design

## Overview

The parser lives entirely in `solvable-core` with no external dependencies. It uses a two-phase approach: lexing (tokenization) then parsing (building the Model). This separation makes error recovery and reporting straightforward. The parser is designed for educational clarity in error messages, not maximum performance — though it must still be fast enough for interactive use (< 50ms for 1000 constraints).

## Architecture

```
LP String
    │
    ▼
┌──────────┐     ┌──────────┐     ┌───────────┐
│  Lexer   │────▶│  Parser  │────▶│ Validator │
│(tokenize)│     │(build IR)│     │(semantic) │
└──────────┘     └──────────┘     └───────────┘
    │                 │                 │
    ▼                 ▼                 ▼
 Tokens          Raw Model        Vec<ParseError>
                                  + validated Model
```

## Components and Interfaces

### Lexer (`lexer.rs`)

**Purpose**: Convert raw LP text into a stream of typed tokens with source positions.

**Responsibilities**:
- Tokenize section keywords: `Minimize`, `Maximize`, `Subject To`, `Bounds`, `General`, `Binary`, `End`
- Tokenize identifiers (variable/constraint names), numbers, operators (`+`, `-`, `>=`, `<=`, `=`)
- Track line and column for every token
- Skip comment lines (starting with `\`)
- Handle case-insensitive keywords (`minimize`, `MINIMIZE`, `Minimize` all valid)

**Token types**:
```rust
pub enum TokenKind {
    SectionKeyword(Section),
    Identifier(String),
    Number(f64),
    Plus,
    Minus,
    Colon,
    LessEqual,
    GreaterEqual,
    Equal,
    Free,
    Newline,
    Eof,
}

pub struct Token {
    pub kind: TokenKind,
    pub line: usize,
    pub column: usize,
    pub span: Range<usize>,
}
```

### Parser (`parser.rs`)

**Purpose**: Consume the token stream and build a `Model`, collecting errors along the way.

**Responsibilities**:
- Parse sections in any order — detect section keywords and dispatch to the appropriate sub-parser (only Minimize/Maximize must appear before any other section)
- Handle optional sections gracefully (missing Bounds section uses defaults)
- Handle multi-line expressions: a line starting with `+`, `-`, or a coefficient continues the previous expression (newlines within expressions are not significant)
- Implement error recovery: on parse failure, skip to the next recognizable section keyword, records the error, and continues parsing
- Collect all parse errors rather than failing on the first one
- Handle implicit coefficient of 1 (e.g., `x` treated as `1 x`)

**Error recovery strategy**: When the parser encounters an unexpected token, it skips tokens until it finds a section keyword or a recognizable constraint/bound pattern, records the error, and continues parsing. Newlines alone are NOT recovery points because expressions can span multiple lines.

### Validator (`validate.rs`)

**Purpose**: Perform semantic validation on the parsed model.

**Responsibilities**:
- Auto-create variables that appear in constraints/objective but lack a Bounds declaration (default: 0 to +inf, continuous) — this is standard LP format behavior, not an error
- Warn about variables declared in Bounds/General/Binary but never used in any constraint or the objective
- Warn about empty constraints
- Error on missing objective
- Check for duplicate variable or constraint names

## Data Flow

1. **Input**: Raw LP string from user
2. **Lexer**: Produces `Vec<Token>` with source positions
3. **Parser**: Consumes tokens, produces `Model` + `Vec<ParseError>` (may include warnings)
4. **Validator**: Takes `Model`, produces additional `Vec<ParseError>` for semantic issues
5. **Output**: `ParseResult { model: Option<Model>, errors: Vec<ParseError>, warnings: Vec<ParseError> }`

Variables that appear in constraints/objective but not in a Bounds section are auto-created with default bounds (0 to +inf for continuous).

## Error Message Guidelines

Error messages must be educational, not cryptic. Examples:

- **Good**: `Line 5: Variable 'bread' appears in constraint 'protein' but is not defined. Did you mean to add it to the Bounds section?`
- **Bad**: `Error at line 5: unexpected identifier`
- **Good**: `Line 3: Expected a section keyword like 'Subject To' or 'Bounds', but found 'Subjct To'. Did you mean 'Subject To'?`
- **Bad**: `Parse error: unknown token`

## Testing Strategy

- **Lexer tests**: Token-level tests for each token type, edge cases (negative numbers, scientific notation, case variants)
- **Parser tests**: Full LP string → Model tests against a corpus of example files:
  - Diet problem, transportation, knapsack, portfolio, production mix
  - Edge cases: no bounds section, free variables, integer/binary declarations, comments
- **Error tests**: Verify specific error messages for common mistakes (misspelled keywords, missing sections, undefined variables)
- **Round-trip test**: Parse → serialize back to LP format → re-parse → assert structural equality
- **Performance test**: Parse a 1000-constraint model and assert < 50ms
