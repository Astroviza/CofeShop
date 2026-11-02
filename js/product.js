'use strict';
document.addEventListener('dbLoaded', function () {
  const root = qs('#product-detail');
  if (!root) return;
  const id = Number(getParam('id'));
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) { root.innerHTML = '<p>Товар не найден</p>'; return; }

  let actionsHtml = '';
  if (p.stock > 0) {
    actionsHtml = 
      '<div class="qty">' +
        '<button class="qty__btn" id="qty-minus">−</button>' +
        '<input type="number" id="qty-input" value="1" min="1" max="' + p.stock + '">' +
        '<button class="qty__btn" id="qty-plus">+</button>' +
      '</div>' +
      '<button class="btn btn--primary" id="add-btn">В корзину</button>';
  } else {
    actionsHtml = '<button class="btn" disabled>Нет в наличии</button>';
  }

  root.innerHTML =
    '<div class="product-detail">' +
      '<div class="product-detail__visual">' + productVisual(p) + '</div>' +
      '<div class="product-detail__info">' +
        '<a href="catalog.html">← В каталог</a>' +
        '<h1>' + escapeHtml(p.name) + '</h1>' +
        '<p>' + escapeHtml(p.description) + '</p>' +
        '<div class="product-card__price">' + formatPrice(p.price) + '</div>' +
        '<div class="product-detail__actions">' + actionsHtml + '</div>' +
        '<p>В наличии: ' + p.stock + ' шт.</p>' +
      '</div>' +
    '</div>';

  if (p.stock > 0) {
    const qtyInput = qs('#qty-input');
    qs('#qty-minus').addEventListener('click', () => qtyInput.value = Math.max(1, Number(qtyInput.value) - 1));
    qs('#qty-plus').addEventListener('click', () => qtyInput.value = Math.min(p.stock, Number(qtyInput.value) + 1));
    qtyInput.addEventListener('change', () => {
      let val = Number(qtyInput.value);
      if (isNaN(val) || val < 1) val = 1;
      if (val > p.stock) { val = p.stock; toast('На складе осталось только ' + p.stock + ' шт.', 'info'); }
      qtyInput.value = val;
    });
    qs('#add-btn').addEventListener('click', () => addToCart(p.id, Number(qtyInput.value)));
  }
});