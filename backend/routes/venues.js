import express from 'express';
import { getVenues, getVenueById, createVenue, getMyVenues, updateVenue, deleteVenue } from '../controllers/venueController.js';
import { getVenueBookings, getVenueAvailability } from '../controllers/bookingController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getVenues);
router.get('/my-venues', authenticateToken, requireRole('venue_owner'), getMyVenues);
router.get('/:id', getVenueById);
router.get('/:id/bookings', getVenueBookings);
router.get('/:id/availability', getVenueAvailability);
router.post('/', authenticateToken, requireRole('venue_owner'), createVenue);
router.put('/:id', authenticateToken, requireRole('venue_owner'), updateVenue);
router.delete('/:id', authenticateToken, requireRole('venue_owner'), deleteVenue);

export default router;

