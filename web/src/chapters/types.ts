export type LessonBlock =
  | ProseBlock
  | InteractiveBlock
  | RevealBlock
  | GoDeeperBlock
  | PredictionBlock
  | CheckpointBlock
  | SandboxLinkBlock;

export interface ProseBlock {
  type: "prose";
  content: string;
}

export interface InteractiveBlock {
  type: "interactive";
  component: string;
  props: Record<string, unknown>;
}

export interface RevealBlock {
  type: "reveal";
  label: string;
  content: string;
}

export interface GoDeeperBlock {
  type: "go_deeper";
  title: string;
  content: string;
}

export interface PredictionBlock {
  type: "prediction";
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface CheckpointBlock {
  type: "checkpoint";
  message: string;
}

export interface SandboxLinkBlock {
  type: "sandbox_link";
  label: string;
  lp_text: string;
}

export interface Lesson {
  id: string;
  title: string;
  blocks: LessonBlock[];
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  is_sandbox?: boolean;
}
