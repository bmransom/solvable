import type { ParseResult, ParseError, ModelSummary } from "./types";

// ── Types ──────────────────────────────────────────────────────────────

type Section = "Minimize" | "Maximize" | "SubjectTo" | "Bounds" | "General" | "Binary" | "End";

type TokenKind =
  | { type: "section"; section: Section }
  | { type: "identifier"; name: string }
  | { type: "number"; value: number }
  | { type: "plus" }
  | { type: "minus" }
  | { type: "colon" }
  | { type: "less_equal" }
  | { type: "greater_equal" }
  | { type: "equal" }
  | { type: "free" }
  | { type: "newline" }
  | { type: "eof" };

interface Token {
  kind: TokenKind;
  line: number;
  column: number;
}

// ── Lexer ──────────────────────────────────────────────────────────────

const SECTION_MAP: Record<string, Section> = {
  minimize: "Minimize", min: "Minimize", minimum: "Minimize",
  maximize: "Maximize", max: "Maximize", maximum: "Maximize",
  bounds: "Bounds", bound: "Bounds",
  general: "General", generals: "General", gen: "General",
  binary: "Binary", binaries: "Binary", bin: "Binary",
  end: "End",
};

function lex(input: string): { tokens: Token[]; errors: ParseError[] } {
  const tokens: Token[] = [];
  const errors: ParseError[] = [];
  let position = 0;
  let line = 1;
  let column = 1;
  let at_line_start = true;

  function peek(): string | undefined {
    return input[position];
  }

  function advance(): string {
    const character = input[position++];
    if (character === "\n") {
      line++;
      column = 1;
      at_line_start = true;
    } else {
      column++;
      if (character !== " " && character !== "\t" && character !== "\r") {
        at_line_start = false;
      }
    }
    return character;
  }

  function skip_whitespace() {
    while (position < input.length) {
      const character = peek();
      if (character === " " || character === "\t" || character === "\r") {
        advance();
      } else {
        break;
      }
    }
  }

  function push(kind: TokenKind, token_line: number, token_column: number) {
    tokens.push({ kind, line: token_line, column: token_column });
  }

  while (position < input.length) {
    skip_whitespace();
    if (position >= input.length) break;

    const character = peek()!;
    const token_line = line;
    const token_column = column;

    if (character === "\n") {
      advance();
      push({ type: "newline" }, token_line, token_column);
      continue;
    }

    if (character === "\\") {
      // Comment — skip to end of line
      while (position < input.length && peek() !== "\n") advance();
      continue;
    }

    if (character === "+") { advance(); push({ type: "plus" }, token_line, token_column); continue; }
    if (character === "-") { advance(); push({ type: "minus" }, token_line, token_column); continue; }
    if (character === ":") { advance(); push({ type: "colon" }, token_line, token_column); continue; }
    if (character === "=") { advance(); push({ type: "equal" }, token_line, token_column); continue; }

    if (character === "<") {
      advance();
      if (peek() === "=") advance();
      push({ type: "less_equal" }, token_line, token_column);
      continue;
    }

    if (character === ">") {
      advance();
      if (peek() === "=") advance();
      push({ type: "greater_equal" }, token_line, token_column);
      continue;
    }

    // Numbers
    if (character >= "0" && character <= "9" || character === ".") {
      let number_text = "";
      while (position < input.length && (peek()! >= "0" && peek()! <= "9" || peek() === ".")) {
        number_text += advance();
      }
      // Scientific notation
      if (position < input.length && (peek() === "e" || peek() === "E")) {
        number_text += advance();
        if (position < input.length && (peek() === "+" || peek() === "-")) {
          number_text += advance();
        }
        while (position < input.length && peek()! >= "0" && peek()! <= "9") {
          number_text += advance();
        }
      }
      const value = parseFloat(number_text);
      if (isNaN(value)) {
        errors.push({ line: token_line, column: token_column, message: `Invalid number: '${number_text}'`, severity: "Error" });
      } else {
        push({ type: "number", value }, token_line, token_column);
      }
      continue;
    }

    // Identifiers and keywords
    if (is_identifier_start(character)) {
      let word = "";
      const was_at_line_start = at_line_start;
      while (position < input.length && is_identifier_char(peek()!)) {
        word += advance();
      }
      const word_lower = word.toLowerCase();

      // Section keywords (only at line start)
      if (was_at_line_start) {
        const section = SECTION_MAP[word_lower];
        if (section) {
          push({ type: "section", section }, token_line, token_column);
          continue;
        }

        // "Subject To" / "Such That" variants
        if (word_lower === "subject" || word_lower === "such") {
          skip_whitespace();
          if (position < input.length && is_identifier_start(peek()!)) {
            let next_word = "";
            while (position < input.length && is_identifier_char(peek()!)) {
              next_word += advance();
            }
            if (next_word.toLowerCase() === "to" || next_word.toLowerCase() === "that") {
              push({ type: "section", section: "SubjectTo" }, token_line, token_column);
              continue;
            }
          }
        }

        if (word_lower === "st" || word_lower === "s.t.") {
          push({ type: "section", section: "SubjectTo" }, token_line, token_column);
          continue;
        }
      }

      if (word_lower === "free") {
        push({ type: "free" }, token_line, token_column);
        continue;
      }

      push({ type: "identifier", name: word }, token_line, token_column);
      continue;
    }

    // Unknown character
    advance();
    errors.push({ line: token_line, column: token_column, message: `Unexpected character '${character}'`, severity: "Error" });
  }

  push({ type: "eof" }, line, column);
  return { tokens, errors };
}

function is_identifier_start(character: string): boolean {
  return (character >= "a" && character <= "z") || (character >= "A" && character <= "Z") || character === "_";
}

function is_identifier_char(character: string): boolean {
  return is_identifier_start(character) || (character >= "0" && character <= "9") || character === ".";
}

// ── Parser ─────────────────────────────────────────────────────────────

interface LinearTerm {
  coefficient: number;
  variable_name: string;
}

interface LinearExpression {
  terms: LinearTerm[];
  constant: number;
}

interface Constraint {
  name: string;
  expression: LinearExpression;
  operator: "<=" | ">=" | "=";
  rhs: number;
}

function parse_tokens(tokens: Token[]): { model: ParsedModel | null; errors: ParseError[] } {
  let position = 0;
  const errors: ParseError[] = [];

  let sense: "Minimize" | "Maximize" | null = null;
  let objective: LinearExpression | null = null;
  const constraints: Constraint[] = [];
  const bounds: Array<{ name: string; lower: number; upper: number }> = [];
  const integer_variables: string[] = [];
  const binary_variables: string[] = [];
  let constraint_counter = 0;

  function current(): Token { return tokens[Math.min(position, tokens.length - 1)]; }
  function current_kind(): TokenKind { return current().kind; }
  function is_at_end(): boolean { return position >= tokens.length || current_kind().type === "eof"; }
  function is_section(): boolean { return current_kind().type === "section"; }
  function advance_token() { if (position < tokens.length) position++; }

  function skip_newlines() {
    while (!is_at_end() && current_kind().type === "newline") advance_token();
  }

  function skip_newlines_if_continuation() {
    const saved = position;
    let skipped = 0;
    while (position < tokens.length && tokens[position].kind.type === "newline") {
      position++;
      skipped++;
    }
    if (skipped > 0 && position < tokens.length) {
      const next = tokens[position].kind;
      if ((next.type === "plus" || next.type === "minus" || next.type === "number" || next.type === "identifier") && next.type !== "section") {
        return; // keep advanced position — continuation line
      }
    }
    if (skipped > 0) position = saved; // not a continuation — restore
  }

  function try_parse_label(): string | null {
    if (position + 1 < tokens.length && tokens[position].kind.type === "identifier" && tokens[position + 1].kind.type === "colon") {
      const name = (tokens[position].kind as { type: "identifier"; name: string }).name;
      advance_token(); // identifier
      advance_token(); // colon
      return name;
    }
    return null;
  }

  function parse_linear_expression(): LinearExpression {
    const terms: LinearTerm[] = [];
    let constant = 0;
    let sign = 1;

    while (true) {
      skip_newlines_if_continuation();
      const kind = current_kind();

      if (kind.type === "plus") { advance_token(); sign = 1; continue; }
      if (kind.type === "minus") { advance_token(); sign = -1; continue; }

      if (kind.type === "number") {
        const value = kind.value;
        advance_token();
        skip_newlines_if_continuation();
        if (current_kind().type === "identifier") {
          const name = (current_kind() as { type: "identifier"; name: string }).name;
          advance_token();
          terms.push({ coefficient: sign * value, variable_name: name });
        } else {
          constant += sign * value;
        }
        sign = 1;
        continue;
      }

      if (kind.type === "identifier") {
        const name = kind.name;
        advance_token();
        terms.push({ coefficient: sign * 1, variable_name: name });
        sign = 1;
        continue;
      }

      break; // end of expression
    }

    return { terms, constant };
  }

  function parse_rhs_value(): number {
    let negative = false;
    if (current_kind().type === "minus") { advance_token(); negative = true; }
    else if (current_kind().type === "plus") { advance_token(); }

    if (current_kind().type === "number") {
      const value = (current_kind() as { type: "number"; value: number }).value;
      advance_token();
      return negative ? -value : value;
    }

    const token = current();
    errors.push({ line: token.line, column: token.column, message: "Expected a number on the right-hand side", severity: "Error" });
    return 0;
  }

  function parse_constraint(): Constraint | null {
    const name = try_parse_label();
    const expression = parse_linear_expression();
    if (expression.terms.length === 0 && expression.constant === 0) return null;

    let operator: "<=" | ">=" | "=";
    const kind = current_kind();
    if (kind.type === "less_equal") { operator = "<="; advance_token(); }
    else if (kind.type === "greater_equal") { operator = ">="; advance_token(); }
    else if (kind.type === "equal") { operator = "="; advance_token(); }
    else {
      const token = current();
      errors.push({ line: token.line, column: token.column, message: `Expected <=, >=, or = after expression, but found '${describe_token(kind)}'`, severity: "Error" });
      return null;
    }

    const rhs = parse_rhs_value();
    constraint_counter++;
    return { name: name ?? `c${constraint_counter}`, expression, operator, rhs };
  }

  function parse_bound(): { name: string; lower: number; upper: number } | null {
    // number <= var [<= number]
    if (current_kind().type === "number" || current_kind().type === "minus") {
      const lower = parse_rhs_value();
      if (current_kind().type !== "less_equal") {
        errors.push({ line: current().line, column: current().column, message: "Expected '<=' after lower bound", severity: "Error" });
        return null;
      }
      advance_token();
      if (current_kind().type !== "identifier") {
        errors.push({ line: current().line, column: current().column, message: "Expected variable name after '<='", severity: "Error" });
        return null;
      }
      const name = (current_kind() as { type: "identifier"; name: string }).name;
      advance_token();
      let upper = Infinity;
      if (current_kind().type === "less_equal") {
        advance_token();
        upper = parse_rhs_value();
      }
      return { name, lower, upper };
    }

    // var free | var <= num | var >= num | var = num
    if (current_kind().type === "identifier") {
      const name = (current_kind() as { type: "identifier"; name: string }).name;
      advance_token();
      if (current_kind().type === "free") { advance_token(); return { name, lower: -Infinity, upper: Infinity }; }
      if (current_kind().type === "less_equal") { advance_token(); return { name, lower: 0, upper: parse_rhs_value() }; }
      if (current_kind().type === "greater_equal") { advance_token(); return { name, lower: parse_rhs_value(), upper: Infinity }; }
      if (current_kind().type === "equal") { advance_token(); const v = parse_rhs_value(); return { name, lower: v, upper: v }; }
      errors.push({ line: current().line, column: current().column, message: `Expected <=, >=, =, or 'free' after variable '${name}'`, severity: "Error" });
      return null;
    }

    errors.push({ line: current().line, column: current().column, message: "Expected a bounds declaration", severity: "Error" });
    return null;
  }

  function recover_to_next_statement() {
    while (!is_at_end()) {
      if (is_section()) return;
      if (current_kind().type === "newline") {
        advance_token();
        if (is_at_end() || is_section() || current_kind().type === "identifier" || current_kind().type === "number" || current_kind().type === "minus") return;
      } else {
        advance_token();
      }
    }
  }

  function recover_to_next_section() {
    while (!is_at_end()) {
      if (is_section()) return;
      advance_token();
    }
  }

  // ── Main parse loop ──

  while (true) {
    skip_newlines();
    if (is_at_end()) break;

    const kind = current_kind();
    if (kind.type === "section") {
      switch (kind.section) {
        case "Minimize":
        case "Maximize":
          sense = kind.section;
          advance_token();
          skip_newlines();
          try_parse_label(); // optional objective name
          objective = parse_linear_expression();
          break;

        case "SubjectTo":
          advance_token();
          skip_newlines();
          while (!is_at_end() && !is_section()) {
            const constraint = parse_constraint();
            if (constraint) constraints.push(constraint);
            else recover_to_next_statement();
            skip_newlines();
          }
          break;

        case "Bounds":
          advance_token();
          skip_newlines();
          while (!is_at_end() && !is_section()) {
            const bound = parse_bound();
            if (bound) bounds.push(bound);
            else recover_to_next_statement();
            skip_newlines();
          }
          break;

        case "General":
          advance_token();
          skip_newlines();
          while (!is_at_end() && !is_section()) {
            if (current_kind().type === "identifier") {
              integer_variables.push((current_kind() as { type: "identifier"; name: string }).name);
              advance_token();
            } else if (current_kind().type === "newline") {
              skip_newlines();
            } else {
              advance_token();
            }
          }
          break;

        case "Binary":
          advance_token();
          skip_newlines();
          while (!is_at_end() && !is_section()) {
            if (current_kind().type === "identifier") {
              binary_variables.push((current_kind() as { type: "identifier"; name: string }).name);
              advance_token();
            } else if (current_kind().type === "newline") {
              skip_newlines();
            } else {
              advance_token();
            }
          }
          break;

        case "End":
          advance_token();
          break;
      }
      if (kind.section === "End") break;
    } else {
      const token = current();
      errors.push({ line: token.line, column: token.column, message: `Expected a section keyword (Minimize, Maximize, Subject To, Bounds, General, Binary, End), but found '${describe_token(kind)}'`, severity: "Error" });
      recover_to_next_section();
    }
  }

  if (!sense) {
    errors.push({ line: 1, column: 1, message: "Missing objective function. The model must start with 'Minimize' or 'Maximize'.", severity: "Error" });
    return { model: null, errors };
  }

  if (!objective) {
    errors.push({ line: 1, column: 1, message: "Missing objective expression after Minimize/Maximize.", severity: "Error" });
    return { model: null, errors };
  }

  // Build variable list
  const variable_names_ordered: string[] = [];
  const variable_names_set = new Set<string>();

  function register_variable(name: string) {
    if (!variable_names_set.has(name)) {
      variable_names_set.add(name);
      variable_names_ordered.push(name);
    }
  }

  for (const term of objective.terms) register_variable(term.variable_name);
  for (const constraint of constraints) {
    for (const term of constraint.expression.terms) register_variable(term.variable_name);
  }
  for (const bound of bounds) register_variable(bound.name);
  for (const name of integer_variables) register_variable(name);
  for (const name of binary_variables) register_variable(name);

  const variables = variable_names_ordered.map((name) => {
    const is_binary = binary_variables.includes(name);
    const is_integer = integer_variables.includes(name);
    const bound = bounds.find((b) => b.name === name);

    return {
      name,
      type: is_binary ? "Binary" as const : is_integer ? "Integer" as const : "Continuous" as const,
      lower_bound: is_binary ? 0 : bound?.lower ?? 0,
      upper_bound: is_binary ? 1 : bound?.upper ?? Infinity,
    };
  });

  // Validation warnings
  const referenced_in_expressions = new Set<string>();
  for (const term of objective.terms) referenced_in_expressions.add(term.variable_name);
  for (const constraint of constraints) {
    for (const term of constraint.expression.terms) referenced_in_expressions.add(term.variable_name);
  }

  for (const variable of variables) {
    if (!referenced_in_expressions.has(variable.name)) {
      errors.push({ line: 0, column: 0, message: `Variable '${variable.name}' is declared but never used in the objective or any constraint.`, severity: "Warning" });
    }
  }

  for (const constraint of constraints) {
    if (constraint.expression.terms.length === 0) {
      errors.push({ line: 0, column: 0, message: `Constraint '${constraint.name}' has no variables.`, severity: "Warning" });
    }
  }

  return {
    model: { sense, objective, constraints, variables },
    errors,
  };
}

interface ParsedModel {
  sense: "Minimize" | "Maximize";
  objective: LinearExpression;
  constraints: Constraint[];
  variables: Array<{
    name: string;
    type: "Continuous" | "Integer" | "Binary";
    lower_bound: number;
    upper_bound: number;
  }>;
}

function describe_token(kind: TokenKind): string {
  switch (kind.type) {
    case "section": return kind.section;
    case "identifier": return kind.name;
    case "number": return String(kind.value);
    case "plus": return "+";
    case "minus": return "-";
    case "colon": return ":";
    case "less_equal": return "<=";
    case "greater_equal": return ">=";
    case "equal": return "=";
    case "free": return "free";
    case "newline": return "newline";
    case "eof": return "end of input";
  }
}

// ── Public API ─────────────────────────────────────────────────────────

export function parse_lp(input: string): ParseResult {
  const { tokens, errors: lex_errors } = lex(input);
  const { model, errors: parse_errors } = parse_tokens(tokens);

  const all_errors = [...lex_errors, ...parse_errors];

  const summary: ModelSummary | null = model
    ? {
        variable_count: model.variables.length,
        constraint_count: model.constraints.length,
        sense: model.sense,
        has_integer_variables: model.variables.some((v) => v.type === "Integer" || v.type === "Binary"),
      }
    : null;

  return { model, errors: all_errors, summary };
}
