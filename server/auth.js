const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'goodluckforme';
const JWT_TTL_SEC = Number(process.env.JWT_TTL_SEC || 3600);

function generateToken(user) {
    // minimal payload
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_TTL_SEC });
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