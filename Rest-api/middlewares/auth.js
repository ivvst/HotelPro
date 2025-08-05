const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'mySuperSecretKey';

module.exports = (req, res, next) => {
  let token = null;

  // 1️⃣ Проверка за Bearer token (примерно при Postman тестове)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    console.log('[auth] Token from Authorization header');
  }

  // 2️⃣ Ако няма header → вземи токена от cookie
  if (!token && req.cookies && req.cookies['authToken']) {
    token = req.cookies['authToken'];
    console.log('[auth] Token from cookie');
  }

  // 3️⃣ Ако няма токен → отказ
  if (!token) {
    console.log('[auth] NO TOKEN FOUND');
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    // 4️⃣ Валидация на токена
    const payload = jwt.verify(token, JWT_SECRET);
    console.log('[auth] JWT PAYLOAD:', payload);

    // 5️⃣ Записваме user данните в req.user (ще съдържа role, _id, email)
    req.user = payload;
    next();
  } catch (err) {
    console.log('[auth] JWT ERROR:', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
