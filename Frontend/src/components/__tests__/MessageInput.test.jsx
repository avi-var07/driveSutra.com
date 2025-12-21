/**
 * Unit tests for MessageInput component
 * Tests empty message prevention, character limit enforcement, and send functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MessageInput from '../MessageInput';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe('MessageInput', () => {
  const mockOnSendMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render input field with placeholder', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} placeholder="Test placeholder" />);
    
    const input = screen.getByPlaceholderText('Test placeholder');
    expect(input).toBeInTheDocument();
    expect(input).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('should prevent sending empty messages', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    const form = screen.getByRole('form') || screen.getByTestId('message-form') || 
                 document.querySelector('form');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    // Send button should be disabled when input is empty
    expect(sendButton).toBeDisabled();
    
    // Try to submit empty form
    if (form) {
      fireEvent.submit(form);
    } else {
      fireEvent.click(sendButton);
    }
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('should enforce character limit', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByRole('textbox');
    const longMessage = 'a'.repeat(1001); // Over 1000 character limit
    
    fireEvent.change(input, { target: { value: longMessage } });
    
    // Should show character count warning
    expect(screen.getByText(/characters remaining/)).toBeInTheDocument();
    
    // Send button should be disabled for over-limit messages
    const sendButton = screen.getByRole('button', { name: /send message/i });
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button for valid messages', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    // Initially disabled
    expect(sendButton).toBeDisabled();
    
    // Type valid message
    fireEvent.change(input, { target: { value: 'Tell me about eco-driving' } });
    
    // Should enable send button
    expect(sendButton).not.toBeDisabled();
  });

  it('should send message when send button is clicked', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    const testMessage = 'How can I drive more efficiently?';
    
    // Type message
    fireEvent.change(input, { target: { value: testMessage } });
    
    // Click send button
    fireEvent.click(sendButton);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith(testMessage);
  });

  it('should send message when Enter key is pressed', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByRole('textbox');
    const testMessage = 'What are the benefits of eco-driving?';
    
    // Type message
    fireEvent.change(input, { target: { value: testMessage } });
    
    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSendMessage).toHaveBeenCalledWith(testMessage);
  });

  it('should not send message when Shift+Enter is pressed', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByRole('textbox');
    const testMessage = 'Multi-line\nmessage';
    
    // Type message
    fireEvent.change(input, { target: { value: testMessage } });
    
    // Press Shift+Enter (should create new line, not send)
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('should clear input after sending message', async () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    const testMessage = 'Tell me about electric vehicles';
    
    // Type and send message
    fireEvent.change(input, { target: { value: testMessage } });
    fireEvent.click(sendButton);
    
    // Input should be cleared
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should disable input when disabled prop is true', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} disabled={true} />);
    
    const input = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('should show loading spinner when disabled', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} disabled={true} />);
    
    // Should show loading spinner in send button
    const sendButton = screen.getByRole('button', { name: /send message/i });
    expect(sendButton).toBeInTheDocument();
    
    // Button should contain loading indicator (spinner SVG)
    const spinner = sendButton.querySelector('svg');
    expect(spinner).toBeInTheDocument();
  });

  it('should show help text about keyboard shortcuts', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    expect(screen.getByText(/Press Enter to send, Shift\+Enter for new line/)).toBeInTheDocument();
  });

  it('should trim whitespace from messages', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    const messageWithWhitespace = '  Tell me about hybrid cars  ';
    const expectedMessage = 'Tell me about hybrid cars';
    
    // Type message with whitespace
    fireEvent.change(input, { target: { value: messageWithWhitespace } });
    fireEvent.click(sendButton);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith(expectedMessage);
  });
});