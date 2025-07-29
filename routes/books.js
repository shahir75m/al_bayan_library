const express = require('express');
const router = express.Router();
const { appendBookToSheet } = require('../services/googleSheets');

router.post('/add', async (req, res) => {
  try {
    const book = req.body;
    await appendBookToSheet(book);
    res.status(200).json({ message: 'Book added successfully!' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

module.exports = router;