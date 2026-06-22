import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import venueRoutes from './routes/venues.js';
import bookingRoutes from './routes/bookings.js';
import pool from './db.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));




// Routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);


app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'BookMyVenue API Gateway is running smoothly',
    timestamp: new Date()
  });
});

// 404 
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Errorhandling
app.use((err, req, res, next) => {
  console.error('Unhandled internal error:', err.stack);
  res.status(500).json({ message: 'Internal server error occurred' });
});


app.listen(PORT, () => {
  console.log(`BookMyVenue backend server listening on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
});
