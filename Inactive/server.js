const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;

// Respect the X-Forwarded-* headers when behind a proxy
app.set('trust proxy', 1);

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Apply the rate limiting middleware to all requests
app.use(limiter);
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index_v2.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
