document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.className = navLinks.classList.contains('open')
          ? 'fas fa-times'
          : 'fas fa-bars';
      }
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const icon = menuToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      });
    });
  }

  // 2. Product Category Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.productcard');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.filter;
      productCards.forEach((card) => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 3. Interactive Cart System (persisted in localStorage)
  let cart = JSON.parse(localStorage.getItem('goldenCrustCart') || '[]');

  const cartCountEl = document.querySelector('.cart-count');
  const cartBtn = document.querySelector('.cart-btn');
  const cartModalBackdrop = document.querySelector('.cart-modal-backdrop');
  const cartCloseBtn = document.querySelector('.cart-close');
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartTotalEl = document.querySelector('.cart-total-amount');
  const checkoutBtn = document.querySelector('.checkout-btn');

  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  function saveAndRenderCart() {
    localStorage.setItem('goldenCrustCart', JSON.stringify(cart));
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCountEl) cartCountEl.textContent = totalCount;

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML =
        '<p style="text-align:center;color:#777;padding:1.5rem 0;">Your bakery basket is empty.</p>';
      if (cartTotalEl) cartTotalEl.textContent = '₹0';
      return;
    }

    let totalPrice = 0;
    cartItemsContainer.innerHTML = cart
      .map((item, idx) => {
        const sub = item.price * item.qty;
        totalPrice += sub;
        return `
          <div class="cart-item">
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <span>₹${item.price} × ${item.qty} = <strong>₹${sub}</strong></span>
            </div>
            <div class="cart-item-controls">
              <button class="qty-btn" data-action="dec" data-index="${idx}">-</button>
              <span>${item.qty}</span>
              <button class="qty-btn" data-action="inc" data-index="${idx}">+</button>
            </div>
          </div>
        `;
      })
      .join('');

    if (cartTotalEl) cartTotalEl.textContent = `₹${totalPrice}`;

    cartItemsContainer.querySelectorAll('.qty-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        const action = btn.dataset.action;
        if (action === 'inc') {
          cart[idx].qty += 1;
        } else if (action === 'dec') {
          cart[idx].qty -= 1;
          if (cart[idx].qty <= 0) cart.splice(idx, 1);
        }
        saveAndRenderCart();
      });
    });
  }

  document.querySelectorAll('.order-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const price = parseInt(btn.dataset.price, 10);
      const existing = cart.find((item) => item.name === name);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ name, price, qty: 1 });
      }
      saveAndRenderCart();
      showToast(`Added ${name} (₹${price}) to your order!`);
    });
  });

  if (cartBtn && cartModalBackdrop) {
    cartBtn.addEventListener('click', () => {
      saveAndRenderCart();
      cartModalBackdrop.classList.add('open');
    });
  }

  if (cartCloseBtn && cartModalBackdrop) {
    cartCloseBtn.addEventListener('click', () => {
      cartModalBackdrop.classList.remove('open');
    });
    cartModalBackdrop.addEventListener('click', (e) => {
      if (e.target === cartModalBackdrop) {
        cartModalBackdrop.classList.remove('open');
      }
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Please add items to your basket before placing an order.');
        return;
      }
      cart = [];
      saveAndRenderCart();
      if (cartModalBackdrop) cartModalBackdrop.classList.remove('open');
      showToast('Order placed! Fresh treats will be prepared shortly.');
    });
  }

  saveAndRenderCart();

  // 4. Contact Form Handler
  const contactForm = document.querySelector('.contact-form');
  const formStatus = document.querySelector('.form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const name = (formData.get('name') || '').toString().trim();

      if (formStatus) {
        formStatus.className = 'form-status success';
        formStatus.textContent = `Thank you, ${name || 'Friend'}! Your message has been received. Our bakery team will get back to you soon.`;
      }
      showToast('Message sent successfully!');
      contactForm.reset();
    });
  }
});
