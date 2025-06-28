import type { OpenAiModels } from './constants'

export type ISWAction = 'executeQuery'

export interface IConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface IExecuteQueryMessage {
  action: ISWAction
  history: IConversationMessage[]
  aiModel: string
}

export type IAIModel = (typeof OpenAiModels)[number]
