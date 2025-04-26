const jwt = require('jsonwebtoken');

function authMiddleware(role) {
  return function(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
      const decoded = jwt.verify(token, 'secret');
      req.user = decoded.user;

      if (role && decoded.user.role !== role) {
        return res.status(403).json({ msg: 'Access Denied' });
      }

      next();
    } catch (err) {
      res.status(401).json({ msg: 'Invalid Token' });
    }
  };
}

module.exports = authMiddleware;
