// Auction items database
const items = [
        { id: 1, title: "The Night Watch", artist: "Rembrandt van Rijn", date: "1642", location: "Rijksmuseum, Amsterdam, Netherlands", medium: "Oil on Canvas", category: "Painting", description: "A famous group portrait of a city militia, known for its dramatic use of light and shadow.", currentBid: 60000, image: "img/f1.jpg", endTime: Date.now() + 3600000, bids: [{ bidder: "Anonymous", amount: 55000 }, { bidder: "Art Collector", amount: 58000 }, { bidder: "Gallery Owner", amount: 60000 }] },
    { id: 2, title: "The Annunciation", artist: "Fra Angelico", date: "1437-1446", location: "Convent of San Marco, Florence, Italy", medium: "Fresco", category: "Painting", description: "A beautiful depiction of the angel Gabriel announcing to the Virgin Mary that she would conceive the Son of God.", currentBid: 48000, image: "img/auction4.jpeg", endTime: Date.now() + 5400000, bids: [{ bidder: "Museum Curator", amount: 41000 }, { bidder: "Private Collector", amount: 48000 }] },
    { id: 3, title: "The Birth of Venus", artist: "Sandro Botticelli", date: "1484-1486", location: "ULzi Gallery, Florence, Italy", medium: "Tempera on canvas", category: "Painting", description: "A famous Renaissance painting depicting the goddess Venus emerging from the sea on a shell.", currentBid: 8000000, image: "img/auction5.jpeg", endTime: Date.now() + 7200000, bids: [{ bidder: "Surrealism Enthusiast", amount: 6800000 }, { bidder: "Art Investor", amount: 8000000 }] },
    { id: 4, title: "Fayum Portrait", artist: "Unknown", date: "1st-3rd century AD", location: "British Museum", medium: "Oil on Wood", category: "Painting", description: "This portrait, created using the encaustic technique, depicts a young aristocratic woman with a vivid gaze and a luxurious jewelry.", currentBid: 500000 , image: "img/auction1.jpeg", endTime: Date.now() + 2700000, bids: [{ bidder: "Gallery Owner", amount: 500000 }] },
    { id: 5, title: "Villa of Mysteries Fresco-Summary", artist: "Unknown", date: "1st-3rd century AD", location: "Villa di Misteri, Pompei, Italy", medium: "Fresco", category: "Painting", description: "This monumental fresco, painted on a vivid Pompeian red background, depicts a con!nuous sequence of female 6gures engaged in what appears to be a sacred ritual.", currentBid: 1100000, image: "img/auction2.jpeg", endTime: Date.now() + 4500000, bids: [{ bidder: "Photo Collector", amount: 1100000 }] },
    { id: 6, title: "Maestà ", artist: "Duccio di Buoninsegna", date: "1308-1311", location: "Museo dell’Opera del Duomo, Siena, Italy", medium: "Tempera and gold on wood panel", category: "Painting", description: "A renowned altarpiece depicting the Virgin Mary enthroned with angels and saints, showcasing exquisite detail and vibrant colors.", currentBid: 420000, image: "img/auction3.jpeg", endTime: Date.now() + 3300000, bids: [{ bidder: "Art Enthusiast", amount: 420000 }] }
];

let filter = "all", sort = "ending-soon", currentId = null;

// Get filtered and sorted items
function getItems() {
    let list = items.filter(item => filter === "all" || item.category === filter);
    if (sort === "ending-soon") list.sort((a, b) => a.endTime - b.endTime);
    else if (sort === "newest") list.sort((a, b) => b.id - a.id);
    else if (sort === "price-low") list.sort((a, b) => a.currentBid - b.currentBid);
    else if (sort === "price-high") list.sort((a, b) => b.currentBid - a.currentBid);
    return list;
}

// Render auction grid
function render() {
    $("#auctionGrid").html("");
    getItems().forEach(item => {
        const timeLeft = item.endTime - Date.now();
        const hours = Math.floor(timeLeft / 3600000);
        const minutes = Math.floor((timeLeft % 3600000) / 60000);
        
        const card = $(`
            <div class="auction-card">
                <div class="card-image-container">
                    <img src="${item.image}" alt="${item.title}" class="card-image">
                    <div class="card-timer">${hours}h ${minutes}m</div>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${item.title}</h3>
                    <p class="card-artist">by ${item.artist}</p>
                    <div class="card-details">
                        <p class="card-detail"><span class="detail-label">Date:</span> ${item.date}</p>
                        <p class="card-detail"><span class="detail-label">Location:</span> ${item.location}</p>
                        <p class="card-detail"><span class="detail-label">Medium:</span> ${item.medium}</p>
                    </div>
                    <p class="card-description">${item.description}</p>
                    <p class="card-category">${item.category}</p>
                    <div class="card-bid-info">
                        <div class="current-bid">
                            <span class="label">Current Bid</span>
                            <span class="amount">$${item.currentBid}</span>
                        </div>
                        <div class="bid-count">
                            <span class="label">Bids</span>
                            <span class="amount">${item.bids.length}</span>
                        </div>
                    </div>
                    <button class="view-btn" data-id="${item.id}">View & Bid</button>
                </div>
            </div>
        `);
        
        card.find(".view-btn").click(function() { openModal($(this).data("id")); });
        $("#auctionGrid").append(card);
    });
}

// Open bid modal
function openModal(id) {
    currentId = id;
    const item = items.find(i => i.id === id);
    
    $("#modalTitle").text(item.title);
    $("#modalImage").attr("src", item.image);
    $("#modalDescription").text(item.description);
    $("#currentBid").text("$" + item.currentBid);
    $("#bidCount").text(item.bids.length);
    
    updateTimer(item);
    renderBids(item.bids);
    $("#bidModal").show();
}

// Update timer display
function updateTimer(item) {
    const timeLeft = item.endTime - Date.now();
    if (timeLeft <= 0) {
        $("#timeRemaining").text("Auction Ended");
        return;
    }
    const h = Math.floor(timeLeft / 3600000);
    const m = Math.floor((timeLeft % 3600000) / 60000);
    const s = Math.floor((timeLeft % 60000) / 1000);
    $("#timeRemaining").text(`${h}h ${m}m ${s}s`);
}

// Render bid history
function renderBids(bids) {
    $("#bidHistoryList").html("");
    // Sort bids by amount in descending order (highest first)
    const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
    sortedBids.forEach(bid => {
        $("#bidHistoryList").append(`<li class="bid-item"><span class="bidder">${bid.bidder}</span><span class="bid-amount">$${bid.amount}</span></li>`);
    });
}

// Place bid
window.placeBid = function() {
    const amount = parseInt($("#bidAmount").val());
    const item = items.find(i => i.id === currentId);
    
    if (!amount || amount <= item.currentBid) {
        alert("Bid must be higher than current bid!");
        return;
    }
    
    item.bids.unshift({ bidder: "You", amount: amount });
    item.currentBid = amount;
    
    $("#currentBid").text("$" + amount);
    $("#bidCount").text(item.bids.length);
    $("#bidAmount").val("");
    renderBids(item.bids);
    render();
    alert("Bid placed successfully!");
};

// Initialize
$(document).ready(function() {
    render();
    
    // Event listeners
    $("#sortBy").change(function() { sort = $(this).val(); render(); });
    $("#filterCategory").change(function() { filter = $(this).val(); render(); });
    $(".close").click(() => $("#bidModal").hide());
    $(window).click(function(e) { if ($(e.target).is("#bidModal")) $("#bidModal").hide(); });
    
    // Update timers every second
    setInterval(() => {
        $(".card-timer").each(function(i) {
            const item = getItems()[i];
            if (item) {
                const timeLeft = item.endTime - Date.now();
                const h = Math.floor(timeLeft / 3600000);
                const m = Math.floor((timeLeft % 3600000) / 60000);
                $(this).text(`${h}h ${m}m`);
            }
        });
        
        if (currentId) {
            const item = items.find(i => i.id === currentId);
            if (item) updateTimer(item);
        }
    }, 1000);
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