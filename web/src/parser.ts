import type { ParseResult } from "./types";
import { parse_lp } from "./lp-parser";

export async function initializeParser(): Promise<void> {
  // No-op — TypeScript parser needs no initialization.
  // Kept for API compatibility with the rest of the app.
}

export function parse(lp_string: string): ParseResult {
  return parse_lp(lp_string);
}

export function isParserReady(): boolean {
  return true;
}
