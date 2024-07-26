const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// GET tous les items
router.get('/', auth, (req, res, next) => {
    Item.find()
        .then(items => res.status(200).json(items))
        .catch(error => res.status(400).json({ error }));
});

// POST un nouvel item
router.post('/', auth, (req, res, next) => {
    const item = new Item({
        ...req.body,
        userId: req.auth.userId
    });
    item.save()
        .then(() => res.status(201).json({ message: 'Item enregistré !' }))
        .catch(error => res.status(400).json({ error }));
});

// GET un item spécifique
router.get('/:id', auth, (req, res, next) => {
    Item.findOne({ _id: req.params.id })
        .then(item => res.status(200).json(item))
        .catch(error => res.status(404).json({ error }));
});

// PUT (mise à jour) d'un item
router.put('/:id', auth, (req, res, next) => {
    Item.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Item modifié !' }))
        .catch(error => res.status(400).json({ error }));
});

// DELETE un item
router.delete('/:id', auth, (req, res, next) => {
    Item.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Item supprimé !' }))
        .catch(error => res.status(400).json({ error }));
});

module.exports = router;