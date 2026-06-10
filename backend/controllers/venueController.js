import { query } from '../db.js';

// Helper to convert database snake_case row to camelCase and normalize types
const mapVenueRow = (row) => {
  if (!row) return null;
  return {
    id: row.id.toString(), // Normalize numeric ID to string to match frontend types
    title: row.title,
    description: row.description,
    location: row.location,
    fullAddress: row.full_address,
    capacity: Number(row.capacity),
    squareFeet: Number(row.square_feet),
    pricePerNight: Number(row.price_per_night),
    hostEmail: row.host_email,
    hostType: row.host_type,
    rating: Number(row.rating),
    isTopRated: row.is_top_rated,
    dateRange: row.date_range,
    parking: row.parking,
    catering: row.catering,
    images: row.images,
    amenities: row.amenities,
    rules: row.rules,
    eventTypes: row.event_types,
    tags: [
      row.location,
      `${row.capacity} Guests`,
      row.is_top_rated ? 'Luxury' : 'Handpicked'
    ]
  };
};

// Get all venues with optional filters
export const getVenues = async (req, res) => {
  try {
    const { location, capacity } = req.query;
    let queryText = 'SELECT * FROM venues';
    const params = [];

    const conditions = [];
    if (location && location !== 'All') {
      params.push(location);
      conditions.push(`location = $${params.length}`);
    }

    if (capacity && capacity !== 'All') {
      const capNum = parseInt(capacity, 10);
      if (!isNaN(capNum)) {
        if (capNum === 10) {
          conditions.push('capacity <= 10');
        } else if (capNum === 100) {
          conditions.push('capacity > 10 AND capacity <= 100');
        } else if (capNum === 1000) {
          conditions.push('capacity >= 1000');
        }
      }
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    // Sort by id or title by default
    queryText += ' ORDER BY id ASC';

    const result = await query(queryText, params);
    res.json(result.rows.map(mapVenueRow));
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ message: 'Error fetching venues' });
  }
};

// Get a single venue by ID
export const getVenueById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM venues WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.json(mapVenueRow(result.rows[0]));
  } catch (error) {
    console.error('Error fetching venue details:', error);
    res.status(500).json({ message: 'Error fetching venue details' });
  }
};

// Create a new venue (Venue Owners)
export const createVenue = async (req, res) => {
  const {
    title, description, location, full_address, capacity, square_feet, price_per_night,
    host_type, rating, is_top_rated, date_range, parking, catering,
    images, amenities, rules, event_types
  } = req.body;

  const host_email = req.user.email; // From authentication middleware

  try {
    if (!title || !description || !location || !full_address || !capacity || !square_feet || !price_per_night) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const result = await query(`
      INSERT INTO venues (
        title, description, location, full_address, capacity, square_feet, price_per_night,
        host_email, host_type, rating, is_top_rated, date_range, parking, catering,
        images, amenities, rules, event_types
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `, [
      title, description, location, full_address, capacity, square_feet, price_per_night,
      host_email, host_type || 'Superhost', rating || 5.0, is_top_rated || false, date_range || 'Available', parking || '', catering || '',
      images || [], amenities || [], rules || [], event_types || []
    ]);

    res.status(201).json({
      success: true,
      venue: mapVenueRow(result.rows[0])
    });
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ message: 'Error creating venue' });
  }
};

// Get venues owned by the authenticated host
export const getMyVenues = async (req, res) => {
  const host_email = req.user.email;
  try {
    const result = await query('SELECT * FROM venues WHERE host_email = $1 ORDER BY id ASC', [host_email]);
    res.json(result.rows.map(mapVenueRow));
  } catch (error) {
    console.error('Error fetching host venues:', error);
    res.status(500).json({ message: 'Error fetching host venues' });
  }
};

// Update an existing venue owned by the host
export const updateVenue = async (req, res) => {
  const { id } = req.params;
  const host_email = req.user.email;

  const title = req.body.title;
  const description = req.body.description;
  const location = req.body.location;
  const full_address = req.body.fullAddress || req.body.full_address;
  const capacity = req.body.capacity;
  const square_feet = req.body.squareFeet || req.body.square_feet;
  const price_per_night = req.body.pricePerNight || req.body.price_per_night;
  const host_type = req.body.hostType || req.body.host_type;
  const is_top_rated = req.body.isTopRated !== undefined ? req.body.isTopRated : req.body.is_top_rated;
  const date_range = req.body.dateRange || req.body.date_range;
  const parking = req.body.parking;
  const catering = req.body.catering;
  const images = req.body.images;
  const amenities = req.body.amenities;
  const rules = req.body.rules;
  const event_types = req.body.eventTypes || req.body.event_types;

  try {
    // Check ownership
    const checkRes = await query('SELECT * FROM venues WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    if (checkRes.rows[0].host_email !== host_email) {
      return res.status(403).json({ message: 'Not authorized to update this venue' });
    }

    if (!title || !description || !location || !full_address || !capacity || !square_feet || !price_per_night) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const result = await query(`
      UPDATE venues SET
        title = $1,
        description = $2,
        location = $3,
        full_address = $4,
        capacity = $5,
        square_feet = $6,
        price_per_night = $7,
        host_type = $8,
        is_top_rated = $9,
        date_range = $10,
        parking = $11,
        catering = $12,
        images = $13,
        amenities = $14,
        rules = $15,
        event_types = $16
      WHERE id = $17 AND host_email = $18
      RETURNING *
    `, [
      title, description, location, full_address, Number(capacity), Number(square_feet), Number(price_per_night),
      host_type || 'Superhost', is_top_rated || false, date_range || 'Available', parking || '', catering || '',
      images || [], amenities || [], rules || [], event_types || [],
      id, host_email
    ]);

    res.json({
      success: true,
      venue: mapVenueRow(result.rows[0])
    });
  } catch (error) {
    console.error('Error updating venue:', error);
    res.status(500).json({ message: 'Error updating venue' });
  }
};

// Delete a venue owned by the host
export const deleteVenue = async (req, res) => {
  const { id } = req.params;
  const host_email = req.user.email;

  try {
    // Check ownership
    const checkRes = await query('SELECT * FROM venues WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    if (checkRes.rows[0].host_email !== host_email) {
      return res.status(403).json({ message: 'Not authorized to delete this venue' });
    }

    await query('DELETE FROM venues WHERE id = $1 AND host_email = $2', [id, host_email]);
    res.json({
      success: true,
      message: 'Venue deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting venue:', error);
    res.status(500).json({ message: 'Error deleting venue' });
  }
};

