'use strict';
window.BASE = window.BASE || '';

function renderSidebar() {
  const sidebar = qs('#sidebar');
  if (!sidebar) return;
  const user = getCurrentUser();
  
  const adminLink = isAdmin()
    ? '<a href="' + BASE + 'admin/dashboard.html">Админ-панель</a>'
    : '';
    
  const authHtml = user
    ? '<div style="margin-bottom:10px;">Пользователь:<br><b>' + escapeHtml(user.login) + '</b></div>' +
      '<button class="btn btn--block" id="logout-btn">Выйти</button>'
    : '<a href="' + BASE + 'login.html" class="btn btn--block">Вход</a>' +
      '<a href="' + BASE + 'register.html" class="btn btn--block">Регистрация</a>';

  sidebar.innerHTML =
    '<div class="logo"><a href="' + BASE + 'index.html">Кофейня</a></div>' +
    '<hr style="border:0;border-top:1px solid #000;margin:0 0 15px 0;">' +
    '<nav class="nav">' +
      '<a href="' + BASE + 'catalog.html">Каталог</a>' +
      '<a href="' + BASE + 'blog.html">Блог</a>' +
      '<a href="' + BASE + 'cart.html">Корзина (<span id="cart-badge">0</span>)</a>' +
      adminLink +
    '</nav>' +
    '<div class="auth-block">' + authHtml + '</div>';

  const logoutBtn = qs('#logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', function () { logout(); location.reload(); });
}

function renderFooter() {
  const footer = qs('#footer');
  if (!footer) return;
  footer.innerHTML = 
    '<footer style="border-top:1px solid #000; margin-top:40px; padding-top:10px; font-size:14px;">' +
      '<div>Кофейня. Учебный проект.</div>' +
    '</footer>';
}

document.addEventListener('DOMContentLoaded', async function () {
  if (typeof loadDatabase === 'function') {
    await loadDatabase();
  }
  renderSidebar();
  renderFooter();
  updateCartBadge();
  
  document.dispatchEvent(new Event('dbLoaded'));
});