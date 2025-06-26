export type ISWAction = "executeQuery";

export interface IConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface IExecuteQueryMessage {
  action: ISWAction;
  prompt: string;
  history: IConversationMessage[];
}
