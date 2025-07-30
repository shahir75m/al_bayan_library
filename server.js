const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const bookRoutes = require('./routes/books');

const app = express();
app.use(cors());
app.use(bodyParser.json());
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const bookRoutes = require('./routes/books'); // Assumes a 'routes' directory with 'books.js'

const app = express();
app.use(cors()); // Enables Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parses incoming request bodies as JSON

app.use('/api/books', bookRoutes); // Mounts book-related routes under /api/books

app.use(express.static('public')); // Serves static files from a 'public' directory

const PORT = process.env.PORT || 3000; // Defines the port for the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
app.use('/api/books', bookRoutes);

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
