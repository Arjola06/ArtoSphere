// favorites.js — render favorites saved in localStorage and allow remove
(function(){
  const KEY = 'artoSphereFavorites';

  function readFavs(){
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch(e){ return []; }
  }

  function saveFavs(list){
    localStorage.setItem(KEY, JSON.stringify(list));
    updateFavsCounter();
  }

  function updateFavsCounter(){
    const favs = readFavs();
    const count = favs.length;
    const links = document.querySelectorAll('a[href="favourites.html"]');
    links.forEach(link => {
      const base = link.textContent.split('(')[0].trim();
      link.textContent = count > 0 ? `${base} (${count})` : base;
    });
  }

  function buildCard(item, idx){
    const el = document.createElement('article');
    el.className = 'photo-card';
    el.dataset.title = item.name || item.title || '';
    el.dataset.artist = item.artist || '';
    el.dataset.price = item.price || '';
    el.innerHTML = `
      <div class="thumb">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="card-body">
        <h3 class="card-title">${item.name}</h3>
        <div class="card-sub">${item.artist || ''}</div>
      </div>
    `;

    // add actions similar to collection: heart (remove) and cart
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const heart = document.createElement('button');
    heart.className = 'icon-btn heart-btn is-active';
    heart.innerHTML = '&#9829;';
    heart.title = 'Remove from favorites';
    heart.addEventListener('click', (e) => {
      e.stopPropagation();
      if(!confirm('Remove this item from favourites?')) return;
      const favs = readFavs();
      favs.splice(idx,1);
      saveFavs(favs);
      render();
    });

    actions.appendChild(heart);
    el.querySelector('.thumb').appendChild(actions);

    // clicking the card opens modal if modal exists
    el.addEventListener('click', () => {
      if(typeof openModal === 'function') openModal(el);
    });

    return el;
  }

  function render(){
    const grid = document.getElementById('favoritesGrid');
    if(!grid) return;
    const favs = readFavs();
    grid.innerHTML = '';
    if(favs.length === 0){
      grid.innerHTML = '<p>No favourites yet. Click the heart on any artwork to save it here.</p>';
      updateFavsCounter();
      return;
    }
    favs.forEach((it, idx) => grid.appendChild(buildCard(it, idx)));
    updateFavsCounter();
  }

  document.addEventListener('DOMContentLoaded', () => {
    render();
  });

})();
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