import { extractTicketData } from '../services/ocrService.js';
import PublicTransportVerification from '../models/PublicTransportVerification.js';
import User from '../models/User.js';

/**
 * Verify public transport ticket image
 */
export async function verifyTicket(req, res) {
  try {
    const userId = req.user?.id;
    const { imageUrl, transactionDetails } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image URL is required' });
    }

    // Use OCR to extract ticket data
    const ocrResult = await extractTicketData(imageUrl);

    if (!ocrResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Could not extract ticket information',
        error: ocrResult.error 
      });
    }

    // Create verification record
    const verification = new PublicTransportVerification({
      userId,
      ticketImage: imageUrl,
      extractedData: ocrResult.ticketData,
      ocrConfidence: ocrResult.confidence,
      transactionDetails,
      status: 'pending', // Admin will review
      verificationDate: new Date()
    });

    await verification.save();

    res.json({
      success: true,
      message: 'Ticket submitted for verification. Please wait for admin approval.',
      verification,
      extractedData: ocrResult.ticketData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Verify payment transaction
 */
export async function verifyTransaction(req, res) {
  try {
    const userId = req.user?.id;
    const { transactionId, amount, date, paymentMethod } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    if (!transactionId || !amount) {
      return res.status(400).json({ success: false, message: 'Transaction ID and amount required' });
    }

    // Create verification record
    const verification = new PublicTransportVerification({
      userId,
      transactionId,
      amount,
      transactionDate: date || new Date(),
      paymentMethod,
      type: 'transaction_verification',
      status: 'pending',
      verificationDate: new Date()
    });

    await verification.save();

    res.json({
      success: true,
      message: 'Transaction submitted for verification. Please wait for admin approval.',
      verification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get nearby metro stations (sample data)
 */
export async function getNearbyMetroStations(req, res) {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
    }

    // Sample metro stations (in real app, query database)
    const metroStations = [
      {
        id: 1,
        name: 'Rajiv Chowk',
        line: 'Blue Line',
        latitude: 28.6331,
        longitude: 77.2197,
        distance: 2.3
      },
      {
        id: 2,
        name: 'Kasturba Nagar',
        line: 'Green Line',
        latitude: 28.5921,
        longitude: 77.2499,
        distance: 3.1
      },
      {
        id: 3,
        name: 'New Delhi',
        line: 'Yellow/Blue Line',
        latitude: 28.6428,
        longitude: 77.2197,
        distance: 4.2
      },
      {
        id: 4,
        name: 'Central Secretariat',
        line: 'Blue Line',
        latitude: 28.6252,
        longitude: 77.2015,
        distance: 4.8
      }
    ];

    res.json({
      success: true,
      stations: metroStations,
      count: metroStations.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get verification status
 */
export async function getVerificationStatus(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const verifications = await PublicTransportVerification.find({ userId })
      .sort({ verificationDate: -1 });

    res.json({ success: true, verifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
