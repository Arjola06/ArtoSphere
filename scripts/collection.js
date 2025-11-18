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

        document.addEventListener('click', (e) => {
            if (!mobileMenu.classList.contains('open')) return;
            if (e.target === hamburger || hamburger.contains(e.target)) return;
            if (mobileMenu.contains(e.target)) return;
            closeMobile();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMobile();
        });

        mobileLinks.forEach(a => {
            a.addEventListener('click', () => {
                navLinks.forEach(x => x.classList.remove('active'));
                const match = navLinks.find(x => x.getAttribute('href') === a.getAttribute('href'));
                if (match) match.classList.add('active');
                mobileLinks.forEach(x => x.classList.remove('active'));
                a.classList.add('active');
                closeMobile();
            });
        });
    }

    function setActiveByPath() {
        const currentFile = window.location.pathname.split('/').pop() || 'collection.html';
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === currentFile));
        mobileLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === currentFile));
    }
    setActiveByPath();
});

// Category synonyms
const CATEGORY_SYNONYMS = {
  all: ["all", "të gjitha", "te gjitha"],
  ancient: ["ancient", "lashtë", "lashtё", "antike"],
  medieval: ["medieval", "mesjetë", "mesjeta", "middle ages", "moyen age"],
  renaissance: ["renaissance", "rilindja"],
  baroque: ["baroque", "barok"],
  neoclassicism: ["neoclassicism", "neoclassical", "neoklasicizëm"],
  romanticism: ["romanticism", "romantizëm", "romantic"],
  impressionism: ["impressionism", "impresionizëm"],
  expressionism: ["expressionism", "ekspresionizëm"],
  surrealism: ["surrealism", "surealizëm"],
  abstract: ["abstract art", "abstract", "abstrakt"],
  contemporary: ["contemporary art", "contemporary", "modern"],
  realism: ["realism", "realisem", "realist"]
};

// Normalize text for category matching
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim();
}

function findCategoryKey(label) {
  const normalizedLabel = normalize(label);
  for (const [key, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    if (synonyms.some(syn => normalize(syn) === normalizedLabel)) {
      return key;
    }
  }
  return null;
}

// Setup card icons (heart + cart buttons)
function setupCardIcons() {
  const cards = document.querySelectorAll(".photo-card");

  cards.forEach(card => {
    const thumbEl = card.querySelector(".thumb");

    if (thumbEl && !card.querySelector(".card-actions")) {
      const actions = document.createElement("div");
      actions.className = "card-actions";

      // Heart button - go to favorites
      const heartBtn = document.createElement("button");
      heartBtn.type = "button";
      heartBtn.className = "icon-btn heart-btn";
      heartBtn.innerHTML = "&#9829;";
      heartBtn.setAttribute("aria-label", "Add to favorites");

      // mark active if already in favorites
      try {
        const favs = JSON.parse(localStorage.getItem('artoSphereFavorites')) || [];
        const pid = card.dataset.id || card.dataset.title || (card.querySelector('img')?.src || '');
        const found = favs.find(it => (it.id && pid && it.id === pid) || it.name === card.dataset.title);
        if (found) heartBtn.classList.add('is-active');
      } catch (e) {}

      heartBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        // Toggle favorites in localStorage
        const favKey = 'artoSphereFavorites';
        const product = {
          id: card.dataset.id || card.dataset.title || (card.querySelector('img')?.src || ''),
          name: card.dataset.title || 'Artwork',
          artist: card.dataset.artist || 'Unknown Artist',
          price: card.dataset.price || '',
          image: card.querySelector('img')?.src || 'img/default.jpg'
        };
        let favs = JSON.parse(localStorage.getItem(favKey)) || [];
        const idx = favs.findIndex(it => (it.id && product.id && it.id === product.id) || it.name === product.name);
        if (idx >= 0) {
          // remove
          favs.splice(idx, 1);
          heartBtn.classList.remove('is-active');
        } else {
          favs.push(product);
          heartBtn.classList.add('is-active');
        }
        localStorage.setItem(favKey, JSON.stringify(favs));
        // update nav counters if available
        try { updateFavoritesCounter(); } catch(e) {}
      });

      // Cart button - add to cart (localStorage)
      const cartBtn = document.createElement("button");
      cartBtn.type = "button";
      cartBtn.className = "icon-btn cart-btn";
      cartBtn.innerHTML = "&#128717;";
      cartBtn.setAttribute("aria-label", "Add to cart");

      cartBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        // Extract product data from card data attributes
        const product = {
          name: card.dataset.title || "Artwork",
          artist: card.dataset.artist || "Unknown Artist",
          price: Number((card.dataset.price || '0').toString().replace(/[^0-9.-]+/g, '')) || 0,
          image: card.querySelector("img")?.src || "img/default.jpg",
          id: card.dataset.id || card.dataset.title || (card.querySelector('img')?.src || '')
        };

        // Get existing cart from localStorage
        let cart = JSON.parse(localStorage.getItem('artoSphereCart')) || [];

        // Try to find by id first, then by name
        let existingItem = cart.find(item => (item.id && product.id && item.id === product.id) || item.name === product.name);
        if (existingItem) {
          // increment quantity
          existingItem.quantity = (Number(existingItem.quantity) || 1) + 1;
        } else {
          product.quantity = 1;
          cart.push(product);
        }

        // Save updated cart to localStorage
        localStorage.setItem('artoSphereCart', JSON.stringify(cart));

        // Visual feedback
        cartBtn.classList.add('is-active');
        setTimeout(() => cartBtn.classList.remove('is-active'), 500);

        // Update cart counter
        updateCartCounter();
      });

      actions.appendChild(heartBtn);
      actions.appendChild(cartBtn);
      thumbEl.appendChild(actions);
    }
  });
}

// Update cart counter in navigation
function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem('artoSphereCart')) || [];
  // Count total quantity across items
  const cartCount = cart.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);

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

// Update favorites counter (sum of favorited items)
function updateFavoritesCounter(){
  const favs = JSON.parse(localStorage.getItem('artoSphereFavorites')) || [];
  const count = favs.length;
  const links = document.querySelectorAll('a[href="favourites.html"]');
  links.forEach(link => {
    const base = link.textContent.split('(')[0].trim();
    link.textContent = count > 0 ? `${base} (${count})` : base;
  });
}

// Setup modal icons
function setupModalIcons() {
  const modalHeartBtn = document.querySelector("#artModal .art-modal__actions .heart-btn");
  const modalCartBtn = document.querySelector("#artModal .art-modal__actions .cart-btn");

  if (modalHeartBtn) {
    // set initial state for modal heart
    try {
      const favs = JSON.parse(localStorage.getItem('artoSphereFavorites')) || [];
      const title = document.getElementById("artModalTitle")?.textContent || '';
      const mid = title || document.getElementById("artModalImage")?.src || '';
      const found = favs.find(it => (it.id && it.id === mid) || it.name === title);
      if (found) modalHeartBtn.classList.add('is-active'); else modalHeartBtn.classList.remove('is-active');
    } catch(e) {}

    modalHeartBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Toggle favorite for currently open modal item
      const favKey = 'artoSphereFavorites';
      const title = document.getElementById("artModalTitle")?.textContent || '';
      const artist = document.getElementById("artModalArtist")?.textContent || '';
      const image = document.getElementById("artModalImage")?.src || '';
      const price = (document.getElementById("artModalPrice")?.textContent || '').replace('$','');
      const product = { id: title || image, name: title, artist, image, price };
      let favs = JSON.parse(localStorage.getItem(favKey)) || [];
      const idx = favs.findIndex(it => (it.id && product.id && it.id === product.id) || it.name === product.name);
      if (idx >= 0) { favs.splice(idx,1); modalHeartBtn.classList.remove('is-active'); }
      else { favs.push(product); modalHeartBtn.classList.add('is-active'); }
      localStorage.setItem(favKey, JSON.stringify(favs));
      try{ updateFavoritesCounter(); }catch(e){}
    });
  }

  if (modalCartBtn) {
    modalCartBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      
      // Get the currently open modal's product data
      const product = {
        name: document.getElementById("artModalTitle").textContent || "Artwork",
        artist: document.getElementById("artModalArtist").textContent || "Unknown Artist",
        price: Number((document.getElementById("artModalPrice").textContent || '0').toString().replace(/[^0-9.-]+/g, '')) || 0,
        image: document.getElementById("artModalImage").src || "img/default.jpg",
        id: document.getElementById("artModalTitle").textContent || Date.now()
      };

      // Get existing cart from localStorage
      let cart = JSON.parse(localStorage.getItem('artoSphereCart')) || [];
      // Try to find existing item by id or name
      let existingItem = cart.find(item => (item.id && product.id && item.id === product.id) || item.name === product.name);
      if (existingItem) {
        existingItem.quantity = (Number(existingItem.quantity) || 1) + 1;
      } else {
        product.quantity = 1;
        cart.push(product);
      }

      // Save updated cart to localStorage
      localStorage.setItem('artoSphereCart', JSON.stringify(cart));

      // Visual feedback
      modalCartBtn.classList.add('is-active');
      setTimeout(() => modalCartBtn.classList.remove('is-active'), 500);

      // Update cart counter
      updateCartCounter();
    });
  }
}

// Open modal on card click
function openModal(card) {
  const modal = document.getElementById("artModal");
  
  // Store image source in card dataset for modal access
  card.dataset.image = card.querySelector("img").src;
  
  document.getElementById("artModalImage").src = card.dataset.image || card.querySelector("img").src;
  document.getElementById("artModalTitle").textContent = card.dataset.title || "Unknown";
  document.getElementById("artModalPeriod").textContent = card.dataset.period || "";
  document.getElementById("artModalDate").textContent = card.dataset.date || "";
  document.getElementById("artModalArtist").textContent = card.dataset.artist || "";
  document.getElementById("artModalPrice").textContent = card.dataset.price || "";
  document.getElementById("artModalClassification").textContent = card.dataset.classification || "";
  document.getElementById("artModalDimensions").textContent = card.dataset.dimensions || "";
  document.getElementById("artModalLocation").textContent = card.dataset.location || "";
  document.getElementById("artModalText").textContent = card.dataset.text || "";

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  setupModalIcons();
}

// Close modal
function closeModal() {
  const modal = document.getElementById("artModal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  setupCardIcons();
  updateCartCounter();
  try{ updateFavoritesCounter(); }catch(e){}

  // Card click to open modal
  document.querySelectorAll(".photo-card").forEach(card => {
    card.addEventListener("click", (e) => {
      // Don't open modal if clicking on action buttons
      if (!e.target.closest('.card-actions') && !e.target.closest('.icon-btn')) {
        openModal(card);
      }
    });
  });

  // Close modal
  document.getElementById("artModalClose").addEventListener("click", closeModal);
  document.getElementById("artModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("artModal")) closeModal();
  });

  // Filter functionality
  const navLinks = document.querySelectorAll(".nav a");
  const cards = document.querySelectorAll(".photo-card");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const categoryLabel = link.textContent.trim();
      const categoryKey = findCategoryKey(categoryLabel);

      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      cards.forEach(card => {
        const cardCategory = card.dataset.category || "";
        if (categoryKey === "all" || cardCategory === categoryKey) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Set "All" as active initially
  if (navLinks[0]) {
    navLinks[0].classList.add("active");
  }
});
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    function onScroll() {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    }

    onScroll(); // set initial state
    window.addEventListener('scroll', onScroll, { passive: true });
});