'use strict';
const USER_KEY = 'coffee_user';

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch (e) { return null; }
}
function setCurrentUser(u) {
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_KEY);
}
function isAdmin() {
  const u = getCurrentUser();
  return !!u && u.role === 'admin';
}
function requireAdminOrRedirect() {
  if (!isAdmin()) {
    location.href = (window.BASE || '') + 'login.html';
    return false;
  }
  return true;
}
function logout() { setCurrentUser(null); }

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = qs('#login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(loginForm).entries());
      
      try {
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
          toast('Добро пожаловать!', 'success');
          setTimeout(() => {
            location.href = isAdmin() ? (window.BASE || '') + 'admin/dashboard.html' : (window.BASE || '') + 'index.html';
          }, 350);
        } else {
          toast('Неверный логин или пароль', 'error');
        }
      } catch (err) {
        toast('Ошибка сервера', 'error');
      }
    });
  }

  const regForm = qs('#register-form');
  if (regForm) {
    regForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(regForm).entries());
      if (!data.login || !data.password) return;
      if (data.password !== data.password2) { toast('Пароли не совпадают', 'error'); return; }
      
      try {
        const res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: data.login.trim(), password: data.password })
        });
        
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
          toast('Аккаунт создан!', 'success');
          setTimeout(() => { location.href = (window.BASE || '') + 'index.html'; }, 350);
        } else {
          const err = await res.json();
          toast(err.error || 'Ошибка регистрации', 'error');
        }
      } catch (err) {
        toast('Ошибка сервера', 'error');
      }
    });
  }
});