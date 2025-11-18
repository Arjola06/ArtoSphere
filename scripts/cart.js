// cart.js — render cart from localStorage, remove items, and handle checkout
(function(){
  const CART_KEY = 'artoSphereCart';

  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch(e) { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCounter();
  }

  function formatPrice(p){
    const n = Number(p) || 0;
    return n.toLocaleString(undefined, {maximumFractionDigits:0});
  }

  function updateCartCounter(){
    const cart = readCart();
    // count total quantity, not just distinct items
    const cartCount = cart.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
    const cartLinks = document.querySelectorAll('a[href="cart.html"]');
    cartLinks.forEach(link => {
      const originalText = link.textContent.includes('(')
        ? link.textContent.split('(')[0].trim()
        : link.textContent.trim();
      link.textContent = cartCount > 0 ? `${originalText} (${cartCount})` : originalText;
    });
  }

  function renderCart(){
    const list = document.getElementById('cartItemsList');
    const totalEl = document.getElementById('cartTotal');
    if(!list || !totalEl) return;

    const cart = readCart();
    list.innerHTML = '';

    if(cart.length === 0){
      list.innerHTML = '<p>Your cart is empty.</p>';
      totalEl.textContent = '0';
      return;
    }

    let total = 0;
    cart.forEach((item, idx) => {
      const price = Number(String(item.price).replace(/[^0-9.-]+/g, '')) || 0;
      const qty = Number(item.quantity) || 1;
      total += price * qty;

      const product = document.createElement('div');
      product.className = 'cart-item';
      product.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-body">
          <h4 class="cart-item-title">${item.name}</h4>
          <div class="cart-item-sub">${item.artist || ''}</div>
          <div class="cart-item-price">$${formatPrice(price)} × <strong class="qty">${qty}</strong></div>
          <div class="cart-item-subtotal">Subtotal: $${formatPrice(price * qty)}</div>
        </div>
        <div class="cart-item-actions">
          <button class="qty-decrease" data-idx="${idx}" aria-label="Decrease quantity">−</button>
          <button class="qty-increase" data-idx="${idx}" aria-label="Increase quantity">+</button>
          <button class="remove-btn" data-idx="${idx}" aria-label="Remove item">Remove</button>
        </div>
      `;

      list.appendChild(product);
    });

    totalEl.textContent = formatPrice(total);

    // attach quantity and remove handlers
    list.querySelectorAll('.qty-increase').forEach(btn => btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      changeQuantity(idx, 1);
    }));

    list.querySelectorAll('.qty-decrease').forEach(btn => btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      changeQuantity(idx, -1);
    }));

    list.querySelectorAll('.remove-btn').forEach(btn => btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      if (confirm('Remove this item from your cart?')) removeItem(idx);
    }));
  }

  function removeItem(index){
    const cart = readCart();
    if(index < 0 || index >= cart.length) return;
    cart.splice(index,1);
    saveCart(cart);
    renderCart();
  }

  function changeQuantity(index, delta){
    const cart = readCart();
    if(index < 0 || index >= cart.length) return;
    const item = cart[index];
    item.quantity = Math.max(1, (Number(item.quantity) || 1) + delta);
    saveCart(cart);
    renderCart();
  }

  function clearCart(){
    localStorage.removeItem(CART_KEY);
    updateCartCounter();
    renderCart();
  }

  // handle checkout form
  function attachCheckout(){
    const form = document.getElementById('formCheckout');
    if(!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const cart = readCart();
      if(cart.length === 0){
        alert('Your cart is empty. Add items before checking out.');
        return;
      }

      // Simple validation already enforced by HTML required attributes
      const data = new FormData(form);
      const order = {
        name: data.get('name'),
        surname: data.get('surname'),
        phone: data.get('phone'),
        email: data.get('email'),
        city: data.get('city'),
        payment: data.get('payment'),
        items: cart,
        total: document.getElementById('cartTotal')?.textContent || '0'
      };

      // For now: store last order and clear cart
      try{
        localStorage.setItem('artoSphereLastOrder', JSON.stringify(order));
      }catch(e){/*ignore*/}

      clearCart();
      form.reset();
      alert('Order placed successfully! Thank you.');
      // Optionally redirect to a confirmation page
    });
  }

  // initialize
  document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
    renderCart();
    attachCheckout();
  });

})();
// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');

    if (window.scrollY > 50) {
        //Add scrolled class when scroll position is more then 50px
        navbar.classList.add('scrolled');
    } else {
        //Remove scrolled class when scroll position is less than 50px
        navbar.classList.remove('scrolled');
    }
});

// Mobile hamburger + nav active behavior
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = Array.from(document.querySelectorAll('.navbar a:not(.nav-center)'));
    const mobileLinks = mobileMenu ? Array.from(mobileMenu.querySelectorAll('a')) : [];

    function closeMobile() {
        if (!hamburger || !mobileMenu) return;
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
    }
    function openMobile() {
        if (!hamburger || !mobileMenu) return;
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        mobileMenu.classList.add('open');
        mobileMenu.setAttribute('aria-hidden', 'false');
    }

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', (e) => {
            const isOpen = hamburger.classList.contains('open');
            isOpen ? closeMobile() : openMobile();
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.classList.contains('open')) return;
            if (e.target === hamburger || hamburger.contains(e.target)) return;
            if (mobileMenu.contains(e.target)) return;
            closeMobile();
        });

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMobile();
        });

        // close mobile when a mobile link is clicked (and mark active)
        mobileLinks.forEach(a => {
            a.addEventListener('click', () => {
                navLinks.forEach(x => x.classList.remove('active'));
                // mark the corresponding desktop link active if present
                const match = navLinks.find(x => x.getAttribute('href') === a.getAttribute('href'));
                if (match) match.classList.add('active');
                a.classList.add('active');
                closeMobile();
            });
        });
    }

    // mark current page link active on load (works across pages)
    function setActiveByPath() {
        const currentFile = window.location.pathname.split('/').pop() || 'cart.html';
        navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === currentFile);
        });
        mobileLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === currentFile);
        });
    }
    setActiveByPath();
});

// Load and display cart items
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('artoSphereCart')) || [];
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalEl = document.getElementById('cartTotal');
    
    cartItemsList.innerHTML = ''; // Clear list
    let total = 0;

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p style="color: #f5f5f5; text-align: center; padding: 40px; grid-column: 1/-1;">Your cart is empty</p>';
        cartTotalEl.textContent = '0';
        updateCartCounter();
        return;
    }

    cart.forEach((product, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        
        // Format price properly
        const price = parseInt(product.price) || 0;
        total += price;
        
        itemDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h4>${product.name}</h4>
                <p>${product.artist}</p>
                <p class="cart-item-price">$${price.toLocaleString()}</p>
            </div>
            <button class="remove-btn" type="button" onclick="removeFromCart(${index})">Remove</button>
        `;
        cartItemsList.appendChild(itemDiv);
    });

    cartTotalEl.textContent = total.toLocaleString();
    updateCartCounter();
}

// Remove item from cart
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('artoSphereCart')) || [];
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        localStorage.setItem('artoSphereCart', JSON.stringify(cart));
        loadCartItems();
    }
}

// Update cart counter in navigation
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('artoSphereCart')) || [];
    const cartCount = cart.length;
    
    // Update cart link text
    const cartLinks = document.querySelectorAll('a[href="cart.html"]');
    cartLinks.forEach(link => {
        const originalText = link.textContent.includes('(') 
            ? link.textContent.split('(')[0].trim()
            : link.textContent.trim();
        link.textContent = cartCount > 0 
            ? `${originalText} (${cartCount})`
            : originalText;
    });
}

// Toggle payment card details visibility
document.addEventListener('DOMContentLoaded', () => {
    const paymentSelect = document.getElementById('payment');
    const cardDetails = document.getElementById('creditCardDetails');
    
    if (paymentSelect && cardDetails) {
        paymentSelect.addEventListener('change', (e) => {
            cardDetails.style.display = e.target.value === 'credit' ? 'block' : 'none';
        });
    }

    // Handle form submission
    const formCheckout = document.getElementById('formCheckout');
    if (formCheckout) {
        formCheckout.addEventListener('submit', (e) => {
            e.preventDefault();
            const cart = JSON.parse(localStorage.getItem('artoSphereCart')) || [];
            
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }

            alert('Order placed successfully! Thank you for your purchase.');
            localStorage.removeItem('artoSphereCart');
            loadCartItems();
            formCheckout.reset();
            document.getElementById('creditCardDetails').style.display = 'none';
        });
    }

    // Load cart items on page load
    loadCartItems();
});