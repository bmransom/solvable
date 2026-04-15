use std::iter::Peekable;
use std::ops::Range;
use std::str::CharIndices;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Section {
    Minimize,
    Maximize,
    SubjectTo,
    Bounds,
    General,
    Binary,
    End,
}

#[derive(Debug, Clone, PartialEq)]
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

#[derive(Debug, Clone, PartialEq)]
pub struct Token {
    pub kind: TokenKind,
    pub line: usize,
    pub column: usize,
    pub span: Range<usize>,
}

impl Token {
    pub fn is_section_keyword(&self) -> bool {
        matches!(self.kind, TokenKind::SectionKeyword(_))
    }

    pub fn is_expression_continuation(&self) -> bool {
        matches!(
            self.kind,
            TokenKind::Plus
                | TokenKind::Minus
                | TokenKind::Number(_)
                | TokenKind::Identifier(_)
        )
    }
}

pub struct Lexer<'a> {
    input: &'a str,
    chars: Peekable<CharIndices<'a>>,
    line: usize,
    column: usize,
    at_line_start: bool,
    tokens: Vec<Token>,
    errors: Vec<LexError>,
}

#[derive(Debug, Clone)]
pub struct LexError {
    pub line: usize,
    pub column: usize,
    pub message: String,
}

impl<'a> Lexer<'a> {
    pub fn new(input: &'a str) -> Self {
        Self {
            input,
            chars: input.char_indices().peekable(),
            line: 1,
            column: 1,
            at_line_start: true,
            tokens: Vec::new(),
            errors: Vec::new(),
        }
    }

    pub fn lex(mut self) -> (Vec<Token>, Vec<LexError>) {
        while self.peek_char().is_some() {
            self.skip_whitespace();

            match self.peek_char() {
                None => break,
                Some('\n') => self.lex_newline(),
                Some('\\') => self.skip_comment(),
                Some('+') => self.lex_single_char(TokenKind::Plus),
                Some('-') => self.lex_single_char(TokenKind::Minus),
                Some(':') => self.lex_single_char(TokenKind::Colon),
                Some('=') => self.lex_single_char(TokenKind::Equal),
                Some('<') => self.lex_less_equal(),
                Some('>') => self.lex_greater_equal(),
                Some(ch) if ch.is_ascii_digit() || ch == '.' => self.lex_number(),
                Some(ch) if is_identifier_start(ch) => self.lex_identifier_or_keyword(),
                Some(ch) => {
                    let line = self.line;
                    let column = self.column;
                    self.advance();
                    self.errors.push(LexError {
                        line,
                        column,
                        message: format!("Unexpected character '{ch}'"),
                    });
                }
            }
        }

        let eof_offset = self.current_offset();
        self.tokens.push(Token {
            kind: TokenKind::Eof,
            line: self.line,
            column: self.column,
            span: eof_offset..eof_offset,
        });

        (self.tokens, self.errors)
    }

    fn peek_char(&mut self) -> Option<char> {
        self.chars.peek().map(|&(_, ch)| ch)
    }

    fn current_offset(&mut self) -> usize {
        self.chars
            .peek()
            .map(|&(offset, _)| offset)
            .unwrap_or(self.input.len())
    }

    fn advance(&mut self) -> Option<(usize, char)> {
        let result = self.chars.next();
        if let Some((_, ch)) = result {
            if ch == '\n' {
                self.line += 1;
                self.column = 1;
                self.at_line_start = true;
            } else {
                self.column += 1;
                if !ch.is_whitespace() {
                    self.at_line_start = false;
                }
            }
        }
        result
    }

    fn skip_whitespace(&mut self) {
        while let Some(ch) = self.peek_char() {
            if ch == ' ' || ch == '\t' || ch == '\r' {
                self.advance();
            } else {
                break;
            }
        }
    }

    fn lex_newline(&mut self) {
        let start = self.current_offset();
        let line = self.line;
        let column = self.column;
        self.advance();
        self.tokens.push(Token {
            kind: TokenKind::Newline,
            line,
            column,
            span: start..start + 1,
        });
    }

    fn skip_comment(&mut self) {
        // Skip everything until end of line
        while let Some(ch) = self.peek_char() {
            if ch == '\n' {
                break;
            }
            self.advance();
        }
    }

    fn lex_single_char(&mut self, kind: TokenKind) {
        let start = self.current_offset();
        let line = self.line;
        let column = self.column;
        self.advance();
        self.tokens.push(Token {
            kind,
            line,
            column,
            span: start..start + 1,
        });
    }

    fn lex_less_equal(&mut self) {
        let start = self.current_offset();
        let line = self.line;
        let column = self.column;
        self.advance(); // consume '<'
        if self.peek_char() == Some('=') {
            self.advance(); // consume '='
        }
        let end = self.current_offset();
        self.tokens.push(Token {
            kind: TokenKind::LessEqual,
            line,
            column,
            span: start..end,
        });
    }

    fn lex_greater_equal(&mut self) {
        let start = self.current_offset();
        let line = self.line;
        let column = self.column;
        self.advance(); // consume '>'
        if self.peek_char() == Some('=') {
            self.advance(); // consume '='
        }
        let end = self.current_offset();
        self.tokens.push(Token {
            kind: TokenKind::GreaterEqual,
            line,
            column,
            span: start..end,
        });
    }

    fn lex_number(&mut self) {
        let start = self.current_offset();
        let line = self.line;
        let column = self.column;

        while let Some(ch) = self.peek_char() {
            if ch.is_ascii_digit() || ch == '.' {
                self.advance();
            } else {
                break;
            }
        }

        // Handle scientific notation: e.g., 1.5e10, 2E-3
        if let Some(ch) = self.peek_char() {
            if ch == 'e' || ch == 'E' {
                self.advance();
                if let Some(sign) = self.peek_char() {
                    if sign == '+' || sign == '-' {
                        self.advance();
                    }
                }
                while let Some(ch) = self.peek_char() {
                    if ch.is_ascii_digit() {
                        self.advance();
                    } else {
                        break;
                    }
                }
            }
        }

        let end = self.current_offset();
        let text = &self.input[start..end];

        match text.parse::<f64>() {
            Ok(value) => {
                self.tokens.push(Token {
                    kind: TokenKind::Number(value),
                    line,
                    column,
                    span: start..end,
                });
            }
            Err(_) => {
                self.errors.push(LexError {
                    line,
                    column,
                    message: format!("Invalid number: '{text}'"),
                });
            }
        }
    }

    fn lex_identifier_or_keyword(&mut self) {
        let start = self.current_offset();
        let line = self.line;
        let column = self.column;
        let was_at_line_start = self.at_line_start;

        while let Some(ch) = self.peek_char() {
            if is_identifier_char(ch) {
                self.advance();
            } else {
                break;
            }
        }

        let end = self.current_offset();
        let text = &self.input[start..end];
        let text_lower = text.to_ascii_lowercase();

        // Check for "Subject To" / "s.t." / "st" as two-word keyword
        if was_at_line_start {
            if let Some(section) = match text_lower.as_str() {
                "minimize" | "min" | "minimum" => Some(Section::Minimize),
                "maximize" | "max" | "maximum" => Some(Section::Maximize),
                "bounds" | "bound" => Some(Section::Bounds),
                "general" | "generals" | "gen" => Some(Section::General),
                "binary" | "binaries" | "bin" => Some(Section::Binary),
                "end" => Some(Section::End),
                _ => None,
            } {
                self.tokens.push(Token {
                    kind: TokenKind::SectionKeyword(section),
                    line,
                    column,
                    span: start..end,
                });
                return;
            }

            // Handle "Subject To" and variants
            if matches!(text_lower.as_str(), "subject" | "such") {
                self.skip_whitespace();
                if let Some(ch) = self.peek_char() {
                    if ch.is_ascii_alphabetic() {
                        let next_start = self.current_offset();
                        while let Some(ch) = self.peek_char() {
                            if is_identifier_char(ch) {
                                self.advance();
                            } else {
                                break;
                            }
                        }
                        let next_end = self.current_offset();
                        let next_text = &self.input[next_start..next_end];
                        if next_text.eq_ignore_ascii_case("to")
                            || next_text.eq_ignore_ascii_case("that")
                        {
                            self.tokens.push(Token {
                                kind: TokenKind::SectionKeyword(Section::SubjectTo),
                                line,
                                column,
                                span: start..next_end,
                            });
                            return;
                        }
                    }
                }
            }

            if matches!(text_lower.as_str(), "st" | "s.t.") {
                self.tokens.push(Token {
                    kind: TokenKind::SectionKeyword(Section::SubjectTo),
                    line,
                    column,
                    span: start..end,
                });
                return;
            }
        }

        // Check for "free" keyword (used in Bounds section)
        if text_lower == "free" {
            self.tokens.push(Token {
                kind: TokenKind::Free,
                line,
                column,
                span: start..end,
            });
            return;
        }

        self.tokens.push(Token {
            kind: TokenKind::Identifier(text.to_string()),
            line,
            column,
            span: start..end,
        });
    }
}

fn is_identifier_start(ch: char) -> bool {
    ch.is_ascii_alphabetic() || ch == '_'
}

fn is_identifier_char(ch: char) -> bool {
    ch.is_ascii_alphanumeric() || ch == '_' || ch == '.'
}

pub fn lex(input: &str) -> (Vec<Token>, Vec<LexError>) {
    Lexer::new(input).lex()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn lex_kinds(input: &str) -> Vec<TokenKind> {
        let (tokens, _) = lex(input);
        tokens.into_iter().map(|token| token.kind).collect()
    }

    #[test]
    fn test_lex_section_keywords_case_insensitive() {
        for (input, expected) in [
            ("Minimize", Section::Minimize),
            ("MINIMIZE", Section::Minimize),
            ("min", Section::Minimize),
            ("Maximize", Section::Maximize),
            ("max", Section::Maximize),
            ("Bounds", Section::Bounds),
            ("General", Section::General),
            ("Binary", Section::Binary),
            ("End", Section::End),
        ] {
            let (tokens, errors) = lex(input);
            assert!(errors.is_empty(), "errors for '{input}': {errors:?}");
            assert_eq!(
                tokens[0].kind,
                TokenKind::SectionKeyword(expected),
                "failed for '{input}'"
            );
        }
    }

    #[test]
    fn test_lex_subject_to_variants() {
        for input in ["Subject To", "subject to", "SUBJECT TO", "st", "s.t.", "Such That"] {
            let (tokens, errors) = lex(input);
            assert!(errors.is_empty(), "errors for '{input}': {errors:?}");
            assert_eq!(
                tokens[0].kind,
                TokenKind::SectionKeyword(Section::SubjectTo),
                "failed for '{input}'"
            );
        }
    }

    #[test]
    fn test_lex_numbers() {
        assert_eq!(lex_kinds("42"), vec![TokenKind::Number(42.0), TokenKind::Eof]);
        assert_eq!(lex_kinds("3.14"), vec![TokenKind::Number(3.14), TokenKind::Eof]);
        assert_eq!(lex_kinds("1e5"), vec![TokenKind::Number(1e5), TokenKind::Eof]);
        assert_eq!(lex_kinds("2.5E-3"), vec![TokenKind::Number(2.5e-3), TokenKind::Eof]);
    }

    #[test]
    fn test_lex_operators() {
        assert_eq!(
            lex_kinds("+ - >= <= ="),
            vec![
                TokenKind::Plus,
                TokenKind::Minus,
                TokenKind::GreaterEqual,
                TokenKind::LessEqual,
                TokenKind::Equal,
                TokenKind::Eof,
            ]
        );
    }

    #[test]
    fn test_lex_identifier_and_colon() {
        assert_eq!(
            lex_kinds("protein: 0.1 bread"),
            vec![
                TokenKind::Identifier("protein".to_string()),
                TokenKind::Colon,
                TokenKind::Number(0.1),
                TokenKind::Identifier("bread".to_string()),
                TokenKind::Eof,
            ]
        );
    }

    #[test]
    fn test_lex_skips_comments() {
        let input = "\\ This is a comment\nMinimize";
        let (tokens, errors) = lex(input);
        assert!(errors.is_empty());
        assert_eq!(tokens[0].kind, TokenKind::Newline);
        assert_eq!(
            tokens[1].kind,
            TokenKind::SectionKeyword(Section::Minimize)
        );
    }

    #[test]
    fn test_lex_free_keyword() {
        assert_eq!(
            lex_kinds("x free"),
            vec![
                TokenKind::Identifier("x".to_string()),
                TokenKind::Free,
                TokenKind::Eof,
            ]
        );
    }

    #[test]
    fn test_lex_tracks_line_and_column() {
        let input = "Minimize\n  cost: 2 x";
        let (tokens, _) = lex(input);

        // "Minimize" on line 1, column 1
        assert_eq!(tokens[0].line, 1);
        assert_eq!(tokens[0].column, 1);

        // Newline at end of line 1
        assert_eq!(tokens[1].kind, TokenKind::Newline);

        // "cost" on line 2
        assert_eq!(tokens[2].line, 2);
        assert_eq!(tokens[2].column, 3); // after 2 spaces
    }

    #[test]
    fn test_lex_full_objective_line() {
        let input = "cost: 2 bread + 3.5 milk - 1.5 potato";
        let kinds = lex_kinds(input);
        assert_eq!(
            kinds,
            vec![
                TokenKind::Identifier("cost".to_string()),
                TokenKind::Colon,
                TokenKind::Number(2.0),
                TokenKind::Identifier("bread".to_string()),
                TokenKind::Plus,
                TokenKind::Number(3.5),
                TokenKind::Identifier("milk".to_string()),
                TokenKind::Minus,
                TokenKind::Number(1.5),
                TokenKind::Identifier("potato".to_string()),
                TokenKind::Eof,
            ]
        );
    }

    #[test]
    fn test_section_keywords_only_at_line_start() {
        // "end" at line start is a keyword
        let (tokens, _) = lex("End");
        assert_eq!(tokens[0].kind, TokenKind::SectionKeyword(Section::End));

        // "end" mid-line is an identifier (e.g., variable named "end")
        let (tokens, _) = lex("x + end");
        let end_token = tokens.iter().find(|t| matches!(&t.kind, TokenKind::Identifier(s) if s == "end"));
        assert!(end_token.is_some());
    }
}
