export type ISWAction = 'executeQuery'

export interface IConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface IExecuteQueryMessage {
  action: ISWAction
  history: IConversationMessage[]
  aiModel: IAIModel
}

export const IAIModel = [
  'gpt-4.1-2025-04-14',
  'o3-2025-04-16',
  'o4-mini-2025-04-16',
  'o4-mini-2025-04-16',
  'gpt-4o-2024-08-06'
] as const

export type IAIModel = (typeof IAIModel)[number]
