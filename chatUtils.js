export function showUserMessage(text, messages) {
  messages.insertAdjacentHTML("beforeend", `<div class="message user-message">👤 ${text}</div>`);
}

export function showBotMessage(text, messages, delay = 600) {
  // додаємо індикатор
  const id = "typing-" + Date.now();
  messages.insertAdjacentHTML(
    "beforeend",
    `<div id="${id}" class="typing-indicator">
       <span></span><span></span><span></span>
     </div>`
  );
  messages.scrollTop = messages.scrollHeight;

  // через delay прибираємо індикатор і показуємо текст
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.remove();
    messages.insertAdjacentHTML(
      "beforeend",
      `<div class="message bot-message">🤖 ${text}</div>`
    );
    messages.scrollTop = messages.scrollHeight;
  }, delay);
}


export async function sendMessage(text) {
  if (!text || typeof text !== "string" || !text.trim()) return;
  const messages = document.getElementById("chat-messages");
  showUserMessage(text, messages);

  try {
    const res = await fetch("http://localhost:3000/fallback-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: text })
    });
    const data = await res.json();
    handleResponse(data, messages);
   

    messages.scrollTop = messages.scrollHeight;
  } catch {
    showBotMessage("⚠️ Помилка з'єднання", messages);
  }
}

export function handleResponse(data, messages) {
  const answer = data.answer;
  if (!answer) {
    showBotMessage("⚠️ Порожня відповідь від сервера", messages);
    return;
  }
  if (answer.text) showBotMessage(answer.text, messages);
  if (Array.isArray(answer.buttons)) {
    import("./chatActions.js").then(module => {
      module.showMenu(answer.buttons);
    });
  }
}
