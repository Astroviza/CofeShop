'use strict';
const CART_KEY = 'coffee_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function addToCart(id, qty) {
  qty = qty || 1;
  const p = PRODUCTS.find(x => x.id === id);
  if (!p || p.stock <= 0) { toast('Товар отсутствует на складе', 'error'); return; }

  const cart = getCart();
  const item = cart.find(i => i.id === id);
  const currentQty = item ? item.qty : 0;
  
  if (currentQty + qty > p.stock) {
    qty = p.stock - currentQty;
    if (qty > 0) toast('Добавлено максимум возможного (' + p.stock + ' шт.)', 'info');
    else { toast('В корзине уже максимум', 'error'); return; }
  } else {
    toast('Товар добавлен в корзину', 'success');
  }

  if (item) item.qty += qty; 
  else cart.push({ id: id, qty: qty });
  
  saveCart(cart);
}
function removeFromCart(id) { saveCart(getCart().filter(i => i.id !== id)); }
function updateCartQty(id, qty) {
  if (qty <= 0) { removeFromCart(id); return; }
  const p = PRODUCTS.find(x => x.id === id);
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item || !p) return;
  if (qty > p.stock) { qty = p.stock; toast('На складе только ' + p.stock + ' шт.', 'info'); }
  item.qty = qty;
  saveCart(cart);
}
function cartCount() { return getCart().reduce((s, i) => s + i.qty, 0); }
function cartTotal() {
  return getCart().reduce((s, i) => {
    const p = PRODUCTS.find(p => p.id === i.id);
    return s + (p ? p.price * i.qty : 0);
  }, 0);
}
function updateCartBadge() {
  const badge = qs('#cart-badge');
  if (badge) {
    const c = cartCount();
    badge.textContent = c;
    badge.classList.toggle('is-empty', c === 0);
  }
}

document.addEventListener('dbLoaded', function () {
  const root = qs('#cart-root');
  if (!root) return;

  function render() {
    const cart = getCart();
    if (!cart.length) {
      root.innerHTML = '<div class="empty-state"><p>Корзина пуста</p><a href="catalog.html" class="btn">Перейти в каталог</a></div>';
      return;
    }
    
    const rows = cart.map(function (item) {
      const p = PRODUCTS.find(x => x.id === item.id);
      if (!p) return '';
      const isMax = item.qty >= p.stock;
      const incDisabled = isMax ? 'disabled' : '';

      return '' +
        '<div class="cart-row" data-id="' + p.id + '">' +
          productVisual(p) +
          '<div class="cart-row__info">' +
            '<a href="product.html?id=' + p.id + '" class="cart-row__name">' + escapeHtml(p.name) + '</a>' +
            '<div class="cart-row__price">' + formatPrice(p.price) + ' <span>(в наличии: ' + p.stock + ')</span></div>' +
          '</div>' +
          '<div class="qty">' +
            '<button class="qty__btn" data-dec>−</button>' +
            '<input type="number" value="' + item.qty + '" min="1" data-qty>' +
            '<button class="qty__btn" data-inc ' + incDisabled + '>+</button>' +
          '</div>' +
          '<div class="cart-row__sum">' + formatPrice(p.price * item.qty) + '</div>' +
          '<button class="btn btn--danger btn--sm" data-remove>Удалить</button>' +
        '</div>';
    }).join('');
    
    root.innerHTML =
      '<div class="cart-list">' + rows + '</div>' +
      '<div class="cart-summary">' +
        '<div class="cart-summary__row"><span>Товаров:</span><span>' + cartCount() + '</span></div>' +
        '<div class="cart-summary__row cart-summary__total"><span>Итого:</span><span>' + formatPrice(cartTotal()) + '</span></div>' +
        '<a href="checkout.html" class="btn btn--primary btn--block">Оформить заказ</a>' +
        '<a href="catalog.html" class="btn btn--block">Продолжить покупки</a>' +
      '</div>';
      
    qsa('.cart-row', root).forEach(function (row) {
      const id = Number(row.dataset.id);
      row.querySelector('[data-dec]').addEventListener('click', function () {
        updateCartQty(id, Number(row.querySelector('[data-qty]').value) - 1);
        render();
      });
      row.querySelector('[data-inc]').addEventListener('click', function () {
        updateCartQty(id, Number(row.querySelector('[data-qty]').value) + 1);
        render();
      });
      row.querySelector('[data-qty]').addEventListener('change', function (e) {
        updateCartQty(id, Number(e.target.value) || 1);
        render();
      });
      row.querySelector('[data-remove]').addEventListener('click', function () {
        removeFromCart(id);
        render();
      });
    });
  }
  render();
});