require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Book = require('./models/Book');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const dataPath = path.join(__dirname, '../frontend/public/data/data.json');

fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
        console.error("Erreur lors de la lecture du fichier :", err);
        return;
    }

    const books = JSON.parse(data);

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