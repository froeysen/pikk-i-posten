const cart = [];

// ✨ Glitter particle system
function initGlitter() {
  const canvas = document.getElementById('glitter-canvas');
  const ctx = canvas.getContext('2d');
  const particles = [];
  const colors = ['#ff006e', '#ffbe0b', '#8338ec', '#06d6a0', '#fb5607', '#fff', '#ff85a1'];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: Math.random() * 0.25 + 0.05,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.008,
      twinkleOffset: Math.random() * Math.PI * 2,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const time = Date.now() * 0.001;

    for (const p of particles) {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.y > canvas.height + 10) { p.y = -10; p.x = Math.random() * canvas.width; }
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;

      const twinkle = Math.sin(time * p.twinkleSpeed * 60 + p.twinkleOffset) * 0.5 + 0.5;
      ctx.globalAlpha = p.opacity * twinkle;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(time * 0.5 + p.twinkleOffset);
      const s = p.size * (0.8 + twinkle * 0.4);

      // 4-point star
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * s * 2, Math.sin(angle) * s * 2);
      }
      ctx.strokeStyle = p.color;
      ctx.lineWidth = s * 0.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(animate);
  }
  animate();
}

// Sparkle burst on click
function burstSparkles(x, y) {
  const emojis = ['✨', '⭐', '💖', '🌟', '💫', '🎉', '🍬'];
  for (let i = 0; i < 8; i++) {
    const span = document.createElement('span');
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    span.style.cssText = `
      position: fixed; left: ${x}px; top: ${y}px; pointer-events: none; z-index: 9999;
      font-size: ${14 + Math.random() * 14}px;
      transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      opacity: 1;
    `;
    document.body.appendChild(span);
    requestAnimationFrame(() => {
      span.style.transform = `translate(${(Math.random() - 0.5) * 120}px, ${-60 - Math.random() * 80}px) rotate(${Math.random() * 360}deg)`;
      span.style.opacity = '0';
    });
    setTimeout(() => span.remove(), 900);
  }
}

async function loadProducts() {
  const res = await fetch('products.json');
  return res.json();
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = products.map(p => {
    const iconsHtml = p.icons.map((icon, i) => {
      const positions = [
        'top: 20%; left: 25%',
        'top: 15%; right: 20%',
        'bottom: 25%; left: 18%',
        'bottom: 20%; right: 22%',
        'top: 50%; left: 50%; transform: translate(-50%, -50%)',
      ];
      const sizes = ['2.2rem', '1.8rem', '1.6rem', '2rem', '1.5rem'];
      const delays = [0, 0.3, 0.6, 0.9, 1.2];
      return `<span class="product-visual-icon" style="
        position: absolute; ${positions[i % positions.length]};
        font-size: ${sizes[i % sizes.length]};
        animation-delay: ${delays[i]}s;
      ">${icon}</span>`;
    }).join('');

    return `
      <div class="product-card">
        <div class="product-visual" style="background: linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})">
          <span class="product-visual-main">${p.emoji}</span>
          ${iconsHtml}
          <span class="product-tag">${p.tag}</span>
        </div>
        <div class="product-info">
          <h2>${p.emoji} ${p.name}</h2>
          <p class="description">${p.description}</p>
          <div class="product-meta">
            <span class="price">${p.price} kr</span>
          </div>
          <button class="add-to-cart" data-id="${p.id}">
            🛒 Legg i handlekurv
          </button>
        </div>
      </div>`;
  }).join('');
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    if (existing.qty >= product.stock) return;
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCart();
}

function removeFromCart(productId) {
  const idx = cart.findIndex(item => item.id === productId);
  if (idx === -1) return;
  if (cart[idx].qty > 1) {
    cart[idx].qty--;
  } else {
    cart.splice(idx, 1);
  }
  updateCart();
}

function updateCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cart-count').textContent = totalItems || '';

  const itemsContainer = document.getElementById('cart-items');

  if (cart.length === 0) {
    itemsContainer.innerHTML = '<p class="cart-empty">🍆 Ingen pikker i kurven enda...</p>';
  } else {
    itemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-emoji" style="background: linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})">${item.emoji}</div>
        <div class="cart-item-info">
          <h3>${item.emoji} ${item.name}</h3>
          <span class="cart-item-price">${item.price} kr</span>
        </div>
        <div class="cart-item-controls">
          <button data-id="${item.id}" class="cart-minus">&minus;</button>
          <span>${item.qty}</span>
          <button data-id="${item.id}" class="cart-plus">&plus;</button>
        </div>
      </div>`).join('');
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById('cart-total').textContent = `${total} kr`;

  const footer = document.getElementById('cart-footer');
  footer.style.display = cart.length ? '' : 'none';
}

function toggleCart(open) {
  document.getElementById('cart-overlay').classList.toggle('open', open);
  document.getElementById('cart-panel').classList.toggle('open', open);
}

async function init() {
  initGlitter();

  const products = await loadProducts();
  renderProducts(products);

  document.getElementById('product-grid').addEventListener('click', e => {
    const btn = e.target.closest('.add-to-cart');
    if (!btn || btn.disabled) return;
    const product = products.find(p => p.id === Number(btn.dataset.id));
    if (product) {
      addToCart(product);
      const rect = btn.getBoundingClientRect();
      burstSparkles(rect.left + rect.width / 2, rect.top);
    }
  });

  document.getElementById('cart-items').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.classList.contains('cart-minus')) removeFromCart(id);
    if (btn.classList.contains('cart-plus')) {
      const product = products.find(p => p.id === id);
      if (product) addToCart(product);
    }
  });

  document.getElementById('open-cart').addEventListener('click', () => toggleCart(true));
  document.getElementById('cart-overlay').addEventListener('click', () => toggleCart(false));
  document.getElementById('cart-close').addEventListener('click', () => toggleCart(false));

  updateCart();
}

init();
