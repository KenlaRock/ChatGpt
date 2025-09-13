const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index_v2.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
