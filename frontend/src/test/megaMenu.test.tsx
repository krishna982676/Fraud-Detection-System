import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../components/marketing/Navbar';

describe('MegaMenu keyboard & accessibility behavior', () => {
  it('renders navigation buttons with proper aria attributes', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const solutionsBtn = screen.getByRole('button', { name: /solutions/i });
    expect(solutionsBtn).toBeInTheDocument();
    expect(solutionsBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands mega-menu on click and closes on Escape key', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const solutionsBtn = screen.getByRole('button', { name: /solutions/i });
    fireEvent.click(solutionsBtn);
    expect(solutionsBtn).toHaveAttribute('aria-expanded', 'true');

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(solutionsBtn).toHaveAttribute('aria-expanded', 'false');
  });
});

