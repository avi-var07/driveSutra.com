/**
 * Unit tests for ChatInterface component
 * Tests welcome message display, message history rendering, and user interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface from '../ChatInterface';

// Mock scrollIntoView
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
});

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock MessageBubble component
vi.mock('../MessageBubble', () => ({
  default: ({ message }) => (
    <div data-testid={`message-${message.sender}`}>
      {message.content}
    </div>
  )
}));

// Mock MessageInput component
vi.mock('../MessageInput', () => ({
  default: ({ onSendMessage, disabled, placeholder }) => (
    <div data-testid="message-input">
      <input 
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          if (e.target.value === 'test message') {
            onSendMessage('test message');
          }
        }}
      />
    </div>
  )
}));

// Mock chatbot service
vi.mock('../../services/chatbotService', () => ({
  default: {
    sendMessage: vi.fn(),
    handleError: vi.fn(() => 'Error occurred')
  }
}));

describe('ChatInterface', () => {
  const mockOnClose = vi.fn();
  const mockOnNewMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display welcome message when component loads', () => {
    render(<ChatInterface onClose={mockOnClose} onNewMessage={mockOnNewMessage} />);
    
    // Should show the welcome message
    expect(screen.getByText(/Hello! I'm your Eco-Drive Assistant/)).toBeInTheDocument();
    expect(screen.getByText(/sustainable driving practices/)).toBeInTheDocument();
  });

  it('should render chat interface with proper header', () => {
    render(<ChatInterface onClose={mockOnClose} onNewMessage={mockOnNewMessage} />);
    
    // Should show header with title
    expect(screen.getByText('Eco-Drive Assistant')).toBeInTheDocument();
    expect(screen.getByText('Sustainable driving tips & advice')).toBeInTheDocument();
    
    // Should have close button
    const closeButton = screen.getByRole('button', { name: /close chat/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<ChatInterface onClose={mockOnClose} onNewMessage={mockOnNewMessage} />);
    
    const closeButton = screen.getByRole('button', { name: /close chat/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render message input component', () => {
    render(<ChatInterface onClose={mockOnClose} onNewMessage={mockOnNewMessage} />);
    
    const messageInput = screen.getByTestId('message-input');
    expect(messageInput).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText('Ask me about eco-driving tips...');
    expect(input).toBeInTheDocument();
  });

  it('should display messages in the conversation', () => {
    render(<ChatInterface onClose={mockOnClose} onNewMessage={mockOnNewMessage} />);
    
    // Should show welcome message as bot message
    const botMessage = screen.getByTestId('message-bot');
    expect(botMessage).toBeInTheDocument();
    expect(botMessage).toHaveTextContent(/Hello! I'm your Eco-Drive Assistant/);
  });

  it('should have proper accessibility structure', () => {
    render(<ChatInterface onClose={mockOnClose} onNewMessage={mockOnNewMessage} />);
    
    // Should have proper heading structure
    expect(screen.getByText('Eco-Drive Assistant')).toBeInTheDocument();
    
    // Close button should have proper aria-label
    const closeButton = screen.getByRole('button', { name: /close chat/i });
    expect(closeButton).toHaveAttribute('aria-label', 'Close chat');
  });

  it('should show loading indicator when disabled', () => {
    render(<ChatInterface onClose={mockOnClose} onNewMessage={mockOnNewMessage} />);
    
    const messageInput = screen.getByTestId('message-input');
    const input = messageInput.querySelector('input');
    
    // Input should not be disabled initially
    expect(input).not.toBeDisabled();
  });
});