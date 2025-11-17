// Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar=document.querySelector('.navbar');

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
