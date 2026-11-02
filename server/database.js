const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'coffee.db'), (err) => {
  if (err) console.error(err.message);
  else console.log('✅ Подключено к базе данных SQLite');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT UNIQUE, password TEXT, role TEXT DEFAULT 'user')`);
  db.run(`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, price REAL, category TEXT, stock INTEGER, image TEXT, featured INTEGER DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, author TEXT, date TEXT, excerpt TEXT, content TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, receiptId TEXT UNIQUE, date TEXT, customerName TEXT, customerPhone TEXT, customerAddress TEXT, customerPayment TEXT, total REAL, itemsJson TEXT)`);

  db.get(`SELECT COUNT(*) AS count FROM users`, (err, row) => {
    if (row && row.count === 0) {
      db.run(`INSERT INTO users (login, password, role) VALUES ('admin', 'admin123', 'admin')`);
      db.run(`INSERT INTO users (login, password, role) VALUES ('user', 'user123', 'user')`);
    }
  });
  
  db.get(`SELECT COUNT(*) AS count FROM products`, (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare(`INSERT INTO products (name, description, price, category, stock, image, featured) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      stmt.run('Эспрессо', 'Классический крепкий эспрессо из свежеобжаренных зёрен.', 150, 'coffee', 100, 'icons/espresso-coffee-cutout-free-png.webp', 1);
      stmt.run('Американо', 'Эспрессо с добавлением горячей воды — мягкий и насыщенный.', 170, 'coffee', 100, 'icons/pngtree-americano-coffee-png-image_13404145.png', 0);
      stmt.run('Капучино', 'Эспрессо с бархатистой молочной пенкой.', 220, 'coffee', 80, 'icons/cup-of-cappuccino-isolated-on-transparent-background-png.webp', 1);
      stmt.run('Латте', 'Нежный кофейно-молочный напиток с тонкой пенкой.', 240, 'coffee', 80, 'icons/latte-coffee-isolated-illustration-ai-generative-free-png.webp', 1);
      stmt.run('Раф', 'Сливки, эспрессо и ванильный сахар — нежный и сладкий.', 260, 'coffee', 60, 'icons/raf.jpg', 0);
      stmt.run('Мокка', 'Эспрессо с шоколадом и молоком.', 260, 'coffee', 60, 'icons/mocha.jpg', 0);
      stmt.run('Флэт уайт', 'Двойной эспрессо с небольшим количеством молока.', 230, 'coffee', 70, 'icons/23596624.jpg', 0);
      stmt.run('Матча-латте', 'Японский зелёный чай матча с молоком.', 250, 'drinks', 50, 'icons/ef7132d737b612e004a5da56862690ad.png', 0);
      stmt.run('Чизкейк', 'Классический нежный чизкейк с ягодным соусом.', 320, 'desserts', 30, 'icons/pngtree-cheesecake-png-with-ai-generated-png-image_14589506.png', 1);
      stmt.run('Тирамису', 'Итальянский десерт с кофе и маскарпоне.', 350, 'desserts', 20, 'icons/delicious-tiramisu-dessert-png.webp', 0);
      stmt.run('Круассан', 'Свежий хрустящий круассан с маслом.', 180, 'bakery', 40, 'icons/croissant-with-ai-generated-free-png.webp', 0);
      stmt.run('Корица-ролл', 'Мягкая булочка с корицей и сливочной глазурью.', 200, 'bakery', 35, 'icons/cinnamon-roll-isolated-on-transparent-background-png.webp', 0);
      stmt.finalize();
    }
  });

  db.get(`SELECT COUNT(*) AS count FROM posts`, (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare(`INSERT INTO posts (title, author, date, excerpt, content) VALUES (?, ?, ?, ?, ?)`);
      stmt.run('История кофе: от Эфиопии до Европы', 'Редакция', '2024-09-15', 'Узнайте, как кофе прошёл путь от эфиопских гор до европейских кофеен.', 'Кофе — один из самых популярных напитков в мире. Его история началась в Эфиопии, где, по легенде, пастух по имени Калди заметил, что его козы становятся бодрыми после поедания красных ягод с одного куста.');
      stmt.run('Как заварить идеальный эспрессо дома', 'Бариста Алексей', '2024-09-22', 'Несколько правил, которые помогут получить достойный результат на бытовой кофемашине.', 'Идеальный эспрессо — это баланс между кислотностью, горечью и сладостью. И хотя в домашних условиях сложно повторить результат профессиональной кофемашины, есть несколько правил, которые помогут.');
      stmt.finalize();
    }
  });
});

module.exports = db;