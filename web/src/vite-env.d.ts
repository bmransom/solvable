/// <reference types="svelte" />
/// <reference types="vite/client" />

declare module "*.lp?raw" {
  const content: string;
  export default content;
}

declare module "highs" {
  function highsLoader(options?: {
    locateFile?: (file: string) => string;
  }): Promise<{
    solve(problem: string, options?: Record<string, unknown>): any;
  }>;
  export default highsLoader;
}
