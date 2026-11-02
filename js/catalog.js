'use strict';

function productCardHtml(p) {
  const btnHtml = p.stock > 0
    ? '<button class="btn product-card__add" data-add="' + p.id + '">В корзину</button>'
    : '<button class="btn product-card__add" disabled>Нет в наличии</button>';

  return '' +
    '<article class="product-card" data-id="' + p.id + '">' +
      '<a href="product.html?id=' + p.id + '" class="product-card__link">' +
        productVisual(p) +
        '<div class="product-card__body">' +
          '<h3 class="product-card__title">' + escapeHtml(p.name) + '</h3>' +
          '<p class="product-card__desc">' + escapeHtml(p.description) + '</p>' +
          '<div class="product-card__price">' + formatPrice(p.price) + '</div>' +
        '</div>' +
      '</a>' +
      btnHtml +
    '</article>';
}

function renderProductGrid(selector, products) {
  const root = qs(selector);
  if (!root) return;
  if (!products.length) { root.innerHTML = '<p>Товары не найдены</p>'; return; }
  root.innerHTML = products.map(productCardHtml).join('');
  
  qsa('[data-add]', root).forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      addToCart(Number(btn.dataset.add));
    });
  });
}

document.addEventListener('dbLoaded', function () {
  const grid = qs('#catalog-grid');
  if (!grid) return;
  const searchInput = qs('#search');
  const categoryFilter = qs('#category-filter');
  const sortSelect = qs('#sort');
  const countEl = qs('#catalog-count');

  let state = { q: '', category: 'all', sort: 'default' };

  function apply() {
    let list = PRODUCTS.slice();
    if (state.q) {
      const q = state.q.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (state.category !== 'all') list = list.filter(p => p.category === state.category);
    if (state.sort === 'price-asc')  list.sort((a, b) => a.price - b.price);
    if (state.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (state.sort === 'name')       list.sort((a, b) => a.name.localeCompare(b.name));
    renderProductGrid('#catalog-grid', list);
    if (countEl) countEl.textContent = list.length + ' товаров';
  }

  if (searchInput)    searchInput.addEventListener('input', e => { state.q = e.target.value; apply(); });
  if (categoryFilter) categoryFilter.addEventListener('change', e => { state.category = e.target.value; apply(); });
  if (sortSelect)     sortSelect.addEventListener('change', e => { state.sort = e.target.value; apply(); });

  apply();
});