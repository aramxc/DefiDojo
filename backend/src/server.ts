import express from 'express';
import cors from 'cors';
import routes from './routes/routes';

const app = express();
``
// Middleware
app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;