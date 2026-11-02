'use strict';

document.addEventListener('dbLoaded', async function () {
  const root = qs('#admin-dashboard');
  if (!root) return;
  if (!requireAdminOrRedirect()) return;

  try {
    const res = await fetch(`${API_URL}/orders`);
    const orders = await res.json();
    
    if (!orders.length) {
      root.innerHTML = '<p>Нет заказов для статистики.</p>';
      return;
    }

    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const avg = revenue / orders.length;
    const productCounts = {};
    
    orders.forEach(o => o.items.forEach(it => productCounts[it.name] = (productCounts[it.name] || 0) + it.qty));
    const topProducts = Object.keys(productCounts).map(k => [k, productCounts[k]]).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topProduct = topProducts[0] ? topProducts[0][0] : '—';

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push({ key: d.toISOString().slice(0, 10), label: d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }), total: 0 });
    }
    orders.forEach(o => {
      const d = days.find(x => x.key === o.date.slice(0, 10));
      if (d) d.total += o.total;
    });

    root.innerHTML =
      '<div class="kpi-grid">' +
        '<div class="kpi"><div>Выручка</div><div><b>' + formatPrice(revenue) + '</b></div></div>' +
        '<div class="kpi"><div>Заказов</div><div><b>' + orders.length + '</b></div></div>' +
        '<div class="kpi"><div>Средний чек</div><div><b>' + formatPrice(Math.round(avg)) + '</b></div></div>' +
        '<div class="kpi"><div>Хит продаж</div><div><b>' + escapeHtml(topProduct) + '</b></div></div>' +
      '</div>' +
      '<div class="panel"><h3>Продажи за неделю</h3><canvas id="sales-chart" height="100"></canvas></div>';

    if (typeof Chart !== 'undefined') {
      new Chart(qs('#sales-chart'), {
        type: 'bar',
        data: {
          labels: days.map(d => d.label),
          datasets: [{ label: 'Выручка, ₽', data: days.map(d => d.total), backgroundColor: '#333' }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });
    }
  } catch (err) {
    root.innerHTML = '<p>Ошибка загрузки данных.</p>';
  }
});