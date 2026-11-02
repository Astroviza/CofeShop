'use strict';

function showReceipt(order) {
  const root = qs('#checkout-root');
  const itemsHtml = order.items.map(i => 
    '<tr><td>' + escapeHtml(i.name) + '</td><td>' + i.qty + '</td><td>' + formatPrice(i.price) + '</td><td>' + formatPrice(i.price * i.qty) + '</td></tr>'
  ).join('');
  
  root.innerHTML =
    '<div class="receipt" id="receipt">' +
      '<div class="receipt__head">' +
        '<div class="receipt__logo">☕ Coffee House</div>' +
        '<div>Чек № ' + escapeHtml(order.receiptId) + '</div>' +
        '<div>' + new Date(order.date).toLocaleString('ru-RU') + '</div>' +
      '</div>' +
      '<table class="receipt__table">' +
        '<thead><tr><th>Товар</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead>' +
        '<tbody>' + itemsHtml + '</tbody>' +
      '</table>' +
      '<div class="receipt__total">Итого: <strong>' + formatPrice(order.total) + '</strong></div>' +
      '<div class="receipt__customer">' +
        '<div>Получатель: ' + escapeHtml(order.customerName) + '</div>' +
        '<div>Телефон: ' + escapeHtml(order.customerPhone) + '</div>' +
        '<div>Адрес: ' + escapeHtml(order.customerAddress) + '</div>' +
        '<div>Оплата: ' + escapeHtml(order.customerPayment) + '</div>' +
      '</div>' +
      '<div class="receipt__actions">' +
        '<button class="btn" onclick="window.print()">Распечатать</button>' +
        '<a href="catalog.html" class="btn">В каталог</a>' +
      '</div>' +
    '</div>';
  toast('Заказ оформлен!', 'success');
}

document.addEventListener('dbLoaded', function () {
  const root = qs('#checkout-root');
  if (!root) return;
  if (!getCart().length) {
    root.innerHTML = '<div class="empty-state"><p>Корзина пуста</p><a href="catalog.html" class="btn">В каталог</a></div>';
    return;
  }
  
  const user = getCurrentUser();
  root.innerHTML =
    '<form class="checkout" id="checkout-form">' +
      '<div class="checkout__main">' +
        '<h2>Данные получателя</h2>' +
        '<label class="field"><span>Имя*</span><input name="name" required value="' + (user ? escapeHtml(user.login) : '') + '"></label>' +
        '<label class="field"><span>Email*</span><input type="email" name="email" required></label>' +
        '<label class="field"><span>Телефон*</span><input name="phone" required></label>' +
        '<h2>Доставка</h2>' +
        '<label class="field"><span>Адрес*</span><input name="address" required></label>' +
        '<label class="field"><span>Способ оплаты</span>' +
          '<select name="payment">' +
            '<option>Картой онлайн</option><option>Наличными</option><option>СБП</option>' +
          '</select>' +
        '</label>' +
      '</div>' +
      '<div class="checkout__summary" id="checkout-summary"></div>' +
    '</form>';

  function renderSummary() {
    const cart = getCart();
    const rows = cart.map(i => {
      const p = PRODUCTS.find(x => x.id === i.id);
      return p ? '<div class="cart-summary__row"><span>' + escapeHtml(p.name) + ' × ' + i.qty + '</span><span>' + formatPrice(p.price * i.qty) + '</span></div>' : '';
    }).join('');
    
    qs('#checkout-summary').innerHTML =
      '<h2>Ваш заказ</h2>' + rows +
      '<div class="cart-summary__row cart-summary__total"><span>Итого:</span><span>' + formatPrice(cartTotal()) + '</span></div>' +
      '<button type="submit" class="btn btn--primary btn--block">Оформить</button>';
  }
  renderSummary();

  qs('#checkout-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const cart = getCart();
    
    const orderPayload = {
      receiptId: generateReceiptNumber(),
      date: new Date().toISOString(),
      customerName: data.name,
      customerPhone: data.phone,
      customerAddress: data.address,
      customerPayment: data.payment,
      total: cartTotal(),
      items: cart.map(function (i) {
        const p = PRODUCTS.find(x => x.id === i.id);
        return { id: i.id, name: p.name, price: p.price, qty: i.qty };
      })
    };

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      if (res.ok) {
        saveCart([]);
        showReceipt(orderPayload);
      } else {
        toast('Ошибка заказа', 'error');
      }
    } catch (err) {
      toast('Сервер недоступен', 'error');
    }
  });
});