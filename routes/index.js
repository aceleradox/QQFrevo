const express = require('express');
const path = require('path');
const router = express.Router();

// Rota principal (formulário HTML)
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

module.exports = router;
