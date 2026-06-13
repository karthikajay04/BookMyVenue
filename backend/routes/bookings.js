import express from 'express';
import { getBookings, createBooking, cancelBooking, lockVenue } from '../controllers/bookingController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken); // Protect all booking routes

router.get('/', getBookings);
router.post('/', createBooking);
router.post('/lock', requireRole('venue_owner'), lockVenue);
router.put('/:id/cancel', cancelBooking);

export default router;
