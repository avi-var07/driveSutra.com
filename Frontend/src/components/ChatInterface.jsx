import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import chatbotService from '../services/chatbotService';

/**
 * ChatInterface - Main conversation window with message history
 * Handles the chat conversation flow and displays messages
 */
const ChatInterface = ({ onClose, onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const sessionId = useRef(Date.now().toString());

  // Welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome-' + Date.now(),
      content: "Hello! I'm your Eco-Drive Assistant 🌱 I'm here to help you learn about sustainable driving practices, fuel efficiency tips, and eco-friendly transportation options. What would you like to know about eco-driving?",
      sender: 'bot',
      timestamp: new Date(),
      status: 'delivered'
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage = {
      id: 'user-' + Date.now(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Send to chatbot service
      const response = await chatbotService.sendMessage(messageText);
      
      // Add bot response
      const botMessage = {
        id: 'bot-' + Date.now(),
        content: response,
        sender: 'bot',
        timestamp: new Date(),
        status: 'delivered'
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Notify parent of new message (for unread count)
      if (onNewMessage) {
        onNewMessage();
      }

      // Update user message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'delivered' }
            : msg
        )
      );

    } catch (err) {
      console.error('Chat error:', err);
      
      // Handle error
      const errorMessage = chatbotService.handleError(err);
      const botErrorMessage = {
        id: 'bot-error-' + Date.now(),
        content: errorMessage,
        sender: 'bot',
        timestamp: new Date(),
        status: 'error'
      };

      setMessages(prev => [...prev, botErrorMessage]);
      
      // Update user message status to error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'error' }
            : msg
        )
      );

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="bg-green-500 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-green-500 text-lg">🌱</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Eco-Drive Assistant</h3>
            <p className="text-green-100 text-sm">Sustainable driving tips & advice</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-green-200 transition-colors p-1 rounded"
          aria-label="Close chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
          />
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg p-3 shadow-sm border max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-500 text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder="Ask me about eco-driving tips..."
        />
      </div>
    </motion.div>
  );
};

export default ChatInterface;