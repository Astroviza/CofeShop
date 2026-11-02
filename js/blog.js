'use strict';

function postCardHtml(p) {
  return '' +
    '<article class="post-card">' +
      '<a href="blog-post.html?id=' + p.id + '" class="post-card__link">' +
        '<div class="post-card__body">' +
          '<div class="post-card__date">' + new Date(p.date).toLocaleDateString('ru-RU') + '</div>' +
          '<h3>' + escapeHtml(p.title) + '</h3>' +
          '<p>' + escapeHtml(p.excerpt) + '</p>' +
        '</div>' +
      '</a>' +
    '</article>';
}

function renderPostGrid(selector, posts) {
  const root = qs(selector);
  if (!root) return;
  if (!posts.length) { root.innerHTML = '<p>Статей пока нет</p>'; return; }
  root.innerHTML = posts.map(postCardHtml).join('');
}

document.addEventListener('dbLoaded', function () {
  const listRoot = qs('#blog-list');
  if (listRoot) renderPostGrid('#blog-list', POSTS);

  const postRoot = qs('#blog-post');
  if (postRoot) {
    const id = Number(getParam('id'));
    const p = POSTS.find(x => x.id === id);
    if (!p) { postRoot.innerHTML = '<p>Статья не найдена</p>'; return; }
    postRoot.innerHTML =
      '<article class="post-full">' +
        '<a href="blog.html">← Все статьи</a>' +
        '<h1>' + escapeHtml(p.title) + '</h1>' +
        '<div class="post-full__meta">' + new Date(p.date).toLocaleDateString('ru-RU') + ' · ' + escapeHtml(p.author) + '</div>' +
        '<div class="post-full__content">' +
          p.content.split('\n').map(l => '<p>' + escapeHtml(l) + '</p>').join('') +
        '</div>' +
      '</article>';
  }
});