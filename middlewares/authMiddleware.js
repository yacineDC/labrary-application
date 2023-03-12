const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  // check jwt exists and is verified
  if (token) {
    jwt.verify(token, 'your_jwt_secret', (err, decodedToken) => {
      if (err) {
        res.redirect('/login');
      } else {
        if (decodedToken.role === 'admin') {
          next();
        } else {
          res.redirect('/restricted');
        }
      }
    });
  } else {
    res.redirect('/login');
  }
};

module.exports = { requireAuth };
