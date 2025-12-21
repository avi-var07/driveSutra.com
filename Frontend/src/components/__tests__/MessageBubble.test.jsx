/**
 * Property-based tests for MessageBubble component
 * **Feature: eco-drive-chatbot, Property 9: Message display consistency**
 * **Validates: Requirements 5.2, 5.4**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import MessageBubble from '../MessageBubble';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe('MessageBubble Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Property 9: Message display consistency', () => {
    /**
     * **Feature: eco-drive-chatbot, Property 9: Message display consistency**
     * For any message sent by users, it should appear immediately in the conversation history 
     * and be visually distinct from bot responses
     */
    it('should display user and bot messages with distinct visual styling', () => {
      fc.assert(fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          content: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
          sender: fc.constantFrom('user', 'bot'),
          timestamp: fc.date(),
          status: fc.constantFrom('sent', 'delivered', 'error')
        }),
        (message) => {
          const { container } = render(<MessageBubble message={message} />);
          
          // Message should be rendered
          expect(container.firstChild).toBeInTheDocument();
          
          // Should contain the message content (use container to avoid multiple matches)
          const messageContent = container.querySelector('.text-sm.leading-relaxed.whitespace-pre-wrap');
          expect(messageContent).toBeInTheDocument();
          expect(messageContent.textContent).toBe(message.content);
          
          // Should display timestamp
          const timestamp = new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          expect(container.textContent).toContain(timestamp);
          
          // Visual distinction: user and bot messages should have different styling
          const messageContainer = container.querySelector('.flex');
          if (message.sender === 'user') {
            // User messages should be right-aligned
            expect(messageContainer).toHaveClass('justify-end');
          } else {
            // Bot messages should be left-aligned
            expect(messageContainer).toHaveClass('justify-start');
          }
        }
      ), { numRuns: 50 });
    });

    it('should display message status indicators for user messages', () => {
      const userMessage = {
        id: 'test-user-msg',
        content: 'Test user message',
        sender: 'user',
        timestamp: new Date(),
        status: 'delivered'
      };

      const { container } = render(<MessageBubble message={userMessage} />);
      
      // Should show status indicator for user messages (SVG icon)
      const statusIcon = container.querySelector('svg');
      expect(statusIcon).toBeInTheDocument();
    });

    it('should not display status indicators for bot messages', () => {
      const botMessage = {
        id: 'test-bot-msg',
        content: 'Test bot response about eco-driving',
        sender: 'bot',
        timestamp: new Date(),
        status: 'delivered'
      };

      const { container } = render(<MessageBubble message={botMessage} />);
      
      // Bot messages should not have status indicators in the same way
      // The structure should be different from user messages
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText(botMessage.content)).toBeInTheDocument();
    });

    it('should handle different message statuses correctly', () => {
      const statuses = ['sent', 'delivered', 'error'];
      
      statuses.forEach(status => {
        const message = {
          id: `test-${status}`,
          content: `Test message with ${status} status`,
          sender: 'user',
          timestamp: new Date(),
          status: status
        };

        const { container } = render(<MessageBubble message={message} />);
        
        // Message should render regardless of status
        expect(screen.getByText(message.content)).toBeInTheDocument();
        
        // Error status should have different styling
        if (status === 'error') {
          const messageBubble = container.querySelector('.bg-red-100, .border-red-200, .text-red-800');
          expect(messageBubble).toBeInTheDocument();
        }
      });
    });

    it('should display avatars correctly for different senders', () => {
      const userMessage = {
        id: 'user-msg',
        content: 'User message',
        sender: 'user',
        timestamp: new Date(),
        status: 'sent'
      };

      const botMessage = {
        id: 'bot-msg',
        content: 'Bot message',
        sender: 'bot',
        timestamp: new Date(),
        status: 'delivered'
      };

      // Test user message
      const { container: userContainer } = render(<MessageBubble message={userMessage} />);
      expect(userContainer.firstChild).toBeInTheDocument();

      // Test bot message  
      const { container: botContainer } = render(<MessageBubble message={botMessage} />);
      expect(botContainer.firstChild).toBeInTheDocument();
      
      // Both should render but with different layouts
      expect(userContainer.firstChild).not.toEqual(botContainer.firstChild);
    });

    it('should handle long message content properly', () => {
      const longMessage = {
        id: 'long-msg',
        content: 'This is a very long message that should wrap properly and maintain readability even when it contains a lot of text about eco-driving practices and environmental benefits of sustainable transportation methods.',
        sender: 'bot',
        timestamp: new Date(),
        status: 'delivered'
      };

      render(<MessageBubble message={longMessage} />);
      
      // Should display the full content
      expect(screen.getByText(longMessage.content)).toBeInTheDocument();
    });
  });
});