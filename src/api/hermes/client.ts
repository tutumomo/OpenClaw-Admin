// Hermes API 客户端
import type {
  HermesModelsResponse,
  HermesChatCompletionRequest,
  HermesChatCompletionResponse,
  HermesChatCompletionChunk,
  HermesSession,
  HermesSkill,
  HermesConfig
} from './types';

class HermesApiClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = 'http://localhost:8642/v1', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  async getModels(): Promise<HermesModelsResponse> {
    const response = await fetch(`${this.baseUrl}/models`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to get models: ${response.statusText}`);
    }
    return response.json();
  }

  async createChatCompletion(
    request: HermesChatCompletionRequest
  ): Promise<HermesChatCompletionResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request)
    });
    if (!response.ok) {
      throw new Error(`Failed to create chat completion: ${response.statusText}`);
    }
    return response.json();
  }

  async streamChatCompletion(
    request: HermesChatCompletionRequest,
    onChunk: (chunk: HermesChatCompletionChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ ...request, stream: true })
      });

      if (!response.ok) {
        throw new Error(`Failed to stream chat completion: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === 'data: [DONE]') {
            continue;
          }
          if (trimmed.startsWith('data: ')) {
            try {
              const chunk = JSON.parse(trimmed.substring(6)) as HermesChatCompletionChunk;
              onChunk(chunk);
            } catch (error) {
              console.error('Failed to parse chunk:', error);
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  // 会话管理
  async getSessions(): Promise<HermesSession[]> {
    // 这里需要根据 Hermes Agent 的实际会话管理 API 实现
    // 暂时返回模拟数据
    return [
      {
        id: 'session-1',
        name: 'Test Session',
        created_at: Date.now() - 3600000,
        last_message_at: Date.now() - 600000,
        message_count: 5
      }
    ];
  }

  async createSession(name: string): Promise<HermesSession> {
    // 暂时返回模拟数据
    return {
      id: `session-${Date.now()}`,
      name,
      created_at: Date.now(),
      last_message_at: Date.now(),
      message_count: 0
    };
  }

  async deleteSession(sessionId: string): Promise<void> {
    // 暂时不做任何操作
  }

  // 技能管理
  async getSkills(): Promise<HermesSkill[]> {
    // 暂时返回模拟数据
    return [
      {
        id: 'skill-1',
        name: 'Web Search',
        description: 'Search the web for information',
        version: '1.0.0',
        author: 'Hermes',
        enabled: true
      },
      {
        id: 'skill-2',
        name: 'Code Execution',
        description: 'Execute code in a sandbox',
        version: '1.0.0',
        author: 'Hermes',
        enabled: true
      }
    ];
  }

  async toggleSkill(skillId: string, enabled: boolean): Promise<void> {
    // 暂时不做任何操作
  }

  // 配置管理
  async getConfig(): Promise<HermesConfig> {
    // 暂时返回默认配置
    return {
      model: 'hermes-agent',
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    };
  }

  async updateConfig(config: Partial<HermesConfig>): Promise<HermesConfig> {
    // 暂时返回更新后的配置
    return {
      model: 'hermes-agent',
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      ...config
    };
  }
}

// 创建默认实例
export const hermesApiClient = new HermesApiClient();

export default HermesApiClient;
