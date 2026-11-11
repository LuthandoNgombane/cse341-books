import express from 'express';
import router from './src/router.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' with { type: 'json' };

const app = express();

// Require JSON for POST and PUT requests.
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req
      .get('Content-Type')
      ?.split(';')[0]
      .trim()
      .toLowerCase();

    if (contentType !== 'application/json') {
      return res.status(415).json({
        error: 'Content-Type must be application/json.',
      });
    }
  }

  return next();
});

// Allow valid JSON values through so controllers can reject non-objects.
app.use(express.json({ limit: '10kb', strict: false }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  return res.status(200).json({ message: 'Server is running' });
});

app.use(router);

// Express error handlers must have all four parameters.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request body too large.',
    });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON body.',
    });
  }

  if (error.status === 415) {
    return res.status(415).json({
      error: 'Content-Type must be application/json.',
    });
  }

  return res.status(500).json({
    error: 'Internal server error.',
  });
});

export default app;