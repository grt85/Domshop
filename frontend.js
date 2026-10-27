import { showBotMessage } from "./chatUtils.js";
import { sendMessage } from "./chatUtils.js";
import { showMenu } from "./chatActions.js";

const translations = {
  uk: {
    welcome: "👋 Вітаю! Я ваш онлайн‑помічник.",
    help: "🤖 Можу допомогти з перевіркою email, замовленням чи інформацією про доставку.",
    choose: "🤖 Оберіть дію нижче або напишіть своє питання.",
    emailPrompt: "✉️ Введіть email",
    orderPrompt: "🛒 Введіть номер замовлення",
    menu: [
      { label: "✅ Перевірити email", action: "checkEmail" },
      { label: "📦 Замовлення", action: "checkOrder" },
      { label: "📞 Контакти", action: "contact" },
      { label: "🚚 Доставка", action: "delivery" },
      { label: "💳 Оплата", action: "payment" },
      { label: "🎁 Знижки", action: "discount" }
    ]
  },
  ru: {
    welcome: "👋 Привет! Я ваш онлайн‑помощник.",
    help: "🤖 Могу помочь с проверкой email, заказом или информацией о доставке.",
    choose: "🤖 Выберите действие ниже или напишите свой вопрос.",
    emailPrompt: "✉️ Введите email",
    orderPrompt: "🛒 Введите номер заказа",
    menu: [
      { label: "✅ Проверить email", action: "checkEmail" },
      { label: "📦 Заказ", action: "checkOrder" },
      { label: "📞 Контакты", action: "contact" },
      { label: "🚚 Доставка", action: "delivery" },
      { label: "💳 Оплата", action: "payment" },
      { label: "🎁 Скидки", action: "discount" }
    ]
  },
  en: {
    welcome: "👋 Hello! I am your assistant.",
    help: "🤖 I can help with email check, order, or delivery info.",
    choose: "🤖 Choose an action below or type your question.",
    emailPrompt: "✉️ Enter email",
    orderPrompt: "🛒 Enter order number",
    menu: [
      { label: "✅ Check email", action: "checkEmail" },
      { label: "📦 Order", action: "checkOrder" },
      { label: "📞 Contacts", action: "contact" },
      { label: "🚚 Delivery", action: "delivery" },
      { label: "💳 Payment", action: "payment" },
      { label: "🎁 Discounts", action: "discount" }
    ]
  }
};

let currentLang = localStorage.getItem("lang") || "uk";

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  updateTexts();
}

function updateTexts() {
  const t = translations[currentLang];
  const messages = document.getElementById("chat-messages");
  messages.innerHTML = ""; // очистити
  showBotMessage(t.welcome, messages, 300);
  showBotMessage(t.help, messages, 800);
  showBotMessage(t.choose, messages, 1200);

  setTimeout(() => {
    showMenu(t.menu);
  }, 1500);
}
window.setLanguage = setLanguage;

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("chat-toggle");
  const chatWidget = document.getElementById("chat-widget");
  const chatOverlay = document.getElementById("chat-overlay");
  const closeBtn = document.getElementById("chat-close");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send");

  toggleBtn.addEventListener("click", () => {
    chatWidget.classList.toggle("active");
    chatOverlay.classList.toggle("hidden");

    if (chatWidget.classList.contains("active")) {
      chatWidget.classList.remove("hidden");
      toggleBtn.textContent = "✖";
      updateTexts();
    } else {
      chatWidget.classList.add("hidden");
      toggleBtn.textContent = "💬";
    }
  });

  closeBtn.addEventListener("click", () => {
    chatWidget.classList.remove("active");
    chatWidget.classList.add("hidden");
    chatOverlay.classList.add("hidden");
    toggleBtn.textContent = "💬";
  });

  chatOverlay.addEventListener("click", () => {
    chatWidget.classList.remove("active");
    chatWidget.classList.add("hidden");
    chatOverlay.classList.add("hidden");
    toggleBtn.textContent = "💬";
  });

  const sendHandler = () => {
    const text = input.value.trim();
    if (text) {
      sendMessage(text);
      input.value = "";
    }
  };

  sendBtn.addEventListener("click", sendHandler);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendHandler();
    }
  });

  // Додати перемикач мов у DOM
  const langSwitch = document.createElement("div");
  langSwitch.id = "lang-switch";
  langSwitch.className = "flex gap-2 p-2";
  langSwitch.innerHTML = `
    <button onclick="setLanguage('uk')">🇺🇦</button>
    <button onclick="setLanguage('ru')">🇷🇺</button>
    <button onclick="setLanguage('en')">🇬🇧</button>
  `;
  document.getElementById("chat-header").appendChild(langSwitch);
});
