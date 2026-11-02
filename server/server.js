const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// --- АВТОРИЗАЦИЯ ---
app.post('/api/login', (req, res) => {
  const { login, password } = req.body;
  db.get(`SELECT * FROM users WHERE login = ? AND password = ?`, [login, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) res.json({ login: row.login, role: row.role });
    else res.status(401).json({ error: 'Неверный логин или пароль' });
  });
});

app.post('/api/register', (req, res) => {
  const { login, password } = req.body;
  db.run(`INSERT INTO users (login, password) VALUES (?, ?)`, [login, password], function(err) {
    if (err) return res.status(400).json({ error: 'Логин уже занят' });
    res.json({ login, role: 'user' });
  });
});

// --- ТОВАРЫ ---
app.get('/api/products', (req, res) => {
  db.all(`SELECT * FROM products`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/products', (req, res) => {
  const { name, description, price, category, stock, image, featured } = req.body;
  db.run(`INSERT INTO products (name, description, price, category, stock, image, featured) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, description, price, category, stock, image, featured || 0], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
  });
});

app.put('/api/products/:id', (req, res) => {
  const { name, description, price, category, stock, image } = req.body;
  db.run(`UPDATE products SET name=?, description=?, price=?, category=?, stock=?, image=? WHERE id=?`,
    [name, description, price, category, stock, image, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
  });
});

app.delete('/api/products/:id', (req, res) => {
  db.run(`DELETE FROM products WHERE id = ?`, req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- БЛОГ ---
app.get('/api/posts', (req, res) => {
  db.all(`SELECT * FROM posts`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/posts', (req, res) => {
  const { title, author, date, excerpt, content } = req.body;
  db.run(`INSERT INTO posts (title, author, date, excerpt, content) VALUES (?, ?, ?, ?, ?)`,
    [title, author, date, excerpt, content], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
  });
});

app.put('/api/posts/:id', (req, res) => {
  const { title, author, date, excerpt, content } = req.body;
  db.run(`UPDATE posts SET title=?, author=?, date=?, excerpt=?, content=? WHERE id=?`,
    [title, author, date, excerpt, content, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
  });
});

app.delete('/api/posts/:id', (req, res) => {
  db.run(`DELETE FROM posts WHERE id = ?`, req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- ЗАКАЗЫ ---
app.post('/api/orders', (req, res) => {
  const { receiptId, date, customerName, customerPhone, customerAddress, customerPayment, total, items } = req.body;
  
  db.run(`INSERT INTO orders (receiptId, date, customerName, customerPhone, customerAddress, customerPayment, total, itemsJson) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [receiptId, date, customerName, customerPhone, customerAddress, customerPayment, total, JSON.stringify(items)], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      items.forEach(item => {
        db.run(`UPDATE products SET stock = stock - ? WHERE id = ?`, [item.qty, item.id]);
      });
      
      res.json({ success: true });
  });
});

app.get('/api/orders', (req, res) => {
  db.all(`SELECT * FROM orders ORDER BY date DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    rows = rows.map(r => {
      return { 
        ...r, 
        items: JSON.parse(r.itemsJson),
        customer: { name: r.customerName, phone: r.customerPhone, address: r.customerAddress, payment: r.customerPayment }
      };
    });
    res.json(rows);
  });
});

app.delete('/api/orders/:id', (req, res) => {
  db.run(`DELETE FROM orders WHERE id = ?`, req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});