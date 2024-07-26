const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('Middleware d\'authentification appelé');
  
  // Liste des routes publiques
  const publicRoutes = ['/api/books', '/api/home', '/api/books/bestrating'];

  // Exclure les routes publiques de l'authentification
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  // Vérifier si l'en-tête d'autorisation est présent et bien formaté
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('En-tête d\'autorisation manquant ou mal formaté');
    return res.status(401).json({ error: 'Requête non authentifiée !' });
  }

  try {
    // Extraire le token de l'en-tête
    const token = authHeader.split(' ')[1];
    console.log('Token reçu:', token);

    // Décoder le token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token décodé:', decodedToken);

    // Extraire l'ID utilisateur du token décodé
    const userId = decodedToken.userId;
    req.auth = { userId };

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({ error: 'Requête non authentifiée !' });
  }
};
