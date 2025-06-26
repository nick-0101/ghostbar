export type ISWAction = "executeQuery";

export interface IConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface IExecuteQueryMessage {
  action: ISWAction;
  history: IConversationMessage[];
  aiModel: IAIModel;
}

export type IAIModel = "gpt-4.1" | "gpt-4.1-preview" | "gpt-4o-mini" | "gpt-4o";
