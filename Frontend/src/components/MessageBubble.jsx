import React from 'react';
import { motion } from 'framer-motion';

/**
 * MessageBubble - Individual message bubble component
 * Displays user and bot messages with distinct styling
 */
const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';
  const isError = message.status === 'error';

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return (
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">🌱</span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`
            rounded-lg px-4 py-2 shadow-sm border
            ${isUser
              ? isError
                ? 'bg-red-100 border-red-200 text-red-800'
                : 'bg-green-500 text-white'
              : 'bg-white border-gray-200 text-gray-800'
            }
          `}
        >
          {/* Message content */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>

          {/* Timestamp and status */}
          <div className={`flex items-center justify-between mt-2 text-xs ${
            isUser 
              ? isError 
                ? 'text-red-600' 
                : 'text-green-100'
              : 'text-gray-500'
          }`}>
            <span>{formatTime(message.timestamp)}</span>
            {isUser && (
              <div className="ml-2">
                {getStatusIcon(message.status)}
              </div>
            )}
          </div>
        </div>

        {/* User avatar */}
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;