document.addEventListener("DOMContentLoaded", () => {
  // === Элементы ===
  const menuBtn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const header = document.querySelector("header");

  const promoBtn = document.getElementById("promoBtn");
  const promoModal = document.getElementById("promoModal");
  const closeModal = document.getElementById("closeModal");
  const promoField = document.getElementById("promoField");

  const catalogBtn = document.getElementById("catalogBtn");
  const catalogModal = document.getElementById("catalogModal");
  const closeCatalog = document.getElementById("closeCatalog");
  const catalogLinks = document.querySelectorAll(".catalog-link");

  const slider = document.querySelector("#reviewsSlider > div");
  const dots = document.querySelectorAll("#sliderDots button");

  // === Бургер-меню ===
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      menuBtn.classList.toggle("open");
      mobileMenu.classList.toggle("active");
    });
    mobileMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("active");
        menuBtn.classList.remove("open");
      });
    });
  }

  // === Кнопка "Наверх" ===
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      scrollTopBtn.classList.toggle("show", window.scrollY > 300);
    });
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      scrollTopBtn.classList.add("bounce");
      setTimeout(() => scrollTopBtn.classList.remove("bounce"), 600);
    });
  }

  // === Плавный скролл к секциям ===
  if (header) {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", e => {
        const targetId = anchor.getAttribute("href");
        if (targetId.length > 1) {
          e.preventDefault();
          const target = document.querySelector(targetId);
          if (target) {
            const offsetPosition = target.offsetTop - header.offsetHeight;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
          }
        }
      });
    });
  }

  // === Промо-модалка ===
  if (promoBtn && promoModal && closeModal && promoField) {
    promoBtn.addEventListener("click", () => {
      promoModal.classList.remove("hidden");
    });

    closeModal.addEventListener("click", () => {
      promoModal.classList.add("hidden");
      promoField.value = "DOM50";
      applyPromo();
    });

    promoModal.addEventListener("click", e => {
      if (e.target === promoModal) {
        promoModal.classList.add("hidden");
        promoField.value = "DOM50";
        applyPromo();
      }
    });
  }

  // === Каталог ===
  if (catalogBtn && catalogModal && closeCatalog) {
    catalogBtn.addEventListener("click", () => {
      catalogModal.classList.remove("hidden");
    });

    closeCatalog.addEventListener("click", () => {
      catalogModal.classList.add("hidden");
    });

    catalogLinks.forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        const targetId = link.getAttribute("href");
        catalogModal.classList.add("hidden");
        const target = document.querySelector(targetId);
        if (target) target.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  // === Слайдер отзывов ===
  if (slider && dots.length) {
    const slides = slider.children;
    let index = 0;
    let interval;

    function showSlide(i) {
      index = i;
      slider.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, dIndex) => {
        dot.classList.toggle("bg-yellow-500", dIndex === index);
        dot.classList.toggle("bg-gray-400", dIndex !== index);
      });
    }

    function startAutoSlide() {
      interval = setInterval(() => {
        showSlide((index + 1) % slides.length);
      }, 4000);
    }

    dots.forEach((dot, dIndex) => {
      dot.addEventListener("click", () => {
        clearInterval(interval);
        showSlide(dIndex);
        startAutoSlide();
      });
    });

    showSlide(0);
    startAutoSlide();
  }
});



// === Таймер акции ===
const countdownEl = document.getElementById('countdown');
const saleBtn = document.getElementById('saleBtn');
if (countdownEl && saleBtn) {
  const deadline = new Date("2026-09-30T23:59:59");
  function updateCountdown() {
    const now = new Date();
    const diff = deadline - now;
    if (diff <= 0) {
      countdownEl.innerText = "Акция завершена!";
      saleBtn.disabled = true;
      saleBtn.classList.add("opacity-50", "cursor-not-allowed");
      saleBtn.innerText = "Акция недоступна";
      saleBtn.onclick = null;
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    countdownEl.innerText = `Осталось ${days} дн. ${hours} ч. ${minutes} мин. ${seconds} сек.`;
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();
}

// === Подписка ===
const form = document.getElementById("subscribeForm");
const emailInput = document.getElementById("emailInput");
const messageEl = document.getElementById("subscribeMessage");
if (form && emailInput && messageEl) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      messageEl.innerText = "Введите корректный email!";
      messageEl.classList.remove("hidden");
      messageEl.classList.add("text-red-600");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        messageEl.innerText = "Спасибо за подписку!";
        messageEl.classList.remove("hidden", "text-red-600");
        messageEl.classList.add("text-green-600");
        emailInput.value = "";
      } else {
        messageEl.innerText = "Ошибка: " + (data.message || "не удалось подписаться");
        messageEl.classList.remove("hidden");
        messageEl.classList.add("text-red-600");
      }
    } catch (err) {
      messageEl.innerText = "Ошибка соединения с сервером";
      messageEl.classList.remove("hidden");
      messageEl.classList.add("text-red-600");
    }
  });
}
// переключатель режима
const persistCart = false; // true = сохраняем в localStorage, false = только в памяти

// загрузка корзины
let cart;
try {
  const saved = persistCart ? JSON.parse(localStorage.getItem("cart")) : null;
  cart = Array.isArray(saved) ? saved : [];
} catch {
  cart = [];
}

const cartModal = document.getElementById("cartModal");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");

// сохранить корзину
function saveCart() {
  if (persistCart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
}

// очистить корзину
function clearCart() {
  cart = [];
  if (persistCart) {
    localStorage.removeItem("cart");
  }
  renderCart();
  closeCart();
}

// открыть/закрыть корзину
function openCart() { cartModal.classList.remove("hidden"); }
function closeCart() { cartModal.classList.add("hidden"); }

// добавить товар
function addToCart(name, price, img) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, img, qty: 1 });
  }
  saveCart();
  renderCart();
  openCart();
}

// отрисовать корзину
function renderCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="text-gray-500 text-center">Корзина пуста</p>`;
    cartTotalEl.innerText = "Итого: 0 ₽";
    return;
  }

  cart.forEach((item, index) => {
    total += item.price * item.qty;
    const row = document.createElement("div");
    row.className = "flex items-center justify-between mb-2 animate-fadeIn";

    row.innerHTML = `
      <img src="${item.img}" alt="${item.name}" class="w-12 h-12 object-cover rounded">
      <div class="flex-1 ml-2">
        <p>${item.name}</p>
        <p>${item.price} ₽</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="changeQty(${index}, -1)" class="px-2 bg-gray-200 rounded">-</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${index}, 1)" class="px-2 bg-gray-200 rounded">+</button>
        <button onclick="removeFromCart(${index})" class="text-red-600">✕</button>
      </div>
    `;
    cartItemsEl.appendChild(row);
  });

  cartTotalEl.innerText = "Итого: " + total + " ₽";
}

// изменить количество
function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
  renderCart();
}

// удалить товар
function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

// навешиваем обработчики на карточки
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".product-card").forEach(card => {
    const btn = card.querySelector("button");
    const inStock = card.dataset.stock !== "false";

    if (!inStock) {
      btn.textContent = "Нет в наличии";
      btn.disabled = true;
      btn.classList.add("bg-gray-400", "cursor-not-allowed");

      const badge = document.createElement("span");
      badge.textContent = "Нет в наличии";
      badge.className = "absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded";
      card.appendChild(badge);
    } else {
      const badge = document.createElement("span");
      badge.textContent = "В наличии";
      badge.className = "absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded";
      card.appendChild(badge);

      btn.addEventListener("click", () => {
        const name = card.querySelector("p.font-medium").innerText;
        const priceEl = card.querySelector(".text-green-600");
        const price = parseInt(priceEl.innerText.replace(/\D/g, ""));
        const img = card.querySelector("img").src;
        addToCart(name, price, img);
      });
    }
  });

  renderCart();
});

// алерт под полем
function showFieldAlert(inputEl, message, type = "error") {
  const oldAlert = inputEl.parentNode.querySelector(".field-alert");
  if (oldAlert) oldAlert.remove();

  const alert = document.createElement("div");
  alert.className = `field-alert text-sm mt-1 ${type === "error" ? "text-red-600" : "text-green-600"}`;
  alert.textContent = message;

  inputEl.insertAdjacentElement("afterend", alert);

  setTimeout(() => alert.remove(), 5000);
}

// общий алерт
function showAlert(message, type = "success") {
  const container = document.getElementById("alertContainer");
  if (!container) return;

  const alert = document.createElement("div");
  alert.className = `alert ${type} animate-fadeIn`;
  alert.textContent = message;

  container.appendChild(alert);

  setTimeout(() => {
    alert.classList.remove("animate-fadeIn");
    alert.classList.add("animate-fadeOut");
    setTimeout(() => alert.remove(), 800);
  }, 6000);
}

// обработчик формы
document.getElementById("checkoutForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector("button[type=submit]");
  submitBtn.disabled = true;

  // имя
  if (!form.name.value.trim()) {
    showFieldAlert(form.name, "Введите имя", "error");
    submitBtn.disabled = false;
    return;
  }

  // телефон
  function validatePhone(phone) {
    const digits = phone.replace(/\D/g, "");
    return /^380\d{9}$/.test(digits);
  }
  if (!validatePhone(form.phone.value)) {
    showFieldAlert(form.phone, "Телефон должен быть в формате +380 ХХ ХХХ-ХХ-ХХ", "error");
    form.phone.focus();
    submitBtn.disabled = false;
    return;
  }

  // корзина
  if (!cart || cart.length === 0) {
    showAlert("Корзина пуста, добавьте товары", "error");
    submitBtn.disabled = false;
    return;
  }

  // объект заказа
  const orderData = {
    name: form.name.value.trim(),
    surname: form.surname.value.trim(),
    phone: form.phone.value.trim(),
    delivery: form.delivery.value,
    cart
  };

  switch (orderData.delivery) {
    case "nova":
      orderData.city = form.city.value.trim();
      orderData.branch = form.branch.value.trim();
      break;
    case "courier":
      orderData.address = form.address ? form.address.value.trim() : null;
      break;
    case "pickup":
      orderData.pickupNote = "Самовывоз";
      break;
  }

  try {
    const response = await fetch("http://localhost:3000/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });
    const result = await response.json();

    if (result.success) {
      showAlert("Заказ успешно оформлен!", "success");
      clearCart();
      form.reset();
    } else {
      showAlert("Ошибка: " + result.message, "error");
    }
  } catch (err) {
    showAlert("Ошибка соединения с сервером", "error");
    console.error(err);
  } finally {
    submitBtn.disabled = false;
  }
});

// переключение доп. полей доставки
const deliverySelect = document.getElementById("deliveryMethod");
const novaFields = document.getElementById("novaFields");

deliverySelect.addEventListener("change", () => {
  switch (deliverySelect.value) {
    case "nova":
      novaFields.classList.remove("hidden");
      break;
    default:
      novaFields.classList.add("hidden");
  }
});


// Маска для телефона
document.addEventListener("DOMContentLoaded", () => {
  const phoneInput = document.querySelector("#checkoutForm input[name='phone']");
  if (phoneInput) {
    Inputmask({
      mask: "+380 (99) 999-99-99",
      showMaskOnHover: false,
      clearIncomplete: true
    }).mask(phoneInput);
  }
});
