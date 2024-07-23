const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const mongoDbPassword = process.env.MONGODB_PASSWORD;
const mongoDbUri = `mongodb+srv://aaza:${mongoDbPassword}@p6-oc.kijd0yn.mongodb.net/?retryWrites=true&w=majority&appName=P6-OC`;

const app = express();

mongoose.connect(mongoDbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => console.log('Connexion à MongoDB Atlas réussie !'))
    .catch((error) => console.log('Connexion à MongoDB Atlas échouée !', error));

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/api/auth', authRoutes);

// GET tous les items
app.get('/api/items', (req, res, next) => {
    Item.find()
      .then(items => res.status(200).json(items))
      .catch(error => res.status(400).json({ error }));
  });
  
  // POST un nouvel item
  app.post('/api/items', (req, res, next) => {
    const item = new Item({
      ...req.body
    });
    item.save()
      .then(() => res.status(201).json({ message: 'Item enregistré !' }))
      .catch(error => res.status(400).json({ error }));
  });
  
  // GET un item spécifique
  app.get('/api/items/:id', (req, res, next) => {
    Item.findOne({ _id: req.params.id })
      .then(item => res.status(200).json(item))
      .catch(error => res.status(404).json({ error }));
  });
  
  // PUT (mise à jour) d'un item
  app.put('/api/items/:id', (req, res, next) => {
    Item.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Item modifié !' }))
      .catch(error => res.status(400).json({ error }));
  });
  
  // DELETE un item
  app.delete('/api/items/:id', (req, res, next) => {
    Item.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Item supprimé !' }))
      .catch(error => res.status(400).json({ error }));
  });

module.exports = app;