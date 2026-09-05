import express from 'express';

const app = express();

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
  return res.status(200).json({ message: 'Server is running' });
});

export default app;