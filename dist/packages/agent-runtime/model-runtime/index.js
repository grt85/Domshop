"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIModel = void 0;
class OpenAIModel {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.model = config.model;
    }
    async generate(prompt) {
        return `🔮 [${this.model}] згенерував відповідь на промпт: "${prompt}"`;
    }
}
exports.OpenAIModel = OpenAIModel;
