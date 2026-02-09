import PublicTransportVerification from '../models/PublicTransportVerification.js';
import Trip from '../models/Trip.js';
import User from '../models/User.js';

// Verify ticket image using OCR
export async function verifyTicket(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { tripId } = req.body;
    const ticketImage = req.file; // Assuming multer middleware

    if (!ticketImage) {
      return res.status(400).json({ message: 'Ticket image required' });
    }

    const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // In production, use OCR service like Google Vision API or Tesseract
    // For now, we'll do basic validation
    const verification = await PublicTransportVerification.create({
      trip: tripId,
      user: req.user._id,
      verificationType: 'ticket_image',
      ticket: {
        imageUrl: ticketImage.path || ticketImage.filename,
        issueDate: new Date()
      },
      status: 'verified', // In production, this would be 'pending' until OCR completes
      verificationScore: 85, // Mock score
      metadata: {
        timestamp: new Date()
      }
    });

    // Update trip verification status
    trip.verification.ticketUploaded = true;
    trip.verification.ticketImageUrl = ticketImage.path || ticketImage.filename;
    await trip.save();

    return res.json({
      success: true,
      message: 'Ticket verified successfully',
      verification,
      verificationScore: 85
    });

  } catch (error) {
    console.error('Ticket verification error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

// Verify transaction details
export async function verifyTransaction(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { tripId, transactionId, amount, timestamp, paymentMethod, provider } = req.body;

    if (!tripId || !transactionId || !amount) {
      return res.status(400).json({ message: 'Missing required transaction details' });
    }

    const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check for duplicate transaction
    const existingVerification = await PublicTransportVerification.findOne({
      'transaction.transactionId': transactionId
    });

    if (existingVerification) {
      return res.status(400).json({
        success: false,
        message: 'Transaction already used for verification',
        fraudChecks: { duplicateTicket: true }
      });
    }

    // Validate transaction timestamp (must be within 24 hours)
    const transactionTime = new Date(timestamp);
    const now = new Date();
    const hoursDiff = (now - transactionTime) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return res.status(400).json({
        success: false,
        message: 'Transaction is too old (must be within 24 hours)'
      });
    }

    // Create verification record
    const verification = await PublicTransportVerification.create({
      trip: tripId,
      user: req.user._id,
      verificationType: 'transaction',
      transaction: {
        transactionId,
        amount,
        timestamp: transactionTime,
        paymentMethod,
        provider
      },
      status: 'verified',
      verificationScore: 90,
      verifiedAt: new Date(),
      metadata: {
        timestamp: new Date()
      }
    });

    // Update trip verification status
    trip.verification.transactionVerified = true;
    trip.verification.transactionId = transactionId;
    trip.verification.publicTransport = {
      fare: amount,
      verificationMethod: 'transaction'
    };
    await trip.save();

    return res.json({
      success: true,
      message: 'Transaction verified successfully',
      verification,
      verificationScore: 90
    });

  } catch (error) {
    console.error('Transaction verification error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

// Get nearby metro stations
export async function getNearbyMetroStations(req, res) {
  try {
    const { lat, lng, radius = 2 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    // Metro cities database
    const metroCities = {
      delhi: { lat: 28.6139, lng: 77.2090, radius: 50, name: 'Delhi NCR' },
      mumbai: { lat: 19.0760, lng: 72.8777, radius: 40, name: 'Mumbai' },
      bangalore: { lat: 12.9716, lng: 77.5946, radius: 35, name: 'Bangalore' },
      kolkata: { lat: 22.5726, lng: 88.3639, radius: 30, name: 'Kolkata' },
      chennai: { lat: 13.0827, lng: 80.2707, radius: 30, name: 'Chennai' },
      hyderabad: { lat: 17.3850, lng: 78.4867, radius: 30, name: 'Hyderabad' }
    };

    // Check if location is in a metro city
    let cityInfo = null;
    for (const [key, city] of Object.entries(metroCities)) {
      const distance = calculateDistance(parseFloat(lat), parseFloat(lng), city.lat, city.lng);
      if (distance <= city.radius) {
        cityInfo = { key, ...city };
        break;
      }
    }

    if (!cityInfo) {
      return res.json({
        success: false,
        message: 'No metro service in this area',
        stations: []
      });
    }

    // In production, integrate with actual metro APIs or database
    // For now, return mock data
    const mockStations = [
      {
        name: 'Central Station',
        lat: parseFloat(lat) + 0.01,
        lng: parseFloat(lng) + 0.01,
        distance: 1.2,
        line: 'Blue Line',
        network: cityInfo.name
      },
      {
        name: 'City Center',
        lat: parseFloat(lat) - 0.01,
        lng: parseFloat(lng) + 0.01,
        distance: 1.5,
        line: 'Red Line',
        network: cityInfo.name
      }
    ];

    return res.json({
      success: true,
      city: cityInfo.name,
      stations: mockStations,
      message: `Found ${mockStations.length} metro stations nearby`
    });

  } catch (error) {
    console.error('Metro station search error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default {
  verifyTicket,
  verifyTransaction,
  getNearbyMetroStations
};
