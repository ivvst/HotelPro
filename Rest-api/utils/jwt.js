const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'mySuperSecretKey';

function createToken(data) {
    return jwt.sign(data, JWT_SECRET, { expiresIn: '1d' });
}

function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

module.exports = {
    createToken,
    verifyToken
}
