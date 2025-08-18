// server/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'goodluckforme';


function generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email },
        JWT_SECRET, { expiresIn: '1h' }
    );
}


function verifyToken(token) {
    try {
        if (!token) return null;
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

module.exports = { generateToken, verifyToken };