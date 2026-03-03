/**
 * ocrService.js
 * OCR (Optical Character Recognition) for ticket verification
 * Uses Tesseract.js - FREE and open-source OCR library
 */

import Tesseract from 'tesseract.js';

/**
 * Extract text from ticket image
 * @param {String} imageUrl - URL or base64 of ticket image
 * @returns {Object} Extracted ticket data
 */
export async function extractTicketData(imageUrl) {
  try {
    console.log('Starting OCR extraction...');
    
    // Perform OCR
    const result = await Tesseract.recognize(
      imageUrl,
      'eng', // Language
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );
    
    const text = result.data.text;
    console.log('OCR Raw Text:', text);
    
    // Parse ticket information
    const ticketData = parseTicketText(text);
    
    return {
      success: true,
      rawText: text,
      confidence: result.data.confidence,
      ticketData
    };
    
  } catch (error) {
    console.error('OCR extraction error:', error);
    return {
      success: false,
      error: error.message,
      ticketData: null
    };
  }
}

/**
 * Parse extracted text to identify ticket information
 */
function parseTicketText(text) {
  const ticketData = {
    ticketNumber: null,
    date: null,
    time: null,
    from: null,
    to: null,
    fare: null,
    transportType: null,
    operator: null,
    transactionId: null,
    upiId: null
  };
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Extract ticket number (various patterns)
  const ticketPatterns = [
    /ticket\s*(?:no|number|#)?[\s:]*([A-Z0-9]{6,20})/i,
    /booking\s*(?:id|ref)?[\s:]*([A-Z0-9]{6,20})/i,
    /pnr[\s:]*([A-Z0-9]{6,15})/i,
    /ref[\s:]*([A-Z0-9]{6,20})/i
  ];
  
  for (const pattern of ticketPatterns) {
    const match = text.match(pattern);
    if (match) {
      ticketData.ticketNumber = match[1];
      break;
    }
  }
  
  // Extract date (DD/MM/YYYY, DD-MM-YYYY, etc.)
  const datePatterns = [
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
    /(\d{2,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      ticketData.date = match[1];
      break;
    }
  }
  
  // Extract time (HH:MM format)
  const timeMatch = text.match(/(\d{1,2}:\d{2}(?:\s*(?:AM|PM|am|pm))?)/);
  if (timeMatch) {
    ticketData.time = timeMatch[1];
  }
  
  // Extract fare/amount (₹ or Rs.)
  const farePatterns = [
    /(?:₹|Rs\.?|INR)\s*(\d+(?:\.\d{2})?)/i,
    /(?:fare|amount|total)[\s:]*(?:₹|Rs\.?|INR)?\s*(\d+(?:\.\d{2})?)/i,
    /(\d+(?:\.\d{2})?)\s*(?:₹|Rs\.?|INR)/i
  ];
  
  for (const pattern of farePatterns) {
    const match = text.match(pattern);
    if (match) {
      ticketData.fare = parseFloat(match[1]);
      break;
    }
  }
  
  // Detect transport type
  const transportKeywords = {
    metro: ['metro', 'dmrc', 'bmrcl', 'mmrc', 'kmrc', 'cmrl', 'hmrl', 'nmrc', 'rapid metro'],
    bus: ['bus', 'bmtc', 'best', 'dtc', 'msrtc', 'apsrtc', 'ksrtc', 'gsrtc'],
    train: ['train', 'railway', 'irctc', 'indian railways', 'rail'],
    auto: ['auto', 'rickshaw', 'ola', 'uber', 'rapido']
  };
  
  const textLower = text.toLowerCase();
  for (const [type, keywords] of Object.entries(transportKeywords)) {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      ticketData.transportType = type;
      break;
    }
  }
  
  // Extract operator name (common operators)
  const operators = [
    'DMRC', 'Delhi Metro', 'BMRCL', 'Namma Metro', 'Mumbai Metro', 'MMRC',
    'KMRC', 'Kolkata Metro', 'CMRL', 'Chennai Metro', 'HMRL', 'Hyderabad Metro',
    'BMTC', 'BEST', 'DTC', 'MSRTC', 'APSRTC', 'KSRTC', 'GSRTC',
    'Indian Railways', 'IRCTC', 'Ola', 'Uber', 'Rapido'
  ];
  
  for (const operator of operators) {
    if (textLower.includes(operator.toLowerCase())) {
      ticketData.operator = operator;
      break;
    }
  }
  
  // Extract UPI transaction ID
  const upiMatch = text.match(/(?:upi|transaction|txn)\s*(?:id|ref)?[\s:]*([A-Z0-9]{10,25})/i);
  if (upiMatch) {
    ticketData.transactionId = upiMatch[1];
  }
  
  // Extract UPI ID (email-like format)
  const upiIdMatch = text.match(/([a-z0-9._-]+@[a-z0-9.-]+)/i);
  if (upiIdMatch) {
    ticketData.upiId = upiIdMatch[1];
  }
  
  // Extract from/to stations (look for "From" and "To" keywords)
  const fromMatch = text.match(/from[\s:]*([A-Za-z\s]+?)(?:to|$)/i);
  if (fromMatch) {
    ticketData.from = fromMatch[1].trim();
  }
  
  const toMatch = text.match(/to[\s:]*([A-Za-z\s]+?)(?:\n|$)/i);
  if (toMatch) {
    ticketData.to = toMatch[1].trim();
  }
  
  return ticketData;
}

/**
 * Verify ticket authenticity
 */
export function verifyTicketAuthenticity(ticketData, tripData) {
  const issues = [];
  const warnings = [];
  let confidence = 100;
  
  // Check if essential data is present
  if (!ticketData.ticketNumber) {
    issues.push('Ticket number not found');
    confidence -= 30;
  }
  
  if (!ticketData.date) {
    issues.push('Date not found on ticket');
    confidence -= 20;
  }
  
  if (!ticketData.fare) {
    warnings.push('Fare amount not detected');
    confidence -= 10;
  }
  
  // Verify date is within 24 hours of trip
  if (ticketData.date && tripData.startTime) {
    const ticketDate = parseDate(ticketData.date);
    const tripDate = new Date(tripData.startTime);
    const hoursDiff = Math.abs(tripDate - ticketDate) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      issues.push('Ticket date does not match trip date');
      confidence -= 40;
    } else if (hoursDiff > 12) {
      warnings.push('Ticket date is more than 12 hours from trip time');
      confidence -= 15;
    }
  }
  
  // Verify transport type matches trip mode
  if (ticketData.transportType && tripData.mode) {
    const modeMatch = {
      'PUBLIC': ['metro', 'bus', 'train'],
      'CAR': ['auto'],
      'BIKE': ['auto']
    };
    
    const expectedTypes = modeMatch[tripData.mode.toUpperCase()] || [];
    if (!expectedTypes.includes(ticketData.transportType)) {
      warnings.push(`Ticket type (${ticketData.transportType}) may not match trip mode (${tripData.mode})`);
      confidence -= 10;
    }
  }
  
  // Verify fare is reasonable for distance
  if (ticketData.fare && tripData.distanceKm) {
    const expectedFare = estimateFare(ticketData.transportType, tripData.distanceKm);
    const fareDiff = Math.abs(ticketData.fare - expectedFare);
    const diffPercent = (fareDiff / expectedFare) * 100;
    
    if (diffPercent > 100) {
      warnings.push(`Fare (₹${ticketData.fare}) seems unusual for ${tripData.distanceKm}km`);
      confidence -= 15;
    }
  }
  
  const isValid = confidence >= 50 && issues.length === 0;
  
  return {
    isValid,
    confidence,
    issues,
    warnings,
    recommendation: isValid ? 'APPROVE' : (confidence >= 30 ? 'MANUAL_REVIEW' : 'REJECT')
  };
}

/**
 * Parse date string to Date object
 */
function parseDate(dateStr) {
  // Try various date formats
  const formats = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/, // DD/MM/YYYY
    /(\d{2,4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/ // YYYY/MM/DD
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      let day, month, year;
      
      if (match[1].length === 4) {
        // YYYY/MM/DD format
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      } else {
        // DD/MM/YYYY format
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3]);
        
        // Handle 2-digit year
        if (year < 100) {
          year += 2000;
        }
      }
      
      return new Date(year, month, day);
    }
  }
  
  return new Date();
}

/**
 * Estimate fare based on transport type and distance
 */
function estimateFare(transportType, distanceKm) {
  const fareRates = {
    metro: { base: 10, perKm: 2 },
    bus: { base: 5, perKm: 1.5 },
    train: { base: 10, perKm: 1 },
    auto: { base: 25, perKm: 12 }
  };
  
  const rates = fareRates[transportType] || fareRates.bus;
  return rates.base + (distanceKm * rates.perKm);
}

/**
 * Validate ticket image quality
 */
export function validateImageQuality(imageData) {
  // This is a placeholder - in production, you'd check:
  // - Image resolution
  // - Brightness/contrast
  // - Blur detection
  // - File size
  
  return {
    isValid: true,
    quality: 'good',
    suggestions: []
  };
}

export default {
  extractTicketData,
  verifyTicketAuthenticity,
  validateImageQuality,
  parseTicketText
};
