"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomshopAgentFallback = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
// Шляхи до JSON
const subscribersFile = path_1.default.resolve(__dirname, "subscribers.json");
const ordersFile = path_1.default.resolve(__dirname, "orders.json");
const chatFile = path_1.default.resolve(__dirname, "chat.json");
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
// Логування історії
async function logChat(role, text, buttons) {
    try {
        let history = [];
        try {
            history = await readJSON(chatFile);
        }
        catch (err) {
            if (err.code === "ENOENT") {
                history = [];
                await promises_1.default.mkdir(path_1.default.dirname(chatFile), { recursive: true });
            }
            else {
                throw err;
            }
        }
        const entry = {
            role,
            text,
            date: new Date().toISOString(),
            ...(buttons ? { buttons } : {})
        };
        history.push(entry);
        await promises_1.default.writeFile(chatFile, JSON.stringify(history, null, 2));
    }
    catch (err) {
        console.error("❌ Помилка запису історії:", err);
    }
}
// Інструменти
const tools = {
    async checkSubscriber(email) {
        const subs = await readJSON(subscribersFile);
        return subs.some((s) => s.email === email)
            ? `✅ Email ${email} вже є у списку підписників.`
            : `ℹ️ Email ${email} ще не підписаний.`;
    },
    async checkOrder(orderId) {
        const orders = await readJSON(ordersFile);
        const order = orders.find(o => o.id === orderId);
        if (!order)
            return `❌ Замовлення #${orderId} не знайдено.`;
        const items = order.cart.map(i => `${i.name} × ${i.qty}`).join(", ");
        const total = order.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
        return `📦 Замовлення #${orderId}:
👤 ${order.name} ${order.surname}
🛒 Товари: ${items}
💰 Сума: ${total} ₴
📅 Дата: ${new Date(order.date).toLocaleString("uk-UA")}
🚚 Доставка: ${order.delivery}`;
    }
};
// FAQ
const faqResponses = {
    delivery: "🚚 Ми доставляємо через Нову Пошту та кур'єром.",
    доставка: "🚚 Ми доставляємо через Нову Пошту та кур'єром.",
    payment: "💳 Оплата можлива карткою онлайн або при отриманні.",
    оплата: "💳 Оплата можлива карткою онлайн або при отриманні.",
    discount: "🎁 У нас діють промокоди та акції. Слідкуйте за розділом 'Sale'.",
    знижка: "🎁 У нас діють промокоди та акції. Слідкуйте за розділом 'Sale'.",
    contacts: "📞 Контакти підтримки:\nТелефон: +380 50 123 45 67\nEmail: support@domshop.com",
    контакт: "📞 Контакти підтримки:\nТелефон: +380 50 123 45 67\nEmail: support@domshop.com",
    support: "📞 Контакти підтримки:\nТелефон: +380 50 123 45 67\nEmail: support@domshop.com",
    help: "📞 Контакти підтримки:\nТелефон: +380 50 123 45 67\nEmail: support@domshop.com"
};
// Меню
const menuButtons = [
    { label: "✅ Перевірити email", action: "checkEmail" },
    { label: "📦 Замовлення", action: "checkOrder" },
    { label: "📞 Контакти", action: "contacts" },
    { label: "🚚 Доставка", action: "delivery" },
    { label: "💳 Оплата", action: "payment" },
    { label: "🎁 Знижки", action: "discounts" }
];
// Агент
exports.DomshopAgentFallback = {
    async chat(question) {
        if (!question || typeof question !== "string") {
            return { text: "⚠️ Порожній запит. Спробуйте ще раз." };
        }
        const q = question.toLowerCase().trim();
        await logChat("user", question);
        // Email
        if (/email/i.test(q)) {
            if (q === "checkemail") {
                return { text: "ℹ️ Введіть email для перевірки, наприклад: 'Перевірити email test@example.com'" };
            }
            const email = question.split(" ").pop() || "";
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return { text: "❌ Некоректний email. Спробуйте ще раз." };
            }
            const answerText = await tools.checkSubscriber(email);
            await logChat("bot", answerText);
            return { text: answerText };
        }
        // Замовлення
        if (/order|замовлення/i.test(q)) {
            if (q === "checkorder") {
                return { text: "ℹ️ Введіть номер замовлення, наприклад: 'Замовлення #123'" };
            }
            const id = parseInt(question.replace(/\D/g, ""), 10);
            if (isNaN(id)) {
                return { text: "❌ Номер замовлення має бути числом." };
            }
            const answerText = await tools.checkOrder(id);
            await logChat("bot", answerText);
            return { text: answerText };
        }
        // FAQ
        for (const key in faqResponses) {
            if (q.includes(key)) {
                const answerText = faqResponses[key];
                await logChat("bot", answerText);
                return { text: answerText };
            }
        }
        // Привітання
        if (/^(privet|прив(іт)?)$/i.test(q)) {
            const answer = { text: "Привіт 👋 Радий вас бачити! Оберіть дію:", buttons: menuButtons };
            await logChat("bot", answer.text);
            await logChat("menu", "Головне меню", menuButtons);
            return answer;
        }
        // За замовчуванням
        const defaultAnswer = {
            text: "ℹ️ Я можу перевірити email або замовлення. Спробуйте: 'Перевірити email test@example.com' або 'Замовлення #123'.",
            buttons: menuButtons
        };
        await logChat("bot", defaultAnswer.text);
        await logChat("menu", "Головне меню", menuButtons);
        return defaultAnswer;
    }
};
