// Slide data
const slideData = [
    {  date: "1508–1512",title: "The Creation of Adam" },
    {  date: "1563",title: "The Tower of Babel" },
    {  date: "1931" ,title: "The Persistence of Memory"}
];

//Tregon cili slide eshte aktiv
//Fillon nga i pari
let slideIndex = 0;
showSlide(slideIndex);

// Change with arrows
function changeSlide(n) {
    slideIndex += n;
    showSlide(slideIndex);
}

// Funksioni kryesor i slideshow
function showSlide(n) {
    let slides = document.getElementsByClassName("slide");

    //Nese kalon kufinjte resetohen
    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;

    // Hide all slides and remove animation classes
    for (let s of slides) {
        s.style.display = "none";
        
        // Remove .show class so animation can replay
        const t = s.querySelector(".title");
        const d = s.querySelector(".date");
        const r = s.querySelector(".readmore");
        if (t) t.classList.remove("show");
        if (d) d.classList.remove("show");
        if (r) r.classList.remove("show");
    }

    slides[slideIndex].style.display = "block";

    // Marrim elementet
    const date = slides[slideIndex].querySelector(".date");
    const title = slides[slideIndex].querySelector(".title");
    const readmore = slides[slideIndex].querySelector(".readmore");

    // Apply text
    date.textContent = slideData[slideIndex].date;
    title.textContent = slideData[slideIndex].title;

    //Truk qe rinis animacionin
    void slides[slideIndex].offsetWidth;

    // Timed appearance with .show class
    setTimeout(() => title.classList.add("show"), 800);   // after 0.8s
    setTimeout(() => date.classList.add("show"), 1600);    // after 1.6s
    setTimeout(() => readmore.classList.add("show"), 2400); // after 2.4s

    // --- Update dots ---
    let dots = document.querySelectorAll(".dot");
    dots.forEach(dot => dot.classList.remove("active"));
    dots[slideIndex].classList.add("active");
}

// Auto-slide every 10 seconds
setInterval(() => {
    slideIndex++;
    showSlide(slideIndex);
}, 10000);

// --- Dot Click Events ---
let dots = document.querySelectorAll(".dot");
dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        slideIndex = index;
        showSlide(slideIndex);
    });
});

// Mobile hamburger + nav active behavior
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = Array.from(document.querySelectorAll('.navbar a:not(.nav-center)'));
    const mobileLinks = mobileMenu ? Array.from(mobileMenu.querySelectorAll('a')) : [];
    const navbar = document.querySelector('.navbar');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

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
        const currentFile = window.location.pathname.split('/').pop() || 'index.html';
        navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === currentFile);
        });
        mobileLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === currentFile);
        });
    }
    setActiveByPath();
});
// ...existing code...

// Add to Cart functionality for collection page
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const product = {
                name: btn.getAttribute('data-name'),
                artist: btn.getAttribute('data-artist'),
                price: btn.getAttribute('data-price'),
                image: btn.getAttribute('data-image'),
                id: Date.now()
            };

            // Get existing cart from localStorage
            let cart = JSON.parse(localStorage.getItem('artoSphereCart')) || [];
            
            // Add new product to cart
            cart.push(product);
            
            // Save updated cart to localStorage
            localStorage.setItem('artoSphereCart', JSON.stringify(cart));
            
            // Show confirmation
            alert(`${product.name} added to cart!`);
        });
    });
});