const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const bookRoutes = require('./routes/books');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/books', bookRoutes);

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});