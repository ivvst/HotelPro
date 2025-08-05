export default function (req, res, next) {
  console.log('[isAdmin] req.user:', req.user);
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  console.log('[isAdmin] Достъп отказан!');
  return res.status(403).json({ message: 'Access denied. Admins only.' });
};

