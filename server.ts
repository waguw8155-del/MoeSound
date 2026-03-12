import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import Database from 'better-sqlite3';
import fs from 'fs';
import { OAuth2Client } from 'google-auth-library';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const __dirname = path.resolve();
const JWT_SECRET = process.env.JWT_SECRET || 'soundwave-secret-key-123';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const uploadDir = path.join(__dirname, 'public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const db = new Database('music.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    genre TEXT,
    cover_url TEXT,
    audio_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS shop_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    image_url TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use('/uploads', express.static(uploadDir));

  const oauth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET
  );

  // Helper to get user from JWT
  const getUserFromToken = (token: string) => {
    try {
      return jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return null;
    }
  };

  // API Routes
  app.get('/api/auth/google/url', (req, res) => {
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google Client ID not configured' });
    }
    
    let protocol = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('host');
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      protocol = 'https';
    }
    const baseUrl = process.env.APP_URL || `${protocol}://${host}`;
    const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/auth/google/callback`;
    
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      redirect_uri: redirectUri
    });
    res.json({ url });
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    let protocol = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('host');
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      protocol = 'https';
    }
    const baseUrl = process.env.APP_URL || `${protocol}://${host}`;
    const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/auth/google/callback`;

    try {
      const { tokens } = await oauth2Client.getToken({
        code: code as string,
        redirect_uri: redirectUri
      });
      oauth2Client.setCredentials(tokens);

      const userInfoResponse = await oauth2Client.request({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo'
      });
      const userInfo = userInfoResponse.data as any;

      const userToken = jwt.sign({
        id: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture
      }, JWT_SECRET, { expiresIn: '7d' });

      res.cookie('auth_token', userToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>認証に成功しました。このウィンドウは自動的に閉じます。</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('OAuth error:', error);
      res.status(500).send('Authentication failed');
    }
  });

  app.get('/api/auth/me', (req, res) => {
    const token = req.cookies.auth_token;
    const user = getUserFromToken(token);
    res.json(user);
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    res.json({ success: true });
  });

  // Messaging Routes
  app.get('/api/messages', (req, res) => {
    const token = req.cookies.auth_token;
    const user = getUserFromToken(token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE sender_id = ? OR receiver_id = ? 
      ORDER BY created_at ASC
    `).all(user.id, user.id);
    res.json(messages);
  });

  app.post('/api/messages', (req, res) => {
    const token = req.cookies.auth_token;
    const user = getUserFromToken(token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { receiver_id, content } = req.body;
    if (!receiver_id || !content) return res.status(400).json({ error: 'Missing fields' });

    const stmt = db.prepare('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)');
    const result = stmt.run(user.id, receiver_id, content);
    res.json({ id: result.lastInsertRowid, sender_id: user.id, receiver_id, content });
  });

  app.get('/api/users', (req, res) => {
    // In a real app, we'd have a users table. 
    // For this demo, we'll return some mock users to message.
    res.json([
      { id: 'mock-1', name: 'ひなた', picture: 'https://picsum.photos/seed/anime-girl-1/100/100' },
      { id: 'mock-2', name: 'あおい', picture: 'https://picsum.photos/seed/anime-girl-2/100/100' },
      { id: 'mock-3', name: 'こころ', picture: 'https://picsum.photos/seed/anime-girl-3/100/100' },
    ]);
  });

  // Blog Routes
  app.get('/api/blogs', (req, res) => {
    const blogs = db.prepare('SELECT * FROM blogs ORDER BY created_at DESC').all();
    res.json(blogs);
  });

  app.post('/api/blogs', upload.single('image'), (req: any, res: any) => {
    const token = req.cookies.auth_token;
    const user = getUserFromToken(token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { title, content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : `https://picsum.photos/seed/${title}/600/400`;

    const stmt = db.prepare('INSERT INTO blogs (user_id, user_name, title, content, image_url) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(user.id, user.name, title, content, imageUrl);
    res.json({ id: result.lastInsertRowid, title, content, imageUrl, user_name: user.name });
  });

  // Shop Routes
  app.get('/api/shop-items', (req, res) => {
    const items = db.prepare('SELECT * FROM shop_items ORDER BY created_at DESC').all();
    res.json(items);
  });

  app.post('/api/shop-items', upload.single('image'), (req: any, res: any) => {
    const token = req.cookies.auth_token;
    const user = getUserFromToken(token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { name, price, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : `https://picsum.photos/seed/${name}/400/400`;

    const stmt = db.prepare('INSERT INTO shop_items (user_id, user_name, name, price, image_url, description) VALUES (?, ?, ?, ?, ?, ?)');
    const result = stmt.run(user.id, user.name, name, parseInt(price), imageUrl, description);
    res.json({ id: result.lastInsertRowid, name, price, imageUrl, user_name: user.name });
  });

  app.get('/api/tracks', (req, res) => {
    const tracks = db.prepare('SELECT * FROM tracks ORDER BY created_at DESC').all();
    res.json(tracks);
  });

  app.post('/api/tracks', upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]), (req: any, res: any) => {
    const token = req.cookies.auth_token;
    const user = getUserFromToken(token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const files = req.files as { [fieldname: string]: any[] };
    const { title, artist, genre } = req.body;

    if (!files.audio?.[0]) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const audioUrl = `/uploads/${files.audio[0].filename}`;
    const coverUrl = files.cover?.[0] 
      ? `/uploads/${files.cover[0].filename}` 
      : `https://picsum.photos/seed/${title}/400/400`;

    const stmt = db.prepare('INSERT INTO tracks (title, artist, genre, cover_url, audio_url) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(title, artist, genre, coverUrl, audioUrl);

    res.json({ id: result.lastInsertRowid, title, artist, genre, coverUrl, audioUrl });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
