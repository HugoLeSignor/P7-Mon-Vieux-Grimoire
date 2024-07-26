const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Aucun fichier n\'a été uploadé.');
  }
  res.send('Fichier uploadé avec succès.');
});

module.exports = router;