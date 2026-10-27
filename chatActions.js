import { sendMessage } from "./chatUtils.js";

export function showMenu(buttons) {
  const menu = document.getElementById("chat-menu");
  menu.innerHTML = "";
  buttons.forEach(b => {
    const btn = document.createElement("button");
    btn.className = "m-1 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300";
    btn.textContent = b.label;
    btn.addEventListener("click", () => handleAction(b.action));
    menu.appendChild(btn);
  });
}

export function handleAction(action) {
  const messages = document.getElementById("chat-messages");

  if (action === "checkEmail") {
    const div = document.createElement("div");
    div.className = "mb-2";
    div.innerHTML = `
      ✉️ Введіть email:
      <input id="inline-email" type="email" class="border p-1 rounded" placeholder="example@gmail.com"/>
      <button id="inline-email-btn" class="ml-2 px-2 py-1 bg-blue-500 text-white rounded">OK</button>
    `;
    messages.appendChild(div);

    document.getElementById("inline-email-btn").addEventListener("click", submitInlineEmail);
  } else if (action === "checkOrder") {
    const div = document.createElement("div");
    div.className = "mb-2";
    div.innerHTML = `
      🛒 Введіть номер замовлення:
      <input id="inline-order" type="text" class="border p-1 rounded" placeholder="#123"/>
      <button id="inline-order-btn" class="ml-2 px-2 py-1 bg-blue-500 text-white rounded">OK</button>
    `;
    messages.appendChild(div);

    document.getElementById("inline-order-btn").addEventListener("click", submitInlineOrder);
  } else {
    sendMessage(action);
  }
}

export function submitInlineEmail() {
  const emailInput = document.getElementById("inline-email");
  if (!emailInput) return;
  const email = emailInput.value.trim();
  sendMessage(`Перевірити email ${email}`);
  emailInput.parentElement.remove();
}

export function submitInlineOrder() {
  const orderInput = document.getElementById("inline-order");
  if (!orderInput) return;
  const orderId = orderInput.value.trim();
  sendMessage(`Замовлення #${orderId}`);
  orderInput.parentElement.remove();
}
