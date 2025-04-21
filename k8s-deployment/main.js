const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.json({ message: 'There is no spoon!', status: 'success' });
});

app.get('/hello', (req, res) => {
  console.log('Hello, beautiful World!');
  res.json({ message: 'Hello, beautiful World!', status: 'success' });
});

app.get('/hello/:username', (req, res) => {
  console.log(`Hello, ${req.params.username}!`);
  const { username } = req.params;
  res.json({ message: `Hello, ${username}!`, status: 'success' });
});

app.get('/error', (req, res) => {
  res.status(500).json({ message: 'Internal Server Error', status: 'error' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

