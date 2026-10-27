require("dotenv").config();

const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");
const nodemailer = require("nodemailer");
const chalk = require("chalk");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

// Кореневий маршрут "/" → index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://domshop.onrender.com"
  ],
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));


app.use(express.json());

// === Шляхи до файлів ===
const subscribersFile = path.join(__dirname, "subscribers.json");
const ordersFile = path.join(__dirname, "orders.json");
const chatFile = path.join(__dirname, "chat.json");
// SMTP‑транспорт
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// вспомогательная функция
async function readJSON(file) {
  try {
    const data = await fs.readFile(file, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// логирование подписчиков
function logSubscriber(sub) {
  console.log(chalk.green.bold("\n=== Новый подписчик ==="));
  console.log(chalk.yellow(`Email: ${sub.email}`));
  console.log(chalk.blue(`Дата: ${new Date(sub.date).toLocaleString("uk-UA")}`));
  console.log(chalk.gray(`IP: ${sub.ip}`));
  console.log(chalk.magenta(`UA: ${sub.userAgent}`));
  console.log(chalk.gray("\nПолный JSON объекта:"));
  console.log(chalk.white(JSON.stringify(sub, null, 2)));
}

// логирование заказов
function logOrder(order) {
  console.log(chalk.green.bold("\n=== Новый заказ ==="));
  console.log(chalk.yellow(`ID: ${order.id}`));
  console.log(chalk.cyan(`Клиент: ${order.name} ${order.surname}`));
  console.log(chalk.magenta(`Телефон: ${order.phone}`));
  console.log(chalk.blue(`Дата: ${new Date(order.date).toLocaleString("uk-UA")}`));
  console.log(chalk.gray(`Доставка: ${order.delivery}`));

  if (order.city) console.log(chalk.cyan(`Город: ${order.city}`));
  if (order.branch) console.log(chalk.cyan(`Отделение: ${order.branch}`));

  console.log(chalk.white(`Товары: ${order.cart.map(i => `${i.name} × ${i.qty}`).join(", ")}`));

  const total = order.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  console.log(chalk.greenBright(`Итого: ${total} ₴`));

  console.log(chalk.gray("\nПолный JSON объекта:"));
  console.log(chalk.white(JSON.stringify(order, null, 2)));
}

// POST: добавить подписчика
app.post("/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Некорректный email" });
  }

  const subscribers = await readJSON(filePath);
  if (subscribers.some(sub => sub.email === email)) {
    return res.status(400).json({ success: false, message: "Email уже подписан" });
  }

  const newSubscriber = { 
    email, 
    date: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  };
  subscribers.push(newSubscriber);

  try {
    await fs.writeFile(filePath, JSON.stringify(subscribers, null, 2));
    logSubscriber(newSubscriber);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Добро пожаловать!",
      text: "Спасибо за подписку! Теперь вы будете получать наши лучшие предложения."
    });

    res.json({ success: true });
  } catch (err) {
    console.error(chalk.red("Ошибка при добавлении подписчика:"), err);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

// GET: список подписчиков
app.get("/subscribers", async (req, res) => {
  res.json(await readJSON(filePath));
});

// DELETE: удалить подписчика
app.delete("/subscribers/:email", async (req, res) => {
  const email = req.params.email;
  const subscribers = await readJSON(filePath);
  const filtered = subscribers.filter(sub => sub.email !== email);

  if (filtered.length === subscribers.length) {
    return res.status(404).json({ success: false, message: "Email не найден" });
  }

  try {
    await fs.writeFile(filePath, JSON.stringify(filtered, null, 2));
    console.log(chalk.red.bold(`Удалён подписчик: ${email}`));
    res.json({ success: true });
  } catch (err) {
    console.error(chalk.red("Ошибка при удалении подписчика:"), err);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});




  async function sendOrderNotifications(order) {
  const total = order.cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Сообщение для клиента
  const clientMessage = `Ваш заказ #${order.id} принят. Сумма: ${total} ₴. Мы скоро свяжемся!`;

  // Сообщение для тебя
  const adminMessage = `Новый заказ #${order.id}: ${order.name} ${order.surname}, тел. ${order.phone}, сумма ${total}₴`;

  try {
    // Отправка клиенту
    await axios.post("https://api.turbosms.ua/message/send.json", {
      auth: {
        login: process.env.TURBO_LOGIN,
        password: process.env.TURBO_PASSWORD
      },
      sender: "DomShop", // имя отправителя регистрируется в TurboSMS
      text: clientMessage,
      recipients: [order.phone],
      sms: true,   // можно включить SMS
      viber: true  // и Viber одновременно
    });

    // Отправка админу
    await axios.post("https://api.turbosms.ua/message/send.json", {
      auth: {
        login: process.env.TURBO_LOGIN,
        password: process.env.TURBO_PASSWORD
      },
      sender: "DomShop",
      text: adminMessage,
      recipients: [process.env.MY_PHONE],
      sms: true,
      viber: true
    });

    console.log(chalk.green("📲 Уведомления отправлены клиенту и админу"));
  } catch (err) {
    console.error(chalk.red("Ошибка отправки уведомлений:"), err.response?.data || err.message);
  }
}

// POST: оформить заказ
app.post("/order", async (req, res) => {
  const { name, surname, phone, delivery, city, branch, cart } = req.body;
  if (!name || !surname || !phone || !delivery || !cart || cart.length === 0) {
    return res.status(400).json({ success: false, message: "Некорректные данные заказа" });
  }

  const orders = await readJSON(ordersFile);
  const newOrder = {
    id: Date.now(),
    name,
    surname,
    phone,
    delivery,
    city: delivery === "nova" ? city : null,
    branch: delivery === "nova" ? branch : null,
    cart,
    date: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  };

  orders.push(newOrder);

  try {
    await fs.writeFile(ordersFile, JSON.stringify(orders, null, 2));
    logOrder(newOrder);

    // Отправка уведомлений через TurboSMS
    await sendOrderNotifications(newOrder);

    res.json({ success: true });
  } catch (err) {
    console.error(chalk.red("Ошибка при сохранении заказа:"), err);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});



// OpenAI‑агент
/*app.post("/agent", async (req, res) => {
  try {
    const { question } = req.body;
    const answer = await DomshopAgent.chat(question);
    res.json({ success: true, answer });
  } catch (err) {
    console.error("❌ Помилка OpenAI‑агента:", err);
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
});

// Fallback‑агент
app.post("/fallback-agent", async (req, res) => {
  try {
    const { question } = req.body;
    const answer = await DomshopAgentFallback.chat(question);

    // ✅ ВАЖЛИВО: повертаємо саме { answer: {...} }
    res.json({ answer });
  } catch (err) {
    console.error("❌ Помилка fallback‑агента:", err);
    res.status(500).json({ answer: { text: "⚠️ Помилка сервера" } });
  }
});*/



// === Fallback‑агент ===
app.post("/fallback-agent", async (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== "string") {
    return res.json({ answer: { text: "⚠️ Порожній запит. Спробуйте ще раз." } });
  }

  const q = question.toLowerCase().trim();

  // Email
  if (/email/i.test(q)) {
    const email = question.split(" ").pop() || "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({ answer: { text: "❌ Некоректний email. Спробуйте ще раз." } });
    }
    const subs = await readJSON(subscribersFile);
    const found = subs.find(s => s.email === email);
    return res.json({
      answer: {
        text: found
          ? `✅ Email ${email} підписаний з ${new Date(found.date).toLocaleString("uk-UA")}.`
          : `ℹ️ Email ${email} ще не підписаний.`
      }
    });
  }

  // Замовлення
  if (/order|замовлення/i.test(q)) {
    const id = parseInt(question.replace(/\D/g, ""), 10);
    if (isNaN(id)) {
      return res.json({ answer: { text: "❌ Номер замовлення має бути числом." } });
    }
    const orders = await readJSON(ordersFile);
    const order = orders.find(o => o.id === id);
    if (!order) {
      return res.json({ answer: { text: `❌ Замовлення #${id} не знайдено.` } });
    }

    const items = order.cart.map(i => `${i.name} × ${i.qty}`).join(", ");
    const total = order.cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    return res.json({
      answer: {
        text: `📦 Замовлення #${order.id}\n` +
              `👤 Клієнт: ${order.name} ${order.surname}\n` +
              `📞 Телефон: ${order.phone}\n` +
              `🛒 Товари: ${items}\n` +
              `💰 Сума: ${total} ₴\n` +
              `📅 Дата: ${new Date(order.date).toLocaleString("uk-UA")}\n` +
              `🚚 Доставка: ${order.delivery}` +
              (order.city ? `, ${order.city}` : "") +
              (order.branch ? `, ${order.branch}` : "")
      }
    });
  }

  // FAQ
  const faqResponses = {
    delivery: "🚚 Ми доставляємо через Нову Пошту та кур'єром.",
    payment: "💳 Оплата можлива карткою онлайн або при отриманні.",
    discount: "🎁 У нас діють промокоди та акції. Слідкуйте за розділом 'Sale'.",
    contact: "📞 Контакти підтримки:\nТелефон: +380 50 123 45 67\nEmail: support@domshop.com"
  };
  if (faqResponses[q]) {
    return res.json({ answer: { text: faqResponses[q] } });
  }

  // Привітання
  if (/^(privet|прив(іт)?)$/i.test(q)) {
    return res.json({
      answer: {
        text: "Привіт 👋 Радий вас бачити! Оберіть дію:",
        buttons: [
          { label: "✅ Перевірити email", action: "checkEmail" },
          { label: "📦 Замовлення", action: "checkOrder" },
          { label: "📞 Контакти", action: "contact" },
          { label: "🚚 Доставка", action: "delivery" },
          { label: "💳 Оплата", action: "payment" },
          { label: "🎁 Знижки", action: "discount" }
        ]
      }
    });
  }

  // За замовчуванням
  res.json({
    answer: {
      text: "ℹ️ Я можу перевірити email або замовлення. Спробуйте: 'Перевірити email test@example.com' або 'Замовлення #123'."
    }
  });
});



app.listen(PORT, () => {
  console.log(chalk.green.bold(`🚀 Сервер запущен на http://localhost:${PORT}`));
});
