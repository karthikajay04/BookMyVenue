import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import pool from './db.js';

// Load environment configurations
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middlewares
app.use(cors({
  origin: '*', // Allow all origins for dev/testing, customize for prod
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Proactive DB Connection Check
const testDbConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(`Successfully reached PostgreSQL: ${res.rows[0].now}`);
  } catch (err) {
    console.error('Critical Error: Failed to connect to PostgreSQL database during startup!', err.message);
    console.log('Ensure that your PostgreSQL server is active and the DATABASE_URL in backend/.env is correct.');
  }
};
testDbConnection();

// Application Routes
app.use('/api/auth', authRoutes);

// Health Check / Root Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'BookMyVenue API Gateway is running smoothly',
    timestamp: new Date()
  });
});

// 404 Fallback Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled internal error:', err.stack);
  res.status(500).json({ message: 'Internal server error occurred' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`BookMyVenue backend server listening on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
});
