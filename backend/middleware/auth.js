const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('Middleware d\'authentification appelé');
  try {
    const token = req.headers.authorization.split(' ')[1];
    console.log('Token reçu:', token);
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token décodé:', decodedToken);
    const userId = decodedToken.userId;
    req.auth = { userId };
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({ error: 'Requête non authentifiée !' });
  }
};