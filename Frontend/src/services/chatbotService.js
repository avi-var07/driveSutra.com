/**
 * Chatbot Service for driveSutraGo Assistant
 * Integrates with Google Gemini API to provide domain-specific responses about eco-driving
 */

class ChatbotService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    this.requestQueue = [];
    this.isProcessing = false;
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // 1 second between requests for rate limiting
    
    if (!this.apiKey) {
      console.warn('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }
  }

  /**
   * System instruction that focuses the chatbot on eco-driving domain
   */
  getSystemInstruction() {
    return {
      parts: [{
        text: `You are driveSutraGo's Assistant, a platform dedicated to sustainable transportation. Your role is to exclusively assist users with driveSutraGo features and educate them about eco-friendly driving practices, environmental benefits, and sustainable transportation alternatives.

CRITICAL GUIDELINES:
- You MUST focus EXCLUSIVELY on driveSutraGo, eco-driving, fuel efficiency, environmental impact, and sustainable transportation.
- If a user asks a question about ANY OTHER TOPIC (coding, general knowledge, math, politics, weather, etc.), you MUST politely decline. Say: "I am specialized only in driveSutraGo and eco-driving habits. I cannot assist with other topics."
- Keep responses informative but concise (2-3 paragraphs maximum).
- Use an encouraging, educational tone that promotes environmental awareness.

TOPICS TO COVER:
- driveSutraGo App functionality (EcoScore, Carbon Credits, Trip Tracking)
- Fuel-efficient driving techniques (smooth acceleration, maintaining steady speeds, etc.)
- Alternative transportation options (public transit, cycling, electric vehicles)
- Environmental impact of driving choices (emissions, carbon footprint)

EXAMPLE RESPONSES:
- For driveSutraGo questions: "In driveSutraGo, your EcoScore is calculated by..."
- For off-topic questions: "I am specialized only in driveSutraGo and eco-driving habits. I cannot assist with other topics. Would you like to know how to improve your vehicle's fuel economy?"

Remember: You are strictly an educational tool promoting driveSutraGo's mission of sustainable transportation. No off-topic discourse is allowed.`
      }]
    };
  }

  /**
   * Validates user input before sending to API
   * @param {string} input - User message
   * @returns {boolean} - Whether input is valid
   */
  validateInput(input) {
    if (!input || typeof input !== 'string') {
      return false;
    }
    
    const trimmed = input.trim();
    if (trimmed.length === 0 || trimmed.length > 1000) {
      return false;
    }
    
    return true;
  }

  /**
   * Sanitizes user input to remove potentially harmful content
   * @param {string} input - User message
   * @returns {string} - Sanitized input
   */
  sanitizeInput(input) {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    // Remove HTML tags and scripts
    let sanitized = input.replace(/<[^>]*>/g, '');
    
    // Remove potentially harmful characters and protocols
    sanitized = sanitized.replace(/[<>{}]/g, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Remove sensitive data patterns
    // Credit card numbers (basic pattern)
    sanitized = sanitized.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[REDACTED]');
    // SSN pattern
    sanitized = sanitized.replace(/\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, '[REDACTED]');
    // Phone numbers (basic pattern)
    sanitized = sanitized.replace(/\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b/g, '[REDACTED]');
    // Email addresses
    sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[REDACTED]');
    
    // Trim whitespace and limit length
    sanitized = sanitized.trim().substring(0, 1000);
    
    return sanitized;
  }

  /**
   * Validates API response structure
   * @param {Object} response - API response
   * @returns {boolean} - Whether response is valid
   */
  validateResponse(response) {
    return (
      response &&
      response.candidates &&
      Array.isArray(response.candidates) &&
      response.candidates.length > 0 &&
      response.candidates[0].content &&
      response.candidates[0].content.parts &&
      Array.isArray(response.candidates[0].content.parts) &&
      response.candidates[0].content.parts.length > 0 &&
      typeof response.candidates[0].content.parts[0].text === 'string'
    );
  }

  /**
   * Implements rate limiting by queuing requests
   * @param {Function} requestFn - Function that makes the API request
   * @returns {Promise} - Promise that resolves with the response
   */
  async throttleRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Processes the request queue with rate limiting
   */
  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.minRequestInterval) {
        await new Promise(resolve => 
          setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
        );
      }

      const { requestFn, resolve, reject } = this.requestQueue.shift();
      
      try {
        this.lastRequestTime = Date.now();
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Sends a message to the Gemini API and returns the response
   * @param {string} message - User message
   * @returns {Promise<string>} - Bot response
   */
  async sendMessage(message) {
    if (!this.apiKey) {
      throw new Error('API key not configured. Please set VITE_GEMINI_API_KEY environment variable.');
    }

    if (!this.validateInput(message)) {
      throw new Error('Invalid input. Message must be a non-empty string under 1000 characters.');
    }

    const sanitizedMessage = this.sanitizeInput(message);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: sanitizedMessage
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
        topP: 0.8
      },
      systemInstruction: this.getSystemInstruction()
    };

    const makeRequest = async () => {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before sending another message.');
        } else if (response.status === 401) {
          throw new Error('Authentication failed. Please check your API key.');
        } else {
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      
      if (!this.validateResponse(data)) {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response format from API');
      }

      return data.candidates[0].content.parts[0].text;
    };

    return this.throttleRequest(makeRequest);
  }

  /**
   * Handles errors and returns user-friendly messages
   * @param {Error} error - The error that occurred
   * @returns {string} - User-friendly error message
   */
  handleError(error) {
    console.error('Chatbot service error:', error);
    
    if (error.message.includes('Rate limit')) {
      return 'I\'m receiving a lot of questions right now. Please wait a moment and try again.';
    } else if (error.message.includes('Authentication')) {
      return 'There\'s a configuration issue with the chatbot. Please try again later.';
    } else if (error.message.includes('Invalid input')) {
      return 'Please enter a valid message (up to 1000 characters).';
    } else if (error.message.includes('API key not configured')) {
      return 'The chatbot is not properly configured. Please contact support.';
    } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
      return 'I\'m having trouble connecting right now. Please check your internet connection and try again.';
    } else {
      return 'I\'m experiencing some technical difficulties. Please try again in a moment.';
    }
  }
}

// Export singleton instance
export default new ChatbotService();