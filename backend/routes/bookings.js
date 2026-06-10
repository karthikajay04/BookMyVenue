import express from 'express';
import { getBookings, createBooking, cancelBooking } from '../controllers/bookingController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken); // Protect all booking routes

router.get('/', getBookings);
router.post('/', createBooking);
router.put('/:id/cancel', cancelBooking);

export default router;
