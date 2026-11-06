/* =============================================
   PhoneHub – App JavaScript
   ============================================= */

'use strict';

/* ---- Cart State ---- */
let cart = JSON.parse(localStorage.getItem('ph_cart') || '[]');

/* ---- Auth State ---- */
let currentUser = JSON.parse(localStorage.getItem('ph_user') || 'null');
let orders = JSON.parse(localStorage.getItem('ph_orders') || '[]');

function isSignedIn() {
  return !!currentUser;
}

function signIn(user) {
  currentUser = user;
  localStorage.setItem('ph_user', JSON.stringify(user));
  updateNavbarAuth();
}

function signOut() {
  currentUser = null;
  localStorage.removeItem('ph_user');
  updateNavbarAuth();
}

function placeOrder() {
  if (cart.length === 0) return null;
  const order = {
    id: 'ORD-' + Date.now(),
    date: new Date().toISOString(),
    items: cart.map(i => ({ ...i })),
    subtotal: cart.reduce((s, i) => s + i.price * i.qty, 0),
    shipping: 5000,
    total: cart.reduce((s, i) => s + i.price * i.qty, 0) + 5000,
    status: 'Delivered'
  };
  orders.push(order);
  localStorage.setItem('ph_orders', JSON.stringify(orders));
  cart = [];
  saveCart();
  return order;
}

function updateNavbarAuth() {
  const signinBtn = document.querySelector('.btn-signin');
  if (!signinBtn) return;
  const navActions = signinBtn.closest('.nav-actions');
  if (!navActions) return;

  if (isSignedIn()) {
    if (document.querySelector('.nav-profile')) return;
    const profile = document.createElement('a');
    profile.href = 'profile.html';
    profile.className = 'btn-signin nav-profile';
    profile.style.textDecoration = 'none';
    profile.innerHTML = '<i class="bi bi-person-circle"></i> Profile';
    const logout = document.createElement('button');
    logout.className = 'btn-icon';
    logout.title = 'Sign Out';
    logout.innerHTML = '<i class="bi bi-box-arrow-right"></i>';
    logout.onclick = (e) => {
      e.preventDefault();
      signOut();
      setTimeout(() => { window.location.href = 'index.html'; }, 600);
    };
    signinBtn.replaceWith(profile);
    navActions.appendChild(logout);
  } else {
    const profile = document.querySelector('.nav-profile');
    const logout = document.querySelector('.nav-actions .btn-icon[title="Sign Out"]');
    if (profile) profile.replaceWith(signinBtn);
    if (logout) logout.remove();
  }
}

/* ---- Cart Page Checkout Guard ---- */
function guardCheckout() {
  const btn = document.querySelector('.btn-checkout');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    if (!isSignedIn()) {
      e.preventDefault();
      showToast('Please sign in to place your order.');
      setTimeout(() => { window.location.href = 'sign in.html'; }, 900);
      return;
    }
    const order = placeOrder();
    if (order) {
      showToast('Order placed successfully!');
      setTimeout(() => { window.location.href = 'profile.html'; }, 1200);
    }
  });
}

function saveCart() {
  localStorage.setItem('ph_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

function addToCart(id, name, price, img) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  saveCart();
  showToast(`${name} added to cart!`);
}

/* ---- Toast Notification ---- */
function showToast(message) {
  const existing = document.querySelector('.ph-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'ph-toast';
  toast.innerHTML = `<i class="bi bi-check-circle-fill"></i> ${message}`;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '28px',
    right: '28px',
    background: '#0f172a',
    color: '#fff',
    padding: '14px 22px',
    borderRadius: '12px',
    fontSize: '.9rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    zIndex: '9999',
    boxShadow: '0 12px 40px rgba(0,0,0,.3)',
    animation: 'slideIn .3s ease',
    fontFamily: 'Inter, sans-serif',
  });

  const styleEl = document.createElement('style');
  styleEl.textContent = `@keyframes slideIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`;
  document.head.appendChild(styleEl);

  document.body.appendChild(toast);
  toast.querySelector('i').style.color = '#4ade80';
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

/* ---- Countdown Timer ---- */
function startCountdown(endDateStr, wrapperSelector) {
  const wrapper = document.querySelector(wrapperSelector);
  if (!wrapper) return;

  function update() {
    const now = new Date();
    const end = new Date(endDateStr);
    const diff = end - now;

    if (diff <= 0) { wrapper.textContent = 'Expired'; return; }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const boxes = wrapper.querySelectorAll('.count-box .num');
    if (boxes.length >= 4) {
      boxes[0].textContent = String(d).padStart(2, '0');
      boxes[1].textContent = String(h).padStart(2, '0');
      boxes[2].textContent = String(m).padStart(2, '0');
      boxes[3].textContent = String(s).padStart(2, '0');
    }
  }

  update();
  setInterval(update, 1000);
}

/* ---- Cart Page Logic ---- */
function renderCart() {
  const container = document.getElementById('cart-items');
  const emptyState = document.getElementById('cart-empty');
  const summarySection = document.getElementById('cart-summary-section');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (summarySection) summarySection.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (summarySection) summarySection.style.display = 'block';

  container.innerHTML = cart.map(item => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-3">
          <img src="${item.img}" class="cart-product-img" alt="${item.name}">
          <div>
            <div class="fw-700" style="font-size:.9rem">${item.name}</div>
            <div style="font-size:.78rem;color:#64748b">Unit Price: ₦${item.price.toLocaleString()}</div>
          </div>
        </div>
      </td>
      <td>
        <div class="qty-control">
          <button onclick="changeQty('${item.id}', -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty('${item.id}', 1)">+</button>
        </div>
      </td>
      <td class="fw-700" style="color:#2563eb">₦${(item.price * item.qty).toLocaleString()}</td>
      <td>
        <button onclick="removeItem('${item.id}')" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:1.1rem;transition:.2s" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'">
          <i class="bi bi-trash3"></i>
        </button>
      </td>
    </tr>
  `).join('');

  updateSummary();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function updateSummary() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 0 ? 5000 : 0;
  const total = subtotal + shipping;

  const subEl = document.getElementById('summary-subtotal');
  const shipEl = document.getElementById('summary-shipping');
  const totalEl = document.getElementById('summary-total');

  if (subEl) subEl.textContent = `₦${subtotal.toLocaleString()}`;
  if (shipEl) shipEl.textContent = shipping === 0 ? 'Free' : `₦${shipping.toLocaleString()}`;
  if (totalEl) totalEl.textContent = `₦${total.toLocaleString()}`;
}

/* ---- Newsletter ---- */
function handleNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  if (!input.value) return;
  showToast('Subscribed! Check your inbox for updates.');
  input.value = '';
}

/* ---- Wishlist Toggle ---- */
function toggleWishlist(btn) {
  const icon = btn.querySelector('i');
  if (icon.classList.contains('bi-heart')) {
    icon.classList.replace('bi-heart', 'bi-heart-fill');
    btn.style.color = '#ef4444';
    btn.style.borderColor = '#ef4444';
  } else {
    icon.classList.replace('bi-heart-fill', 'bi-heart');
    btn.style.color = '';
    btn.style.borderColor = '';
  }
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  // Auth navbar + checkout guard
  updateNavbarAuth();
  guardCheckout();

  // Newsletter forms
  document.querySelectorAll('.newsletter-form').forEach(f => f.addEventListener('submit', handleNewsletter));

  // Wishlist buttons
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleWishlist(btn));
  });

  // Add-to-cart buttons
  document.querySelectorAll('.btn-cart[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart(btn.dataset.id, btn.dataset.name, Number(btn.dataset.price), btn.dataset.img);
    });
  });

  // Countdown timers
  startCountdown('2026-10-31T23:59:59', '#promo-countdown');
  startCountdown('2026-10-25T23:59:59', '#deal-countdown-1');
  startCountdown('2026-10-22T23:59:59', '#deal-countdown-2');

  // Broken image fallback
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      this.src = 'https://placehold.co/400x400/e2e8f0/64748b?text=Image+Not+Available';
      this.style.background = '#f1f5f9';
      this.style.objectFit = 'contain';
    });
  });

});
