'use strict';
window.BASE = window.BASE || '';

function renderHeader() {
  const header = qs('#header');
  if (!header) return;
  const user = getCurrentUser();
  
  const adminLink = isAdmin()
    ? '<a href="' + BASE + 'admin/dashboard.html">Админ-панель</a>'
    : '';
    
  const authHtml = user
    ? '<span class="user-name">' + escapeHtml(user.login) + '</span>' +
      '<button class="btn btn--ghost btn--sm" id="logout-btn">Выйти</button>'
    : '<a href="' + BASE + 'login.html" class="btn btn--ghost btn--sm">Вход</a>' +
      '<a href="' + BASE + 'register.html" class="btn btn--primary btn--sm">Регистрация</a>';

  header.innerHTML =
    '<header class="header">' +
      '<div class="container header__inner">' +
        '<a href="' + BASE + 'index.html" class="logo">Кофейня</a>' +
        '<nav class="nav" id="nav">' +
          '<a href="' + BASE + 'catalog.html">Каталог</a>' +
          '<a href="' + BASE + 'blog.html">Блог</a>' +
          adminLink +
        '</nav>' +
        '<div class="header__actions">' +
          '<a href="' + BASE + 'cart.html" class="cart-link">Корзина <span id="cart-badge" class="cart-badge">0</span></a>' +
          authHtml +
        '</div>' +
      '</div>' +
    '</header>';

  const logoutBtn = qs('#logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', function () { logout(); location.reload(); });
}

function renderFooter() {
  const footer = qs('#footer');
  if (!footer) return;
  footer.innerHTML = 
    '<footer class="footer">' +
      '<div class="container">' +
        '<div style="font-family: var(--font-heading); font-size: 24px; color: var(--c-text); margin-bottom: 8px;">Кофейня</div>' +
        '<div>© 2024 Учебный проект. Все права защищены.</div>' +
      '</div>' +
    '</footer>';
}

document.addEventListener('DOMContentLoaded', async function () {
  if (typeof loadDatabase === 'function') {
    await loadDatabase();
  }
  renderHeader();
  renderFooter();
  updateCartBadge();
  document.dispatchEvent(new Event('dbLoaded'));
});