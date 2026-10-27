
import { DomshopAgent } from "./domshopAgent";

async function runDemo() {
  // Приклад питання від клієнта
  const question1 = "Чи є email test@example.com у списку підписників?";
  const answer1 = await DomshopAgent.chat(question1);
  console.log("Відповідь агента:", answer1);

  const question2 = "Що містить замовлення #20261009?";
  const answer2 = await DomshopAgent.chat(question2);
  console.log("Відповідь агента:", answer2);
}

runDemo();
