'use strict';

const PRODUCTS = [];
const POSTS = [];
const API_URL = 'http://localhost:3000/api';

async function loadDatabase() {
  try {
    const [prodRes, postRes] = await Promise.all([
      fetch(`${API_URL}/products`),
      fetch(`${API_URL}/posts`)
    ]);
    
    if (prodRes.ok) {
      const data = await prodRes.json();
      PRODUCTS.length = 0;
      PRODUCTS.push(...data);
    }
    
    if (postRes.ok) {
      const data = await postRes.json();
      POSTS.length = 0;
      POSTS.push(...data);
    }
  } catch (err) {
    console.error('Ошибка загрузки данных:', err);
    if(typeof toast === 'function') toast('Сервер недоступен. Проверьте бэкенд.', 'error');
  }
}

function saveProducts() {}
function savePosts() {}