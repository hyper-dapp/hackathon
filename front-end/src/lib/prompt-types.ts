export type PromptType =
  | "col"
  | "row"
  | "log"
  | "text"
  | "debug"
  | "input"
  | "button";

export type Prompt = [PromptType, ...PromptArg[]];
export type PromptArg = string | Prompt | object;
