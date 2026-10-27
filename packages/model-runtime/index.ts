export class OpenAIModel {
  apiKey: string;
  model: string;

  constructor(config: { apiKey: string; model: string }) {
    this.apiKey = config.apiKey;
    this.model = config.model;
  }

  async generate(prompt: string): Promise<string> {
    return `🔮 [${this.model}] згенерував відповідь на промпт: "${prompt}"`;
  }
}
