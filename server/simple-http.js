const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Simple HTTP server is running!');
});

const port = 5002;
server.listen(port, '0.0.0.0', () => {
  console.log(`Simple HTTP server running on http://0.0.0.0:${port}`);
});