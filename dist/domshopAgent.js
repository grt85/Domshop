"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomshopAgent = void 0;
const agent_runtime_1 = require("./packages/agent-runtime");
const model_runtime_1 = require("./packages/model-runtime");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
// Шляхи до JSON
const subscribersFile = path_1.default.resolve(__dirname, "subscribers.json");
const ordersFile = path_1.default.resolve(__dirname, "orders.json");
// Допоміжна функція
async function readJSON(file) {
    try {
        const data = await promises_1.default.readFile(file, "utf8");
        return JSON.parse(data);
    }
    catch {
        return [];
    }
}
// Інструменти
const tools = {
    async checkSubscriber(email) {
        const subs = await readJSON(subscribersFile);
        return subs.some((s) => s.email === email)
            ? `Email ${email} вже є у списку підписників.`
            : `Email ${email} ще не підписаний.`;
    },
    async checkOrder(orderId) {
        const orders = await readJSON(ordersFile);
        const order = orders.find((o) => o.id === orderId);
        if (!order)
            return `Замовлення #${orderId} не знайдено.`;
        const items = order.cart.map((i) => `${i.name} × ${i.qty}`).join(", ");
        return `Замовлення #${orderId}: ${order.name} ${order.surname}, товари: ${items}`;
    },
};
// ✅ Перевірка ключа
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    throw new Error("❌ OPENAI_API_KEY не встановлений у .env файлі");
}
// Експорт агента
exports.DomshopAgent = new agent_runtime_1.Agent({
    id: "domshop-agent",
    name: "Domshop Асистент",
    description: "Відповідає на питання клієнтів про товари та замовлення.",
    model: new model_runtime_1.OpenAIModel({
        apiKey, // тепер гарантовано string
        model: "gpt-4",
    }),
    prompt: `
  Ти — асистент інтернет-магазину Domshop.
  Відповідай коротко, дружньо і зрозуміло.
  Якщо клієнт вітається — скажи "Привіт 👋 Як можу допомогти?".
  Якщо питає про товари чи замовлення — перевір дані у JSON і дай зрозумілу відповідь.
`,
    tools,
});
