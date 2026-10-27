import { Agent } from "./packages/agent-runtime";
import { OpenAIModel } from "./packages/model-runtime";

import fs from "fs/promises";
import path from "path";

// Шляхи до JSON
const subscribersFile = path.resolve(__dirname, "subscribers.json");
const ordersFile = path.resolve(__dirname, "orders.json");

// Допоміжна функція
async function readJSON(file: string) {
  try {
    const data = await fs.readFile(file, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Інструменти
const tools = {
  async checkSubscriber(email: string) {
    const subs = await readJSON(subscribersFile);
    return subs.some((s: any) => s.email === email)
      ? `Email ${email} вже є у списку підписників.`
      : `Email ${email} ще не підписаний.`;
  },

  async checkOrder(orderId: number) {
    const orders = await readJSON(ordersFile);
    const order = orders.find((o: any) => o.id === orderId);
    if (!order) return `Замовлення #${orderId} не знайдено.`;

    const items = order.cart.map((i: any) => `${i.name} × ${i.qty}`).join(", ");
    return `Замовлення #${orderId}: ${order.name} ${order.surname}, товари: ${items}`;
  },
};

// ✅ Перевірка ключа
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("❌ OPENAI_API_KEY не встановлений у .env файлі");
}

// Експорт агента
export const DomshopAgent = new Agent({
  id: "domshop-agent",
  name: "Domshop Асистент",
  description: "Відповідає на питання клієнтів про товари та замовлення.",
  model: new OpenAIModel({
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
