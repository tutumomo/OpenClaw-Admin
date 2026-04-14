// Hermes API 类型定义

export interface HermesModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: any[];
  root: string;
  parent: string | null;
}

export interface HermesModelsResponse {
  object: string;
  data: HermesModel[];
}

export interface HermesChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface HermesChatCompletionRequest {
  model: string;
  messages: HermesChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  n?: number;
  user?: string;
  tool_choice?: any;
  tools?: any[];
}

export interface HermesChatCompletionChoice {
  index: number;
  message: {
    role: 'assistant';
    content: string;
  };
  finish_reason: string;
}

export interface HermesChatCompletionUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface HermesChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: HermesChatCompletionChoice[];
  usage: HermesChatCompletionUsage;
}

export interface HermesChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: [
    {
      index: number;
      delta: {
        role?: 'assistant';
        content?: string;
      };
      finish_reason: string | null;
    }
  ];
  usage?: HermesChatCompletionUsage;
}

export interface HermesSession {
  id: string;
  name: string;
  created_at: number;
  last_message_at: number;
  message_count: number;
}

export interface HermesSkill {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  enabled: boolean;
}

export interface HermesConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}
