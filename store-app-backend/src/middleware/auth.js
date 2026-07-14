const jwt = require('jsonwebtoken');

/**
 * Protects a route: requires a valid `Authorization: Bearer <token>` header.
 * On success it attaches `req.user = { id, username }` and calls next().
 * On failure it responds with 401 and stops the request.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'يجب تسجيل الدخول للوصول لهذا المسار' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'جلسة الدخول غير صالحة أو منتهية، سجّل الدخول من جديد' });
  }
}

module.exports = { requireAuth };
