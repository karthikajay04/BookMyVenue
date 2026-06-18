import express from 'express';
import { 
  getDashboardStats, 
  getAllVenues, 
  updateVenueStatus, 
  getAllBookings, 
  getAllUsers 
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply admin protection middleware to all admin routes
router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/stats', getDashboardStats);
router.get('/venues', getAllVenues);
router.put('/venues/:id/status', updateVenueStatus);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);

export default router;
