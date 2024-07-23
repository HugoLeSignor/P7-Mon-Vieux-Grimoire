const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Book = require('./models/Book');

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/votre_base_de_donnees', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Chemin vers le fichier data.json
const dataPath = path.join(__dirname, '../frontend/public/data/data.json');

// Lire le fichier JSON
fs.readFile(dataPath, 'utf8', (err, data) => {
  if (err) {
    console.error("Erreur lors de la lecture du fichier :", err);
    return;
  }

  const books = JSON.parse(data);

  // Insérer les livres dans la base de données
  Book.insertMany(books)
    .then(() => {
      console.log("Données importées avec succès");
      mongoose.connection.close();
    })
    .catch(err => {
      console.error("Erreur lors de l'importation des données :", err);
      mongoose.connection.close();
    });
});