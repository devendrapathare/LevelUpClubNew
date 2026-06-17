const express = require('express');
const app = express();
const port = 5001;

app.get('/', (req, res) => {
  res.send('Simple server is running!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Simple server running on http://0.0.0.0:${port}`);
});