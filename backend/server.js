import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import venueRoutes from './routes/venues.js';
import bookingRoutes from './routes/bookings.js';
import reviewRoutes from './routes/reviews.js';
import pool from './db.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';


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
app.use('/uploads', express.static('uploads'));

// Proactive DB Connection Check
const testDbConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(`Successfully reached PostgreSQL: ${res.rows[0].now}`);
    
    // Ensure venues table has status, booking_type, cleaning_gap, opening_time, closing_time columns
    await pool.query(`
      ALTER TABLE venues 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS booking_type VARCHAR(50) DEFAULT 'days',
      ADD COLUMN IF NOT EXISTS cleaning_gap INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS opening_time VARCHAR(50) DEFAULT '08:00',
      ADD COLUMN IF NOT EXISTS closing_time VARCHAR(50) DEFAULT '22:00';
    `);

    // Ensure bookings table has renter info and booking_type columns
    await pool.query(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS renter_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS renter_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS renter_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS booking_type VARCHAR(50) DEFAULT 'days';
    `);

    // Alter bookings start_date and end_date columns to TIMESTAMP WITHOUT TIME ZONE
    await pool.query(`
      ALTER TABLE bookings 
      ALTER COLUMN start_date TYPE TIMESTAMP WITHOUT TIME ZONE,
      ALTER COLUMN end_date TYPE TIMESTAMP WITHOUT TIME ZONE;
    `);

    // For any existing venues that don't have status set, set them to approved
    await pool.query(`
      UPDATE venues SET status = 'approved' WHERE status IS NULL;
    `);
    console.log('Database migrations verified: renter_name & booking_type exist in bookings; status, booking_type, cleaning_gap & operating hours exist in venues.');
  } catch (err) {
    console.error('Critical Error: Failed to connect to PostgreSQL database during startup!', err.message);
    console.log('Ensure that your PostgreSQL server is active and the DATABASE_URL in backend/.env is correct.');
  }
};
testDbConnection();

// Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

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
