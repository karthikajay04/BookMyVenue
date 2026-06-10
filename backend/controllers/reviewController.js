import { query } from '../db.js';

// Create a review and update venue average rating
export const createReview = async (req, res) => {
  const { venueId, bookingId, rating, reviewText } = req.body;
  const user_email = req.user.email;

  try {
    if (!venueId || !bookingId || !rating || !reviewText) {
      return res.status(400).json({ message: 'Please provide all required review fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // 1. Check if booking exists and belongs to the user
    const bookingRes = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookingRes.rows[0];
    if (booking.user_email !== user_email) {
      return res.status(403).json({ message: 'You can only review bookings made by yourself' });
    }

    // 2. Insert the review
    const reviewResult = await query(`
      INSERT INTO reviews (venue_id, user_email, booking_id, rating, review_text)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [venueId, user_email, bookingId, rating, reviewText]);

    // 3. Re-calculate the average rating for the venue
    const avgRes = await query(`
      SELECT AVG(rating) as avg_rating 
      FROM reviews 
      WHERE venue_id = $1
    `, [venueId]);

    const newAvg = parseFloat(avgRes.rows[0].avg_rating);
    if (!isNaN(newAvg)) {
      // Rounded to 1 decimal place (e.g. 4.8)
      const roundedAvg = Math.round(newAvg * 10) / 10;
      await query('UPDATE venues SET rating = $1 WHERE id = $2', [roundedAvg, venueId]);
    }

    // 4. Update the booking status to mark that it's completed (or already was, we can verify)
    // For presentation purposes, if they reviewed it, it's completed
    await query("UPDATE bookings SET status = 'completed' WHERE id = $1", [bookingId]);

    res.status(201).json({
      success: true,
      review: reviewResult.rows[0]
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
};
