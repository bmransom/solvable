import type { ParseResult } from "./types";

let wasm_module: typeof import("../wasm/solvable_wasm") | null = null;
let load_promise: Promise<void> | null = null;
let load_error: string | null = null;

export async function initializeParser(): Promise<void> {
  if (wasm_module) return;
  if (load_promise) return load_promise;

  load_promise = (async () => {
    try {
      const module = await import("../wasm/solvable_wasm");
      await module.default();
      wasm_module = module;
    } catch (error) {
      load_error = `Failed to load parser WASM module: ${error}. Check that your browser supports WebAssembly.`;
      throw new Error(load_error);
    }
  })();

  return load_promise;
}

export function parse(lp_string: string): ParseResult {
  if (!wasm_module) {
    return {
      model: null,
      errors: [
        {
          line: 0,
          column: 0,
          message: load_error ?? "Parser not initialized. Call initializeParser() first.",
          severity: "Error",
        },
      ],
      summary: null,
    };
  }

  try {
    const json_string = wasm_module.parse(lp_string);
    return JSON.parse(json_string) as ParseResult;
  } catch (error) {
    return {
      model: null,
      errors: [
        {
          line: 0,
          column: 0,
          message: `Parser error: ${error}`,
          severity: "Error",
        },
      ],
      summary: null,
    };
  }
}

export function parserVersion(): string | null {
  return wasm_module?.version() ?? null;
}

export function isParserReady(): boolean {
  return wasm_module !== null;
}
