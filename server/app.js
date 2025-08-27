const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const log4js = require('log4js');
const pool = require('./db');
const { generateToken, verifyToken } = require('./auth');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const logger = log4js.getLogger();
logger.level = 'info';

// /login
app.post('/login', async(req, res) => {
    const { email, password } = req.body || {};
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

    try {
        const [rows] = await pool.query(
            'SELECT id, email FROM users WHERE email = ? AND password = ? LIMIT 1', [email, password]
        );
        if (!rows || rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = rows[0];
        const token = generateToken({ id: user.id, email: user.email });

        // log login
        logger.info(JSON.stringify({ timestamp: new Date(), userId: user.id, action: 'login', ip }));

        // store token
        await pool.query('INSERT INTO tokens (user_id, token) VALUES (?, ?)', [user.id, token]);

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


app.post('/register', async(req, res) => {
    console.log('Register attempt:', req.body); // DEBUG
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

    try {
        await pool.query('INSERT INTO users (email,password) VALUES(?,?)', [email, password]);
        res.json({ message: 'User created successfully' });
    } catch (err) {
        res.status(400).json({ error: 'User already exists' })
    }
});

// /profile
app.get('/profile', async(req, res) => {
    const raw = req.headers['authorization'] || '';
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;

    const decoded = verifyToken(token);
    if (!decoded) return res.status(403).json({ error: 'Invalid token' });

    try {
        const [rows] = await pool.query('SELECT id, email FROM users WHERE id = ? LIMIT 1', [decoded.id]);
        if (!rows || rows.length === 0) return res.status(404).json({ error: 'User not found' });

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


app.post('/logout', async(req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader ? authHeader.slice(7) : null;
    try {
        await pool.query('DELETE FROM tokens WHERE token = ?', [token]);
        logger.info(JSON.stringify({
            timestamp: new Date(),
            action: 'logout',
            token: token.substring(0, 10) + '...'
        }));
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));