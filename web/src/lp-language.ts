import { StreamLanguage, type StreamParser } from "@codemirror/language";
import { tags } from "@lezer/highlight";

const SECTION_KEYWORDS = new Set([
  "minimize", "maximize", "min", "max", "minimum", "maximum",
  "subject", "such", "st", "s.t.",
  "bounds", "bound",
  "general", "generals", "gen",
  "binary", "binaries", "bin",
  "end",
]);

const LP_STREAM_PARSER: StreamParser<{ in_comment: boolean }> = {
  startState() {
    return { in_comment: false };
  },

  token(stream, state) {
    if (state.in_comment) {
      stream.skipToEnd();
      state.in_comment = false;
      return "comment";
    }

    // Skip whitespace
    if (stream.eatSpace()) return null;

    // Comment lines start with backslash
    if (stream.peek() === "\\") {
      stream.skipToEnd();
      return "comment";
    }

    // Operators: >=, <=, =
    if (stream.match(">=") || stream.match("<=")) {
      return "operator";
    }
    if (stream.match("=")) {
      return "operator";
    }
    if (stream.match("+") || stream.match("-")) {
      return "operator";
    }

    // Numbers (including decimals and scientific notation)
    if (stream.match(/^\d+\.?\d*([eE][+-]?\d+)?/) || stream.match(/^\.\d+([eE][+-]?\d+)?/)) {
      return "number";
    }

    // Colon (constraint name separator)
    if (stream.match(":")) {
      return "punctuation";
    }

    // Identifiers and keywords
    if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_.]*/)) {
      const word = stream.current().toLowerCase();

      if (SECTION_KEYWORDS.has(word)) {
        // "subject to" / "such that" need special handling
        if (word === "subject" || word === "such") {
          // Peek ahead for "to" or "that"
          const remaining = stream.string.slice(stream.pos).trimStart();
          if (/^(to|that)\b/i.test(remaining)) {
            stream.match(/^\s+(to|that)/i);
          }
        }
        return "keyword";
      }

      if (word === "free") {
        return "keyword";
      }

      // Check if this identifier is followed by a colon (constraint name)
      const remaining = stream.string.slice(stream.pos).trimStart();
      if (remaining.startsWith(":")) {
        return "labelName";
      }

      return "variableName";
    }

    // Skip unknown characters
    stream.next();
    return null;
  },
};

export const lp_language = StreamLanguage.define(LP_STREAM_PARSER);

export const LP_HIGHLIGHT_STYLE_TAGS = {
  keyword: tags.keyword,
  comment: tags.comment,
  number: tags.number,
  operator: tags.operator,
  labelName: tags.labelName,
  variableName: tags.variableName.definition,
  punctuation: tags.punctuation,
};
