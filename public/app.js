const speakBtn = document.getElementById('speak-btn');
const voiceStatus = document.getElementById('voice-status');
const fallback = document.getElementById('fallback');
const queryInput = document.getElementById('query-input');
const searchBtn = document.getElementById('search-btn');
const resultsCard = document.getElementById('results-card');
const results = document.getElementById('results');
const resultsEmpty = document.getElementById('results-empty');
const orderCard = document.getElementById('order-card');
const cartItems = document.getElementById('cart-items');
const cartEmpty = document.getElementById('cart-empty');
const cartTotal = document.getElementById('cart-total');
const placeOrderBtn = document.getElementById('place-order');
const confirmation = document.getElementById('confirmation');
const confirmationText = document.getElementById('confirmation-text');

const cart = new Map();

function showFallback() {
  fallback.hidden = false;
  speakBtn.hidden = true;
}

function hideFallback() {
  fallback.hidden = true;
  speakBtn.hidden = false;
}

function setVoiceStatus(text) {
  voiceStatus.textContent = text;
}

function initVoice() {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) {
    showFallback();
    setVoiceStatus('Voice not supported here — please type your item.');
    return;
  }
  const recognition = new Ctor();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = 0; i < event.results.length; i += 1) {
      transcript += event.results[i][0].transcript;
    }
    if (transcript) {
      queryInput.value = transcript;
      runSearch();
    }
  };
  recognition.onerror = () => {
    showFallback();
    setVoiceStatus('Voice not available — please type your item.');
  };
  recognition.onend = () => {
    setVoiceStatus('Voice listening… press Speak when ready');
  };
  speakBtn.hidden = false;
  speakBtn.addEventListener('click', () => {
    recognition.start();
    setVoiceStatus('Listening… speak now');
  });
}

async function runSearch() {
  const q = queryInput.value.trim();
  resultsCard.hidden = false;
  if (!q) {
    results.innerHTML = '';
    resultsEmpty.textContent = 'Type or say something to search.';
    return;
  }
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const body = await res.json();
  results.innerHTML = '';
  if (!body.results || body.results.length === 0) {
    resultsEmpty.textContent = `No matches for "${q}".`;
    return;
  }
  resultsEmpty.textContent = '';
  for (const product of body.results) {
    const li = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = product.name;
    const meta = document.createElement('span');
    meta.className = 'meta';
    meta.textContent = `${product.category} · $${product.price.toFixed(2)}`;
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = 'Add';
    addBtn.addEventListener('click', () => addToCart(product));
    li.append(name, meta, addBtn);
    results.appendChild(li);
  }
}

function addToCart(product) {
  const existing = cart.get(product.sku);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.set(product.sku, { name: product.name, price: product.price, qty: 1 });
  }
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = '';
  if (cart.size === 0) {
    orderCard.hidden = true;
    cartEmpty.textContent = 'Your order is empty.';
    cartTotal.textContent = '';
    return;
  }
  orderCard.hidden = false;
  for (const [sku, item] of cart) {
    const li = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = `${item.name} × ${item.qty}`;
    const price = document.createElement('span');
    price.textContent = `$${(item.price * item.qty).toFixed(2)}`;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      if (item.qty <= 1) cart.delete(sku);
      else item.qty -= 1;
      renderCart();
    });
    li.append(name, price, removeBtn);
    cartItems.appendChild(li);
  }
  let total = 0;
  for (const item of cart.values()) total += item.price * item.qty;
  cartTotal.textContent = `Total: $${total.toFixed(2)}`;
}

async function placeOrder() {
  const skus = Array.from(cart.keys());
  if (skus.length === 0) return;
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skus }),
  });
  const body = await res.json();
  if (!res.ok) {
    confirmationText.textContent = body.error && body.error.message ? body.error.message : 'Could not place order.';
    confirmation.hidden = false;
    return;
  }
  confirmationText.textContent = `Order ${body.orderId} confirmed. Scheduled for ${body.delivery.deliveryDate}.`;
  confirmation.hidden = false;
  cart.clear();
  renderCart();
}

searchBtn.addEventListener('click', () => {
  runSearch();
});

placeOrderBtn.addEventListener('click', () => {
  placeOrder();
});

queryInput.addEventListener('input', () => {
  // debounce-free: search on submit only
});

initVoice();
