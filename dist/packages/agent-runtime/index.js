"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
// Простий каркас класу Agent
class Agent {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.model = config.model;
        this.prompt = config.prompt;
        this.tools = config.tools || {};
    }
    async chat(question, options) {
        // Тут можна додати інтеграцію з LLM (наприклад, OpenAIModel)
        // Для мінімального прикладу повертаємо заглушку
        if (options?.tools) {
            this.tools = { ...this.tools, ...options.tools };
        }
        return `🤖 [${this.name}] отримав питання: "${question}"`;
    }
}
exports.Agent = Agent;
