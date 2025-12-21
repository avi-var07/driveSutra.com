import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * MessageInput - Text input component for sending messages
 * Handles user input with validation and keyboard shortcuts
 */
const MessageInput = ({ onSendMessage, disabled = false, placeholder = "Type your message..." }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const maxLength = 1000;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;
    
    if (trimmedMessage.length > maxLength) {
      alert(`Message is too long. Please keep it under ${maxLength} characters.`);
      return;
    }

    onSendMessage(trimmedMessage);
    setMessage('');
    setIsTyping(false);
    
    // Focus back to input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    setIsTyping(value.length > 0);
  };

  const isMessageValid = message.trim().length > 0 && message.trim().length <= maxLength;
  const remainingChars = maxLength - message.length;
  const isNearLimit = remainingChars < 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-2" role="form" data-testid="message-form">
      {/* Character count indicator */}
      {isNearLimit && (
        <div className={`text-xs text-right ${remainingChars < 0 ? 'text-red-500' : 'text-gray-500'}`}>
          {remainingChars} characters remaining
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={`
              w-full px-4 py-2 border rounded-lg resize-none
              text-gray-900 placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400
              ${remainingChars < 0 ? 'border-red-300' : 'border-gray-300'}
              transition-all duration-200 bg-white
            `}
            style={{
              minHeight: '40px',
              maxHeight: '120px',
              height: 'auto'
            }}
            onInput={(e) => {
              // Auto-resize textarea
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />

          {/* Typing indicator */}
          {isTyping && !disabled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute right-2 top-2"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </motion.div>
          )}
        </div>

        {/* Send button */}
        <motion.button
          type="submit"
          disabled={!isMessageValid || disabled}
          className={`
            p-2 rounded-lg transition-all duration-200
            ${isMessageValid && !disabled
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          `}
          {...(isMessageValid && !disabled ? {
            whileHover: { scale: 1.05 },
            whileTap: { scale: 0.95 }
          } : {})}
          aria-label="Send message"
        >
          {disabled ? (
            // Loading spinner
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            // Send icon
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* Help text */}
      <div className="text-xs text-gray-500">
        Press Enter to send, Shift+Enter for new line
      </div>
    </form>
  );
};

export default MessageInput;