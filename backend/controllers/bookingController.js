import { query } from '../db.js';

// Get bookings for user or venue owner
export const getBookings = async (req, res) => {
  const { email, role } = req.user;

  try {
    let result;
    if (role === 'venue_owner') {
      // Host sees bookings for their own venues
      result = await query(`
        SELECT 
          b.id,
          b.venue_id AS "venueId",
          v.title AS "venueTitle",
          v.location AS "venueLocation",
          v.images[1] AS "venueImage",
          b.start_date AS "startDate",
          b.end_date AS "endDate",
          b.guests,
          b.total_price AS "totalPrice",
          b.status,
          b.booking_date AS "bookingDate",
          b.payment_status AS "paymentStatus",
          COALESCE(b.renter_name, u.name) AS "renterName",
          COALESCE(b.renter_email, u.email) AS "renterEmail",
          b.renter_phone AS "renterPhone",
          h.name AS "hostName",
          h.email AS "hostMail",
          b.check_in_instructions AS "checkInInstructions"
        FROM bookings b
        JOIN venues v ON b.venue_id = v.id
        JOIN users h ON v.host_email = h.email
        LEFT JOIN users u ON b.user_email = u.email
        WHERE h.email = $1
        ORDER BY b.created_at DESC
      `, [email]);
    } else {
      // Regular user sees bookings they have made
      result = await query(`
        SELECT 
          b.id,
          b.venue_id AS "venueId",
          v.title AS "venueTitle",
          v.location AS "venueLocation",
          v.images[1] AS "venueImage",
          b.start_date AS "startDate",
          b.end_date AS "endDate",
          b.guests,
          b.total_price AS "totalPrice",
          b.status,
          b.booking_date AS "bookingDate",
          b.payment_status AS "paymentStatus",
          h.name AS "hostName",
          h.email AS "hostMail",
          b.check_in_instructions AS "checkInInstructions",
          COALESCE(b.renter_name, u.name) AS "renterName",
          b.renter_phone AS "renterPhone",
          COALESCE(b.renter_email, u.email) AS "renterEmail"
        FROM bookings b
        JOIN venues v ON b.venue_id = v.id
        JOIN users h ON v.host_email = h.email
        LEFT JOIN users u ON b.user_email = u.email
        WHERE b.user_email = $1
        ORDER BY b.created_at DESC
      `, [email]);
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

// Create a new booking
export const createBooking = async (req, res) => {
  const { venueId, startDate, endDate, guests, totalPrice, renterName, renterPhone, renterEmail } = req.body;
  const user_email = req.user.email;

  try {
    if (!venueId || !startDate || !endDate || !guests || !totalPrice || !renterName || !renterPhone || !renterEmail) {
      return res.status(400).json({ message: 'Please provide all required booking fields (including contact name, phone, and email)' });
    }

    // Check if venue exists
    const venueRes = await query('SELECT * FROM venues WHERE id = $1', [venueId]);
    if (venueRes.rows.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    const venue = venueRes.rows[0];

    // Validate 30-day booking limit for web bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const maxAllowed = new Date(today);
    maxAllowed.setDate(today.getDate() + 30);
    maxAllowed.setHours(23, 59, 59, 999);

    if (start < today) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past.' });
    }
    if (end < start) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date.' });
    }
    if (start > maxAllowed || end > maxAllowed) {
      const formattedLimit = maxAllowed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return res.status(400).json({ 
        message: `Web bookings are only allowed for dates within 30 days from today (up to ${formattedLimit}). Please contact the host directly to make an offline booking.` 
      });
    }

    // Generate BKG-XXXX ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `BKG-${randomNum}`;

    const checkInCode = Math.floor(1000 + Math.random() * 9000);
    const checkInInstructions = `Secure entry code: #${checkInCode}. Welcome to ${venue.title}! Check-in starts at 2:00 PM.`;

    const result = await query(`
      INSERT INTO bookings (
        id, venue_id, user_email, start_date, end_date, guests, total_price, status, payment_status, check_in_instructions, renter_name, renter_phone, renter_email
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      bookingId, venueId, user_email, startDate, endDate, guests, totalPrice, 'upcoming', 'paid', checkInInstructions, renterName, renterPhone, renterEmail
    ]);

    res.status(201).json({
      success: true,
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
};

// Cancel a booking
export const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const { email, role } = req.user;

  try {
    // Check if booking exists
    const bookingRes = await query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    const booking = bookingRes.rows[0];

    // Verify user owns the booking or the venue being booked
    if (role === 'venue_owner') {
      const venueRes = await query('SELECT host_email FROM venues WHERE id = $1', [booking.venue_id]);
      if (venueRes.rows.length === 0 || venueRes.rows[0].host_email !== email) {
        return res.status(403).json({ message: 'Not authorized to cancel bookings for this venue' });
      }
    } else if (booking.user_email !== email) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Update status to cancelled and refund payment
    const result = await query(`
      UPDATE bookings 
      SET status = 'cancelled', payment_status = 'refunded' 
      WHERE id = $1 
      RETURNING *
    `, [id]);

    res.json({
      success: true,
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
};

// Lock a venue for offline bookings/maintenance (Venue Owners)
export const lockVenue = async (req, res) => {
  const { venueId, startDate, endDate, notes, totalPrice, guests, renterName, renterPhone, renterEmail } = req.body;
  const host_email = req.user.email;

  try {
    if (!venueId || !startDate || !endDate || !renterName || !renterPhone || !renterEmail) {
      return res.status(400).json({ message: 'Please provide venueId, startDate, endDate, renterName, renterPhone, and renterEmail' });
    }

    // Check if venue exists and is owned by this host
    const venueRes = await query('SELECT * FROM venues WHERE id = $1', [venueId]);
    if (venueRes.rows.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    const venue = venueRes.rows[0];
    if (venue.host_email !== host_email) {
      return res.status(403).json({ message: 'Not authorized to lock this venue' });
    }

    // Validate locking dates are not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < today) {
      return res.status(400).json({ message: 'Lock start date cannot be in the past.' });
    }
    if (end < start) {
      return res.status(400).json({ message: 'Unlock date cannot precede lock start date.' });
    }

    // Generate OFF-XXXX ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `OFF-${randomNum}`;

    const checkInInstructions = notes || 'Venue locked for offline event or maintenance.';

    const result = await query(`
      INSERT INTO bookings (
        id, venue_id, user_email, start_date, end_date, guests, total_price, status, payment_status, check_in_instructions, renter_name, renter_phone, renter_email
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      bookingId, venueId, null, startDate, endDate, guests || 0, totalPrice || 0, 'offline', 'offline', checkInInstructions, renterName, renterPhone, renterEmail
    ]);

    res.status(201).json({
      success: true,
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Error locking venue:', error);
    res.status(500).json({ message: 'Error locking venue' });
  }
};
