import type { SolveResult, SolverMessage, SolverResponse, SolverState } from "./types";

type StateChangeCallback = (state: SolverState) => void;

export class SolverManager {
  private worker: Worker | null = null;
  private state: SolverState = "not-loaded";
  private pending_resolve: ((result: SolveResult) => void) | null = null;
  private pending_reject: ((error: Error) => void) | null = null;
  private queued_solve: string | null = null;
  private queued_resolve: ((result: SolveResult) => void) | null = null;
  private queued_reject: ((error: Error) => void) | null = null;
  private on_state_change: StateChangeCallback | null = null;

  constructor(on_state_change?: StateChangeCallback) {
    this.on_state_change = on_state_change ?? null;
    this.spawnWorker();
  }

  get current_state(): SolverState {
    return this.state;
  }

  async solve(lp_string: string): Promise<SolveResult> {
    if (this.state === "reinitializing" || this.state === "loading") {
      return new Promise((resolve, reject) => {
        this.queued_solve = lp_string;
        this.queued_resolve = resolve;
        this.queued_reject = reject;
      });
    }

    if (this.state !== "ready") {
      return {
        status: "Error",
        objective_value: null,
        variable_values: {},
        constraint_values: {},
        solve_time_ms: 0,
        error_message: `Solver is not ready (state: ${this.state})`,
      };
    }

    return new Promise((resolve, reject) => {
      this.pending_resolve = resolve;
      this.pending_reject = reject;
      this.setState("solving");

      const message: SolverMessage = { type: "solve", lp_string };
      this.worker!.postMessage(message);
    });
  }

  cancel() {
    if (this.state !== "solving") return;

    if (this.pending_reject) {
      this.pending_reject(new Error("Solve cancelled"));
      this.pending_resolve = null;
      this.pending_reject = null;
    }

    this.worker?.terminate();
    this.worker = null;
    this.setState("reinitializing");
    this.spawnWorker();
  }

  destroy() {
    this.worker?.terminate();
    this.worker = null;
    this.pending_resolve = null;
    this.pending_reject = null;
    this.queued_resolve = null;
    this.queued_reject = null;
  }

  private spawnWorker() {
    this.setState("loading");

    this.worker = new Worker(new URL("./solver-worker.ts", import.meta.url), {
      type: "module",
    });

    this.worker.onmessage = (event: MessageEvent<SolverResponse>) => {
      this.handleWorkerMessage(event.data);
    };

    this.worker.onerror = (event) => {
      console.error("Solver worker error:", event);
      if (this.pending_reject) {
        this.pending_reject(new Error(`Worker error: ${event.message}`));
        this.pending_resolve = null;
        this.pending_reject = null;
      }
      this.setState("not-loaded");
    };
  }

  private handleWorkerMessage(response: SolverResponse) {
    switch (response.type) {
      case "ready":
        this.setState("ready");
        this.drainQueue();
        break;

      case "result":
        if (this.pending_resolve && response.result) {
          this.pending_resolve(response.result);
        }
        this.pending_resolve = null;
        this.pending_reject = null;
        this.setState("ready");
        break;

      case "error":
        if (this.pending_reject) {
          this.pending_reject(new Error(response.error ?? "Unknown solver error"));
        } else {
          console.error("Solver error:", response.error);
        }
        this.pending_resolve = null;
        this.pending_reject = null;
        if (this.state === "solving") {
          this.setState("ready");
        }
        break;
    }
  }

  private drainQueue() {
    if (this.queued_solve && this.queued_resolve && this.queued_reject) {
      const lp_string = this.queued_solve;
      const resolve = this.queued_resolve;
      const reject = this.queued_reject;
      this.queued_solve = null;
      this.queued_resolve = null;
      this.queued_reject = null;

      this.pending_resolve = resolve;
      this.pending_reject = reject;
      this.setState("solving");

      const message: SolverMessage = { type: "solve", lp_string };
      this.worker!.postMessage(message);
    }
  }

  private setState(new_state: SolverState) {
    this.state = new_state;
    this.on_state_change?.(new_state);
  }
}
