# Eco-Drive Chatbot 🌱

An AI-powered chatbot integrated into DriveSutra that provides domain-specific information about eco-driving practices, environmental benefits, and sustainable transportation.

## Features

✅ **Domain-Specific Responses** - Focused exclusively on eco-driving topics
✅ **Gemini AI Integration** - Powered by Google's Gemini API
✅ **Rate Limiting** - Built-in throttling to prevent API abuse
✅ **Error Handling** - Graceful error handling with user-friendly messages
✅ **Beautiful UI** - Animated chat interface with Tailwind CSS and Framer Motion
✅ **Accessibility** - ARIA labels and keyboard navigation support
✅ **Privacy-Focused** - Session-based storage, no persistent data collection
✅ **Comprehensive Testing** - Property-based and unit tests included

## Setup

### 1. Install Dependencies

The required dependencies are already installed:
- `fast-check` - Property-based testing
- `@testing-library/react` - Component testing
- `vitest` - Test runner
- `framer-motion` - Animations

### 2. Configure API Key

Your Gemini API key is already configured in `.env`:

```env
VITE_GEMINI_API_KEY=AIzaSyBs7Ca5eh8m831T_KLMaPi9yCN5_bGIJvQ
```

### 3. Start Development Server

```bash
cd Frontend
npm run dev
```

The chatbot will appear on the home page in the bottom-right corner.

## Usage

### For Users

1. **Open Chat** - Click the green floating button with the 🌱 icon
2. **Ask Questions** - Type questions about eco-driving, fuel efficiency, or sustainable transportation
3. **Get Answers** - Receive AI-powered responses with practical tips and advice
4. **Close Chat** - Click the X button or the widget button again

### Example Questions

- "How can I improve my fuel efficiency?"
- "What are the best eco-driving techniques?"
- "Tell me about hybrid vehicles"
- "How do I reduce my carbon footprint while driving?"
- "What maintenance helps with fuel economy?"

## Components

### ChatWidget
- Floating button in bottom-right corner
- Toggles chat interface open/closed
- Shows unread message count
- Eco-friendly indicator (🌱)

### ChatInterface
- Main conversation window
- Welcome message on open
- Message history with auto-scroll
- Loading indicators
- Error handling

### MessageBubble
- Individual message display
- Distinct styling for user vs bot messages
- Timestamps
- Status indicators (sent/delivered/error)

### MessageInput
- Text input with character limit (1000 chars)
- Send button
- Enter to send, Shift+Enter for new line
- Input validation

## Testing

### Run All Tests

```bash
npm run test
```

### Run Specific Test Suites

```bash
# Chatbot service tests (property-based)
npm run test:run src/services/__tests__/chatbotService.test.js

# Component tests
npm run test:run src/components/__tests__/ChatWidget.test.jsx
npm run test:run src/components/__tests__/ChatInterface.test.jsx
npm run test:run src/components/__tests__/MessageBubble.test.jsx
npm run test:run src/components/__tests__/MessageInput.test.jsx
```

## Architecture

```
Frontend/
├── src/
│   ├── components/
│   │   ├── ChatWidget.jsx           # Main widget component
│   │   ├── ChatInterface.jsx        # Conversation window
│   │   ├── MessageBubble.jsx        # Message display
│   │   ├── MessageInput.jsx         # Input component
│   │   └── __tests__/               # Component tests
│   │       ├── ChatWidget.test.jsx
│   │       ├── ChatInterface.test.jsx
│   │       ├── MessageBubble.test.jsx
│   │       └── MessageInput.test.jsx
│   └── services/
│       ├── chatbotService.js        # Gemini API integration
│       └── __tests__/
│           └── chatbotService.test.js  # Property-based tests
```

## API Integration

The chatbot uses Google's Gemini API with the following configuration:

- **Model**: `gemini-1.5-flash-latest`
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 500 (concise responses)
- **Top P**: 0.8 (diverse responses)

### System Instructions

The chatbot is instructed to:
- Focus exclusively on eco-driving topics
- Provide practical, actionable advice
- Include references to best practices
- Redirect off-topic questions politely
- Keep responses concise (2-3 paragraphs)

## Security & Privacy

✅ **Input Validation** - All user input is validated and sanitized
✅ **API Key Security** - Stored in environment variables
✅ **Rate Limiting** - 1 second minimum between requests
✅ **Error Handling** - No sensitive information exposed in errors
✅ **Session Storage** - Messages not persisted across page reloads
✅ **No PII Collection** - No personal information stored

## Customization

### Change Chatbot Position

Edit `ChatWidget.jsx`:

```jsx
<div className="fixed bottom-6 right-6 z-50">
  {/* Change bottom-6 and right-6 to adjust position */}
</div>
```

### Modify Colors

The chatbot uses Tailwind CSS classes. Main colors:
- Primary: `green-500` (eco-friendly green)
- Secondary: `teal-500`
- Error: `red-500`

### Adjust Rate Limiting

Edit `chatbotService.js`:

```javascript
this.minRequestInterval = 1000; // Change to adjust delay (milliseconds)
```

## Troubleshooting

### Chatbot Not Appearing

1. Check that `ChatWidget` is imported in `Home.jsx`
2. Verify the component is rendered before the footer
3. Check browser console for errors

### API Errors

1. Verify API key is set in `.env`
2. Check API key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)
3. Ensure you haven't exceeded rate limits
4. **Fixed**: Updated to use correct model `gemini-2.5-flash` instead of `gemini-1.5-flash-latest`

### Styling Issues

1. Ensure Tailwind CSS is properly configured
2. Check that Framer Motion is installed
3. Verify no CSS conflicts with existing styles

## Recent Fixes

### ✅ Model Name Issue (Fixed)
**Problem**: Chatbot was returning "technical difficulties" error
**Cause**: Using incorrect model name `gemini-1.5-flash-latest` 
**Solution**: Updated to use `gemini-2.5-flash` which is available in the v1beta API

The chatbot should now work correctly!

## Future Enhancements

Potential improvements:
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Conversation history export
- [ ] Integration with user profile
- [ ] Personalized recommendations based on trip history
- [ ] Offline mode with cached responses

## Support

For issues or questions:
1. Check the console for error messages
2. Review the test suite for expected behavior
3. Consult the design document in `.kiro/specs/eco-drive-chatbot/`

## License

Part of the DriveSutra project.

---

Built with ❤️ and 🌱 for sustainable transportation