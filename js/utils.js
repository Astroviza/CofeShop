'use strict';
window.BASE = window.BASE || '';

function qs(sel, root) { return (root || document).querySelector(sel); }
function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function formatPrice(n) {
  return new Intl.NumberFormat('ru-RU').format(n) + ' руб.';
}

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function toast(message, type) {
  let container = qs('#toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = 'toast toast--' + (type || 'info');
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('toast--hide');
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

// Заменили смайлик на текст
function productVisual(p) {
  if (p.image) {
    return '<div class="product-visual"><img src="' + (window.BASE || '') + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '" loading="lazy"></div>';
  }
  return '<div class="product-visual"><span style="color:#999;font-size:14px;">Нет фото</span></div>';
}

function generateReceiptNumber() {
  return 'ЧК-' + Date.now().toString().slice(-8) + '-' + Math.floor(Math.random() * 900 + 100);
}