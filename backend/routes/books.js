const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]);
  }
});

const upload = multer({ storage: storage });

// Route publique pour la page d'accueil
router.get('/home', async (req, res) => {
  console.log('GET /api/home - Récupération de tous les livres pour la page d\'accueil');
  try {
    const books = await Book.find();
    console.log(`${books.length} livres trouvés pour la page d'accueil`);
    res.status(200).json(books);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres pour la page d\'accueil:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route publique pour récupérer tous les livres
router.get('/', async (req, res) => {
  console.log('GET /api/books - Récupération de tous les livres');
  try {
    const books = await Book.find();
    console.log(`${books.length} livres trouvés`);
    res.status(200).json(books);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route publique pour récupérer les meilleurs livres
router.get('/bestrating', async (req, res) => {
  console.log('GET /api/books/bestrating - Récupération des meilleurs livres');
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3);
    console.log(`${books.length} meilleurs livres trouvés`);
    res.status(200).json(books);
  } catch (error) {
    console.error('Erreur lors de la récupération des meilleurs livres:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route protégée pour ajouter un nouveau livre
router.post('/', auth, upload.single('image'), async (req, res) => {
  console.log('POST /api/books - Ajout d\'un nouveau livre');
  console.log('Corps de la requête:', req.body);
  console.log('Fichier uploadé:', req.file);

  try {
    let bookData;
    if (req.body.book) {
      bookData = JSON.parse(req.body.book);
      console.log('Données du livre parsées:', bookData);
    } else {
      bookData = req.body;
      console.log('Données du livre reçues directement:', bookData);
    }

    const book = new Book({
      ...bookData,
      userId: req.auth.userId,
      imageUrl: req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : ''
    });

    console.log('Nouveau livre créé:', book);

    await book.save();
    console.log('Livre sauvegardé avec succès');
    res.status(201).json({ message: 'Livre ajouté avec succès' });
  } catch (error) {
    console.error('Erreur lors de la création du livre:', error);
    res.status(400).json({ error: error.message });
  }
});

// Route protégée pour récupérer un livre spécifique
router.get('/:id', async (req, res) => {
  console.log(`GET /api/books/${req.params.id} - Récupération d'un livre spécifique`);
  console.log('ID reçu:', req.params.id);
  console.log('GET /api/books/:id appelé avec ID:', req.params.id);
  if (!req.params.id || req.params.id === 'undefined') {
    return res.status(400).json({ message: 'ID de livre invalide' });
  }
  
  try {
    if (!req.params.id || req.params.id === 'undefined') {
      console.log('ID invalide détecté');
      return res.status(400).json({ message: 'ID de livre invalide' });
    }

    const book = await Book.findById(req.params.id);
    console.log('Livre trouvé:', book);

    if (!book) {
      console.log('Livre non trouvé');
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route protégée pour mettre à jour un livre
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  console.log(`PUT /api/books/${req.params.id} - Mise à jour d'un livre`);
  console.log('Corps de la requête:', req.body);
  console.log('Fichier uploadé:', req.file);

  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      console.log('Livre non trouvé');
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    if (book.userId.toString() !== req.auth.userId) {
      console.log('Utilisateur non autorisé');
      return res.status(403).json({ message: 'Non autorisé' });
    }

    let bookData;
    if (req.body.book) {
      bookData = JSON.parse(req.body.book);
      console.log('Données du livre parsées:', bookData);
    } else {
      bookData = req.body;
      console.log('Données du livre reçues directement:', bookData);
    }

    if (req.file) {
      if (book.imageUrl) {
        const filename = book.imageUrl.split('/uploads/')[1];
        fs.unlink(`uploads/${filename}`, (err) => {
          if (err) console.error('Erreur lors de la suppression de l\'ancienne image:', err);
        });
      }
      bookData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    await Book.findByIdAndUpdate(req.params.id, { ...bookData, _id: req.params.id });
    console.log('Livre mis à jour avec succès');
    res.status(200).json({ message: 'Livre mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error);
    res.status(400).json({ error: error.message });
  }
});

// Route protégée pour supprimer un livre
router.delete('/:id', auth, async (req, res) => {
  console.log(`DELETE /api/books/${req.params.id} - Suppression d'un livre`);
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      console.log('Livre non trouvé');
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    if (book.userId.toString() !== req.auth.userId) {
      console.log('Utilisateur non autorisé');
      return res.status(403).json({ message: 'Non autorisé' });
    }

    if (book.imageUrl) {
      const filename = book.imageUrl.split('/uploads/')[1];
      fs.unlink(`uploads/${filename}`, (err) => {
        if (err) console.error('Erreur lors de la suppression de l\'image:', err);
      });
    }

    await Book.findByIdAndDelete(req.params.id);
    console.log('Livre supprimé avec succès');
    res.status(200).json({ message: 'Livre supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route protégée pour ajouter une note à un livre
router.post('/:id/rating', auth, async (req, res) => {
  console.log(`POST /api/books/${req.params.id}/rating - Ajout d'une note à un livre`);
  console.log('Corps de la requête:', req.body);

  try {
    const { userId, rating } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) {
      console.log('Livre non trouvé');
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    const existingRating = book.ratings.find(r => r.userId.toString() === userId);
    if (existingRating) {
      console.log('L\'utilisateur a déjà noté ce livre');
      return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
    }

    book.ratings.push({ userId, grade: rating });
    book.calculateAverageRating();
    await book.save();

    console.log('Note ajoutée avec succès');
    res.status(200).json(book);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la note:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;