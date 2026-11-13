import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { DemoPage } from '../features/marketing/DemoPage';

describe('Demo Request Form Validation', () => {
  it('displays validation errors when submitting empty form', async () => {
    render(
      <HelmetProvider>
        <DemoPage />
      </HelmetProvider>
    );

    const submitBtn = screen.getByRole('button', { name: /submit technical request/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/first name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/last name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/valid business email/i)).toBeInTheDocument();
      expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
    });
  });
});

