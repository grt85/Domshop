// Простий каркас класу Agent
export class Agent {
  id: string;
  name: string;
  description: string;
  model: any;
  prompt: string;
  tools: Record<string, Function>;

  constructor(config: {
    id: string;
    name: string;
    description: string;
    model: any;
    prompt: string;
    tools?: Record<string, Function>;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.model = config.model;
    this.prompt = config.prompt;
    this.tools = config.tools || {};
  }

  async chat(question: string, options?: { tools?: Record<string, Function> }) {
    // Тут можна додати інтеграцію з LLM (наприклад, OpenAIModel)
    // Для мінімального прикладу повертаємо заглушку
    if (options?.tools) {
      this.tools = { ...this.tools, ...options.tools };
    }
    return `🤖 [${this.name}] отримав питання: "${question}"`;
  }
}
