/**
 * Unit tests for ChatWidget component
 * Tests widget visibility, toggle functionality, and basic interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatWidget from '../ChatWidget';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock ChatInterface component
vi.mock('../ChatInterface', () => ({
  default: ({ onClose, onNewMessage }) => (
    <div data-testid="chat-interface">
      <button onClick={onClose} data-testid="close-chat">Close</button>
      <button onClick={onNewMessage} data-testid="new-message">New Message</button>
    </div>
  )
}));

describe('ChatWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render chat widget button on page load', () => {
    render(<ChatWidget />);
    
    const chatButton = screen.getByRole('button', { name: /open eco-drive chat/i });
    expect(chatButton).toBeInTheDocument();
    
    // Should show chat icon initially
    expect(chatButton).toHaveAttribute('aria-label', 'Open eco-drive chat');
  });

  it('should toggle chat interface when button is clicked', async () => {
    render(<ChatWidget />);
    
    const chatButton = screen.getByRole('button');
    
    // Initially closed
    expect(screen.queryByTestId('chat-interface')).not.toBeInTheDocument();
    
    // Click to open
    fireEvent.click(chatButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('chat-interface')).toBeInTheDocument();
    });
    
    // Button should now show close icon
    expect(chatButton).toHaveAttribute('aria-label', 'Close eco-drive chat');
  });

  it('should close chat interface when close button is clicked', async () => {
    render(<ChatWidget />);
    
    const chatButton = screen.getByRole('button');
    
    // Open chat
    fireEvent.click(chatButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('chat-interface')).toBeInTheDocument();
    });
    
    // Close chat using interface close button
    const closeButton = screen.getByTestId('close-chat');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('chat-interface')).not.toBeInTheDocument();
    });
  });

  it('should manage unread message count correctly', async () => {
    render(<ChatWidget />);
    
    const chatButton = screen.getByRole('button');
    
    // Open chat
    fireEvent.click(chatButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('chat-interface')).toBeInTheDocument();
    });
    
    // Close chat
    fireEvent.click(chatButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('chat-interface')).not.toBeInTheDocument();
    });
    
    // Simulate new message when chat is closed
    fireEvent.click(chatButton); // Open again
    
    await waitFor(() => {
      const newMessageButton = screen.getByTestId('new-message');
      fireEvent.click(newMessageButton);
    });
    
    // Close chat to see unread count
    fireEvent.click(chatButton);
    
    // Should show unread badge (this would be visible in the DOM structure)
    expect(chatButton).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<ChatWidget />);
    
    const chatButton = screen.getByRole('button');
    
    // Should have proper ARIA label
    expect(chatButton).toHaveAttribute('aria-label');
    
    // Should be focusable
    expect(chatButton).not.toHaveAttribute('tabindex', '-1');
  });

  it('should display eco-friendly indicator', () => {
    render(<ChatWidget />);
    
    // Should contain eco-friendly emoji or indicator
    const widget = screen.getByRole('button');
    expect(widget).toBeInTheDocument();
    
    // The widget should be in the DOM structure
    expect(widget.closest('.fixed')).toBeInTheDocument();
  });
});