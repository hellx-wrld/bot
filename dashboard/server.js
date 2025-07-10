/**
 * @openapi
 * /profile:
 *   get:
 *     summary: Get user profile (self-management)
 *     responses:
 *       200:
 *         description: User profile page
 *   post:
 *     summary: Update user profile (email, bio)
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
/**
 * @openapi
 * /api/user/stats:
 *   get:
 *     summary: Get user transaction statistics (last 30 days)
 *     responses:
 *       200:
 *         description: User stats JSON
 */
/**
 * @openapi
 * /admin/roles:
 *   get:
 *     summary: Get all user roles (admin only)
 *     responses:
 *       200:
 *         description: Role management page
 *   post:
 *     summary: Assign or delete user role (admin only)
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirect after action
 */
/**
 * @openapi
 * /admin/audit:
 *   get:
 *     summary: Get admin audit log (admin only)
 *     responses:
 *       200:
 *         description: Audit log page
 */
/**
 * @openapi
 * /payment/callback:
 *   post:
 *     summary: Payment gateway callback (for top up)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               amount:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Invalid
 */
// Admin: audit log viewer
app.get('/admin/audit', ensureAuth, async (req, res) => {
  if (getRole(req.user.id) !== 'admin')
    return res.status(403).send('Forbidden');
  const Log = require('../src/database/logModel');
  const logs = await Log.find({ type: /^admin_/ })
    .sort({ timestamp: -1 })
    .limit(100);
  let html =
    '<h2>Audit Log (Aksi Admin)</h2><table border="1"><tr><th>Waktu</th><th>User</th><th>Tipe</th><th>Detail</th></tr>';
  logs.forEach((l) => {
    html += `<tr><td>${new Date(l.timestamp).toLocaleString()}</td><td>${l.userId}</td><td>${l.type}</td><td>${l.detail}</td></tr>`;
  });
  html += '</table><a href="/admin">Back</a>';
  res.send(html);
});
const Role = require('../src/database/roleModel');
// Admin: kelola role user
app.get('/admin/roles', ensureAuth, async (req, res) => {
  if (getRole(req.user.id) !== 'admin')
    return res.status(403).send('Forbidden');
  const roles = await Role.find({});
  let html = '<h2>Role Management</h2><ul>';
  roles.forEach((r) => {
    html += `<li>User: ${r.userId} - Role: ${r.role} <form method="post" action="/admin/roles/delete" style="display:inline"><input type="hidden" name="id" value="${r._id}"><button type="submit">Hapus</button></form></li>`;
  });
  html += '</ul>';
  html += `<form method="post" action="/admin/roles/add">
    <input name="userId" placeholder="User ID" required>
    <select name="role"><option value="admin">admin</option><option value="moderator">moderator</option><option value="user">user</option></select>
    <button type="submit">Tambah/Assign</button>
  </form><a href="/admin">Back</a>`;
  res.send(html);
});

// Tambah/assign role
app.post('/admin/roles/add', ensureAuth, async (req, res) => {
  if (getRole(req.user.id) !== 'admin')
    return res.status(403).send('Forbidden');
  await Role.findOneAndUpdate(
    { userId: req.body.userId },
    { role: req.body.role },
    { upsert: true }
  );
  // Audit log
  const Log = require('../src/database/logModel');
  await Log.create({
    userId: req.user.id,
    type: 'admin_role_assign',
    detail: `Assign role ${req.body.role} to ${req.body.userId}`,
  });
  res.redirect('/admin/roles');
});

// Hapus role
app.post('/admin/roles/delete', ensureAuth, async (req, res) => {
  if (getRole(req.user.id) !== 'admin')
    return res.status(403).send('Forbidden');
  await Role.findByIdAndDelete(req.body.id);
  // Audit log
  const Log = require('../src/database/logModel');
  await Log.create({
    userId: req.user.id,
    type: 'admin_role_delete',
    detail: `Delete role id ${req.body.id}`,
  });
  res.redirect('/admin/roles');
});
// API statistik user (jumlah transaksi per hari, total pengeluaran/pemasukan)
app.get('/api/user/stats', ensureAuth, async (req, res) => {
  const Log = require('../src/database/logModel');
  const userId = req.user.id;
  // Ambil log transaksi 30 hari terakhir
  const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const logs = await Log.find({ userId, timestamp: { $gte: since } });
  // Hitung transaksi per hari
  const perDay = {};
  let totalIn = 0,
    totalOut = 0;
  logs.forEach((log) => {
    const day = new Date(log.timestamp).toISOString().slice(0, 10);
    if (!perDay[day]) perDay[day] = 0;
    perDay[day] += log.amount || 0;
    if ((log.amount || 0) > 0) totalIn += log.amount;
    if ((log.amount || 0) < 0) totalOut += log.amount;
  });
  res.json({ perDay, totalIn, totalOut, count: logs.length });
});
const express = require('express');
const mongoose = require('mongoose');
const User = require('../src/database/userModel');
const Level = require('../src/database/levelModel');
const Item = require('../src/database/itemModel');
const session = require('express-session');
const bodyParser = require('body-parser');
const getLocale = require('./locale');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const getRole = require('./roles');
const axios = require('axios');
const { spawn } = require('child_process');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const app = express();

const LANG = process.env.DASHBOARD_LANG || 'id';
const t = getLocale(LANG);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.DASHBOARD_ADMIN_PASS || 'flippysecret',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DASHBOARD_CALLBACK_URL,
      scope: ['identify', 'guilds'],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

function isAdmin(req) {
  return req.session && req.session.isAdmin;
}

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/discord');
}

function sendWebhook(content) {
  if (!process.env.DISCORD_WEBHOOK_URL) return;
  axios.post(process.env.DISCORD_WEBHOOK_URL, { content }).catch(() => {});
}

// Bootstrap untuk mobile friendly
app.use((req, res, next) => {
  res.bootstrap =
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">';
  next();
});

// Contoh penggunaan di halaman utama
app.get('/', (req, res) => {
  res.send(
    `${res.bootstrap}<div class='container'><h1>Flippy Flip Bot Dashboard</h1><ul><li><a href="/leaderboard">Leaderboard</a></li><li><a href="/users">User List</a></li><li><a href='/topup'>Top Up</a></li><li><a href='/subscribe'>Subscription</a></li></ul></div>`
  );
});

app.get('/leaderboard', (req, res) => {
  User.find({})
    .sort({ balance: -1 })
    .limit(10)
    .then((users) => {
      let html = '<h2>Leaderboard Top 10</h2><ol>';
      users.forEach((u) => {
        html += `<li>${u.id} - ${u.balance} FC</li>`;
      });
      html += '</ol><a href="/">Back</a>';
      res.send(html);
    });
});

app.get('/users', (req, res) => {
  User.find({})
    .limit(50)
    .then((users) => {
      let html = '<h2>User List</h2><ul>';
      users.forEach((u) => {
        html += `<li>${u.id} - ${u.balance} FC</li>`;
      });
      html += '</ul><a href="/">Back</a>';
      res.send(html);
    });
});

app.get('/level/:id', (req, res) => {
  Level.findOne({ userId: req.params.id }).then((level) => {
    if (!level) return res.send('User not found');
    res.send(
      `<h2>Level Info</h2><p>User: ${level.userId}<br>Level: ${level.level}<br>XP: ${level.xp}</p><a href="/">Back</a>`
    );
  });
});

app.get('/login', (req, res) => {
  res.send(
    '<form method="post"><input type="password" name="pass" placeholder="Admin Password"/><button type="submit">Login</button></form>'
  );
});

app.post('/login', (req, res) => {
  if (req.body.pass === process.env.DASHBOARD_ADMIN_PASS) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }
  res.send('Password salah! <a href="/login">Coba lagi</a>');
});

app.get('/admin', (req, res) => {
  if (!isAdmin(req)) return res.redirect('/login');
  const role = req.user ? getRole(req.user.id) : 'user';
  let html = `<h2>Admin Panel (${role})</h2><ul>`;
  if (role === 'admin') {
    html += '<li><a href="/admin/items">Kelola Item Shop</a></li>';
    html += '<li><a href="/admin/roles">Role Management</a></li>';
    html += '<li><a href="/admin/audit">Audit Log</a></li>';
  }
  html += '</ul><a href="/">Back</a>';
  res.send(html);
});

// CRUD Item Shop
app.get('/admin/items', async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/login');
  const items = await Item.find({});
  let html = '<h2>Kelola Item Shop</h2><ul>';
  items.forEach((i) => {
    html += `<li>${i.name} - ${i.price} FC - Kategori: ${i.category || '-'} - Stok: ${i.stock ?? 0} <a href="/admin/items/edit/${i._id}">Edit</a> <a href="/admin/items/delete/${i._id}">Delete</a></li>`;
  });
  html +=
    '</ul><form method="post" action="/admin/items/add">' +
    '<input name="name" placeholder="Nama" required>' +
    '<input name="price" type="number" placeholder="Harga" required>' +
    '<input name="description" placeholder="Deskripsi">' +
    '<input name="category" placeholder="Kategori">' +
    '<input name="stock" type="number" placeholder="Stok" min="0">' +
    '<button type="submit">Tambah</button></form><a href="/admin">Back</a>';
  res.send(html);
});

app.post('/admin/items/add', async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/login');
  const item = await Item.create({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    category: req.body.category,
    stock: req.body.stock,
  });
  sendWebhook(`[ADMIN] Item baru ditambah: ${item.name} (${item.price} FC)`);
  res.redirect('/admin/items');
});

app.get('/admin/items/edit/:id', async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/login');
  const item = await Item.findById(req.params.id);
  if (!item) return res.send('Item tidak ditemukan');
  res.send(`<form method="post">
    <input name="name" value="${item.name}" required>
    <input name="price" type="number" value="${item.price}" required>
    <input name="description" value="${item.description}">
    <input name="category" value="${item.category || ''}">
    <input name="stock" type="number" value="${item.stock ?? 0}">
    <button type="submit">Update</button>
  </form><a href="/admin/items">Back</a>`);
});

app.post('/admin/items/edit/:id', async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/login');
  await Item.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    category: req.body.category,
    stock: req.body.stock,
  });
  res.redirect('/admin/items');
});

app.get('/admin/items/delete/:id', async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/login');
  await Item.findByIdAndDelete(req.params.id);
  res.redirect('/admin/items');
});

app.get('/auth/discord', passport.authenticate('discord'));
app.get(
  '/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/me');
  }
);

app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

app.get('/me', ensureAuth, (req, res) => {
  res.send(`
    <h2>Halo, ${req.user.username}#${req.user.discriminator}</h2>
    <p>ID: ${req.user.id}</p>
    <a href='/profile'>Edit Profil</a> |
    <a href='/logout'>Logout</a>
  `);
});

// Halaman profil user (self-management)
app.get('/profile', ensureAuth, async (req, res) => {
  // Ambil data user dari database
  const user = await User.findOne({ id: req.user.id });
  res.send(`
    <h2>Edit Profil</h2>
    <form method="post">
      <label>Username: <input name="username" value="${req.user.username}" readonly></label><br>
      <label>Email: <input name="email" value="${user?.email || ''}"></label><br>
      <label>Bio: <input name="bio" value="${user?.bio || ''}"></label><br>
      <button type="submit">Simpan</button>
    </form>
    <hr>
    <h3>Statistik Transaksi 30 Hari Terakhir</h3>
    <canvas id="chart" width="400" height="200"></canvas>
    <div id="statinfo"></div>
    <a href="/me">Kembali</a>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      fetch('/api/user/stats').then(function(r){return r.json()}).then(function(data){
        var ctx = document.getElementById('chart').getContext('2d');
        var labels = Object.keys(data.perDay);
        var values = Object.values(data.perDay);
        new Chart(ctx, {
          type: 'bar',
          data: { labels: labels, datasets: [{ label: 'Transaksi (FC)', data: values, backgroundColor: '#4e73df' }] },
        });
        document.getElementById('statinfo').innerHTML = 'Total transaksi: ' + data.count + '<br>Total masuk: ' + data.totalIn + ' FC<br>Total keluar: ' + (-data.totalOut) + ' FC';
      });
    </script>
  `);
});

// Update profil user
app.post('/profile', ensureAuth, async (req, res) => {
  // Update email & bio user di database
  await User.updateOne(
    { id: req.user.id },
    { $set: { email: req.body.email, bio: req.body.bio } },
    { upsert: true }
  );
  res.send('Profil berhasil diperbarui! <a href="/me">Kembali</a>');
});

// Backup data (export koleksi users, items, dsb)
app.get('/admin/backup', ensureAuth, (req, res) => {
  if (getRole(req.user.id) !== 'admin')
    return res.status(403).send('Forbidden');
  // Halaman backup/restore: tombol download backup & upload restore
  res.send(`
    <h2>Backup & Restore Data</h2>
    <form method="get" action="/admin/backup/download">
      <button type="submit">Download Backup</button>
    </form>
    <form method="post" action="/admin/restore" enctype="multipart/form-data">
      <input type="file" name="backupfile" accept=".gz" required>
      <button type="submit">Restore Data</button>
    </form>
    <p><b>PERINGATAN:</b> Restore akan menimpa seluruh data database!</p>
    <a href="/admin">Back</a>
  `);
});

// Endpoint download backup (mongodump)
app.get('/admin/backup/download', ensureAuth, (req, res) => {
  if (getRole(req.user.id) !== 'admin')
    return res.status(403).send('Forbidden');
  const backup = spawn('mongodump', [
    '--uri',
    process.env.MONGO_URI,
    '--archive',
    '--gzip',
  ]);
  res.setHeader('Content-Disposition', 'attachment; filename=backup.gz');
  res.setHeader('Content-Type', 'application/gzip');
  backup.stdout.pipe(res);
});

// Restore data (upload file backup.gz)
app.post('/admin/restore', ensureAuth, (req, res) => {
  if (getRole(req.user.id) !== 'admin')
    return res.status(403).send('Forbidden');
  // Upload file backup.gz dan trigger mongorestore
  const formidable = require('formidable');
  const form = formidable({ multiples: false });
  form.parse(req, (err, fields, files) => {
    if (err || !files.backupfile) return res.send('Upload gagal');
    const filepath = files.backupfile.filepath || files.backupfile.path;
    const restore = spawn('mongorestore', [
      '--uri',
      process.env.MONGO_URI,
      '--archive=' + filepath,
      '--gzip',
      '--drop',
    ]);
    restore.on('close', (code) => {
      if (code === 0) {
        res.send('Restore berhasil! <a href="/admin">Back</a>');
      } else {
        res.send('Restore gagal. Pastikan file backup valid.');
      }
    });
  });
});

// Simulasi payment gateway & subscription
app.get('/topup', ensureAuth, (req, res) => {
  res.send(`
    <h2>Top Up FC</h2>
    <form method="post">
      <input name="amount" type="number" placeholder="Jumlah FC" required>
      <select name="method">
        <option value="qris">QRIS</option>
        <option value="dana">DANA</option>
      </select>
      <button type="submit">Top Up</button>
    </form>
    <p>Untuk integrasi payment gateway nyata (Xendit, Duitku, dsb),
    gunakan endpoint callback <code>/payment/callback</code> dan update saldo user setelah menerima notifikasi sukses.<br>
    Contoh implementasi callback ada di bawah.</p>
  `);
});

app.post('/topup', ensureAuth, async (req, res) => {
  // Simulasi: jika payment gateway nyata, redirect ke payment page atau generate QR
  const amount = parseInt(req.body.amount);
  const method = req.body.method;
  if (isNaN(amount) || amount <= 0) return res.send('Jumlah tidak valid');
  // Simulasi QRIS/DANA: tampilkan instruksi manual
  if (method === 'qris') {
    res.send(
      `<h2>Scan QRIS untuk pembayaran</h2><img src='https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=flippyqrisdemo' alt='QRIS'><br>Setelah bayar, admin akan memproses saldo.<br><a href='/me'>Kembali</a>`
    );
  } else if (method === 'dana') {
    res.send(
      `<h2>Transfer ke DANA 0812xxxxxxx</h2><p>Setelah transfer, konfirmasi ke admin.<br><a href='/me'>Kembali</a>`
    );
  } else {
    // fallback: langsung tambah saldo (simulasi)
    const User = require('../src/database/userModel');
    await User.updateOne({ id: req.user.id }, { $inc: { balance: amount } });
    sendWebhook(`[TOPUP] User ${req.user.id} top up ${amount} FC`);
    res.send('Top up berhasil! <a href="/me">Kembali</a>');
  }
  // Contoh endpoint callback payment gateway nyata (Xendit, Duitku, dsb)
  // POST /payment/callback
  // Body: { userId, amount, status }
  app.post('/payment/callback', async (req, res) => {
    // Validasi signature/token sesuai gateway
    // if (!isValidSignature(req)) return res.status(403).send('Forbidden');
    if (req.body.status === 'PAID' && req.body.userId && req.body.amount) {
      const User = require('../src/database/userModel');
      await User.updateOne(
        { id: req.body.userId },
        { $inc: { balance: req.body.amount } }
      );
      const Log = require('../src/database/logModel');
      await Log.create({
        userId: req.body.userId,
        type: 'payment_gateway',
        detail: `Top up via gateway: ${req.body.amount}`,
      });
      return res.send('OK');
    }
    res.status(400).send('Invalid');
  });
});

// Subscription
app.get('/subscribe', ensureAuth, (req, res) => {
  res.send(
    '<h2>Subscription</h2><form method="post"><select name="plan"><option value="basic">Basic</option><option value="pro">Pro</option></select><button type="submit">Subscribe</button></form>'
  );
});

app.post('/subscribe', ensureAuth, async (req, res) => {
  // Simulasi: simpan status subscription di session
  req.session.subscription = req.body.plan;
  sendWebhook(`[SUBSCRIPTION] User ${req.user.id} subscribe ${req.body.plan}`);
  res.send(
    'Subscription aktif! Benefit: bonus daily, badge, dsb. <a href="/me">Kembali</a>'
  );
});

// Analytics & insight
app.get('/admin/analytics', ensureAuth, async (req, res) => {
  if (getRole(req.user.id) !== 'admin')
    return res.status(403).send('Forbidden');
  const User = require('../src/database/userModel');
  const Log = require('../src/database/logModel');
  // User growth 30 hari terakhir
  const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const users = await User.find({});
  const logs = await Log.find({ timestamp: { $gte: since } });
  // User growth per hari
  const userGrowth = {};
  users.forEach((u) => {
    const day = new Date(parseInt(u._id.toString().substring(0, 8), 16) * 1000)
      .toISOString()
      .slice(0, 10);
    if (!userGrowth[day]) userGrowth[day] = 0;
    userGrowth[day]++;
  });
  // Transaksi per hari
  const txPerDay = {};
  logs.forEach((l) => {
    const day = new Date(l.timestamp).toISOString().slice(0, 10);
    if (!txPerDay[day]) txPerDay[day] = 0;
    txPerDay[day]++;
  });
  // Top spender
  const topSpender = users.sort((a, b) => b.balance - a.balance).slice(0, 5);
  // User paling aktif (paling banyak transaksi)
  const txByUser = {};
  logs.forEach((l) => {
    if (!txByUser[l.userId]) txByUser[l.userId] = 0;
    txByUser[l.userId]++;
  });
  const topActive = Object.entries(txByUser)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  res.send(`
    <h2>Analytics</h2>
    <canvas id="usergrowth" width="400" height="150"></canvas>
    <canvas id="txperday" width="400" height="150"></canvas>
    <h3>Top Spender</h3>
    <ul>${topSpender.map((u) => `<li>${u.id} - ${u.balance} FC</li>`).join('')}</ul>
    <h3>User Paling Aktif</h3>
    <ul>${topActive.map((u) => `<li>${u[0]} - ${u[1]} transaksi</li>`).join('')}</ul>
    <a href="/admin">Back</a>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      var ug = ${JSON.stringify(userGrowth)};
      var tx = ${JSON.stringify(txPerDay)};
      new Chart(document.getElementById('usergrowth').getContext('2d'), {
        type: 'line',
        data: { labels: Object.keys(ug), datasets: [{ label: 'User Growth', data: Object.values(ug), borderColor: '#36b9cc', fill: false }] }
      });
      new Chart(document.getElementById('txperday').getContext('2d'), {
        type: 'bar',
        data: { labels: Object.keys(tx), datasets: [{ label: 'Transaksi per Hari', data: Object.values(tx), backgroundColor: '#f6c23e' }] }
      });
    </script>
  `);
});

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flippy Flip Bot API',
      version: '1.0.0',
    },
  },
  apis: [__filename],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /leaderboard:
 *   get:
 *     summary: Get top 10 users by balance
 *     responses:
 *       200:
 *         description: List of users
 */
/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get user list
 *     responses:
 *       200:
 *         description: List of users
 */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Dashboard running on http://localhost:${PORT}`)
);
