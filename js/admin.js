'use strict';

/* ===== Товары ===== */
document.addEventListener('dbLoaded', function () {
  const root = qs('#admin-products');
  if (!root) return;
  if (!requireAdminOrRedirect()) return;

  let editingId = null;

  function render() {
    root.innerHTML =
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;"><h2>Товары (' + PRODUCTS.length + ')</h2><button class="btn btn--primary btn--sm" id="add-product">Добавить товар</button></div>' +
      '<div class="table-wrap"><table><thead><tr><th>Фото</th><th>Название</th><th>Категория</th><th>Цена</th><th>Склад</th><th>Действия</th></tr></thead><tbody>' +
      PRODUCTS.map(p => 
        '<tr>' +
          '<td><img src="' + (window.BASE || '') + escapeHtml(p.image || '') + '" style="height:40px;width:40px;object-fit:contain;"></td>' +
          '<td>' + escapeHtml(p.name) + '</td><td>' + escapeHtml(p.category) + '</td><td>' + formatPrice(p.price) + '</td><td>' + p.stock + '</td>' +
          '<td><div class="table__actions">' +
            '<button class="btn btn--ghost btn--sm" data-edit="' + p.id + '">Ред.</button>' +
            '<button class="btn btn--danger btn--sm" data-delete="' + p.id + '">Удал.</button>' +
          '</div></td>' +
        '</tr>'
      ).join('') +
      '</tbody></table></div><div id="product-form-wrap"></div>';

    qs('#add-product').addEventListener('click', () => openForm());
    qsa('[data-edit]', root).forEach(b => b.addEventListener('click', () => openForm(Number(b.dataset.edit))));
    qsa('[data-delete]', root).forEach(b => {
      b.addEventListener('click', async () => {
        if (!confirm('Удалить товар?')) return;
        await fetch(`${API_URL}/products/${b.dataset.delete}`, { method: 'DELETE' });
        location.reload();
      });
    });
  }

  function openForm(id) {
    editingId = id || null;
    const p = id ? PRODUCTS.find(x => x.id === id) : { name: '', description: '', price: 0, category: 'coffee', stock: 0, image: 'icons/' };
      
    qs('#product-form-wrap').innerHTML =
      '<form class="panel form" id="product-form" style="margin-top:30px; border-top:1px solid #ccc; padding-top:20px;">' +
        '<h3 style="margin-bottom:20px;">' + (id ? 'Редактирование' : 'Новый') + ' товар</h3>' +
        '<label class="field"><span>Название</span><input name="name" required value="' + escapeHtml(p.name) + '"></label>' +
        '<label class="field"><span>Описание</span><textarea name="description" rows="2">' + escapeHtml(p.description) + '</textarea></label>' +
        '<label class="field"><span>Цена</span><input type="number" name="price" required min="0" value="' + p.price + '"></label>' +
        '<label class="field"><span>Категория</span><select name="category">' +
            ['coffee', 'drinks', 'desserts', 'bakery'].map(c => '<option value="' + c + '"' + (c === p.category ? ' selected' : '') + '>' + c + '</option>').join('') +
          '</select></label>' +
        '<label class="field"><span>Остаток</span><input type="number" name="stock" min="0" value="' + p.stock + '"></label>' +
        '<label class="field"><span>Путь к картинке (напр. icons/latte.webp)</span><input name="image" value="' + escapeHtml(p.image || '') + '"></label>' +
        '<div class="form__actions"><button type="submit" class="btn btn--primary">Сохранить</button><button type="button" class="btn btn--ghost" id="cancel-form">Отмена</button></div>' +
      '</form>';

    qs('#cancel-form').addEventListener('click', () => qs('#product-form-wrap').innerHTML = '');
    
    qs('#product-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      const payload = { name: data.name, description: data.description, price: Number(data.price), category: data.category, stock: Number(data.stock), image: data.image };
      
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/products/${editingId}` : `${API_URL}/products`;
      
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) location.reload();
      else toast('Ошибка сохранения', 'error');
    });
  }
  render();
});

/* ===== Блог ===== */
document.addEventListener('dbLoaded', function () {
  const root = qs('#admin-content');
  if (!root) return;
  if (!requireAdminOrRedirect()) return;

  let editingId = null;

  function render() {
    root.innerHTML =
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;"><h2>Статьи (' + POSTS.length + ')</h2><button class="btn btn--primary btn--sm" id="add-post">Добавить статью</button></div>' +
      '<div class="table-wrap"><table><thead><tr><th>ID</th><th>Заголовок</th><th>Автор</th><th>Дата</th><th>Действия</th></tr></thead><tbody>' +
      POSTS.map(p => 
        '<tr><td>' + p.id + '</td><td>' + escapeHtml(p.title) + '</td><td>' + escapeHtml(p.author) + '</td><td>' + new Date(p.date).toLocaleDateString('ru-RU') + '</td>' +
        '<td><div class="table__actions">' +
          '<button class="btn btn--ghost btn--sm" data-edit="' + p.id + '">Ред.</button>' +
          '<button class="btn btn--danger btn--sm" data-delete="' + p.id + '">Удал.</button>' +
        '</div></td></tr>'
      ).join('') +
      '</tbody></table></div><div id="post-form-wrap"></div>';

    qs('#add-post').addEventListener('click', () => openForm());
    qsa('[data-edit]', root).forEach(b => b.addEventListener('click', () => openForm(Number(b.dataset.edit))));
    qsa('[data-delete]', root).forEach(b => {
      b.addEventListener('click', async () => {
        if (!confirm('Удалить статью?')) return;
        await fetch(`${API_URL}/posts/${b.dataset.delete}`, { method: 'DELETE' });
        location.reload();
      });
    });
  }

  function openForm(id) {
    editingId = id || null;
    const p = id ? POSTS.find(x => x.id === id) : { title: '', author: 'Редакция', date: new Date().toISOString().slice(0, 10), excerpt: '', content: '' };
    
    qs('#post-form-wrap').innerHTML =
      '<form class="panel form" id="post-form" style="margin-top:30px; border-top:1px solid #ccc; padding-top:20px;">' +
        '<h3 style="margin-bottom:20px;">' + (id ? 'Редактирование' : 'Новая') + ' статья</h3>' +
        '<label class="field"><span>Заголовок</span><input name="title" required value="' + escapeHtml(p.title) + '"></label>' +
        '<label class="field"><span>Автор</span><input name="author" value="' + escapeHtml(p.author) + '"></label>' +
        '<label class="field"><span>Дата</span><input type="date" name="date" value="' + p.date.slice(0, 10) + '"></label>' +
        '<label class="field"><span>Краткое описание</span><textarea name="excerpt" rows="2">' + escapeHtml(p.excerpt) + '</textarea></label>' +
        '<label class="field"><span>Текст</span><textarea name="content" rows="6">' + escapeHtml(p.content) + '</textarea></label>' +
        '<div class="form__actions"><button type="submit" class="btn btn--primary">Сохранить</button><button type="button" class="btn btn--ghost" id="cancel-form">Отмена</button></div>' +
      '</form>';

    qs('#cancel-form').addEventListener('click', () => qs('#post-form-wrap').innerHTML = '');
    
    qs('#post-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      const payload = { title: data.title, author: data.author, date: data.date, excerpt: data.excerpt, content: data.content };
      
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/posts/${editingId}` : `${API_URL}/posts`;
      
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) location.reload();
    });
  }
  render();
});

/* ===== Заказы ===== */
document.addEventListener('dbLoaded', async function () {
  const root = qs('#admin-orders');
  if (!root) return;
  if (!requireAdminOrRedirect()) return;

  async function renderOrders() {
    const res = await fetch(`${API_URL}/orders`);
    const orders = await res.json();

    if (!orders.length) {
      root.innerHTML = '<p>Заказов нет.</p>';
      return;
    }

    root.innerHTML = 
      '<div style="margin-bottom:20px;"><h2>Всего заказов: ' + orders.length + '</h2></div>' +
      '<div class="table-wrap"><table><thead><tr><th>Чек №</th><th>Дата</th><th>Покупатель</th><th>Сумма</th><th>Состав</th><th>Действия</th></tr></thead><tbody>' +
      orders.map(o => {
        const itemsStr = o.items.map(i => escapeHtml(i.name) + ' x ' + i.qty).join(', ');
        return '<tr>' +
          '<td>' + escapeHtml(o.receiptId) + '</td><td>' + new Date(o.date).toLocaleString('ru-RU') + '</td>' +
          '<td>' + escapeHtml(o.customerName) + '<br><small>' + escapeHtml(o.customerPhone) + '</small></td>' +
          '<td>' + formatPrice(o.total) + '</td><td style="font-size:12px;">' + itemsStr + '</td>' +
          '<td><div class="table__actions">' +
            '<button class="btn btn--danger btn--sm" data-delete-order="' + o.id + '">Удал.</button>' +
          '</div></td>' +
        '</tr>';
      }).join('') +
      '</tbody></table></div>';

    qsa('[data-delete-order]', root).forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Удалить заказ?')) return;
        await fetch(`${API_URL}/orders/${btn.dataset.deleteOrder}`, { method: 'DELETE' });
        renderOrders();
      });
    });
  }

  renderOrders();
});