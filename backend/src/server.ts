import express from 'express';
import cors from 'cors';
import routes from './routes/routes';
import { UserService } from './services/snowflake/user.service';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', routes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server after UserService initialization
const startServer = async () => {
  try {
    await UserService.initialize();
    console.log('UserService initialized successfully');
    
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize UserService:', error);
    process.exit(1);
  }
};

startServer();

export default app;