require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/users');
const multer = require('multer');
const path = require('path');

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connexion à MongoDB Atlas réussie !'))
    .catch((error) => console.log('Connexion à MongoDB Atlas échouée !', error));

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);

// Gestion des erreurs globale
app.use((error, req, res, next) => {
  console.error('Erreur globale:', error);
  res.status(error.status || 500).json({
    error: {
      message: error.message,
      status: error.status,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  });
});

app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});

module.exports = app;