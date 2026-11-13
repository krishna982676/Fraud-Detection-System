import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { clearSession, saveSession } from '../store/authStore';

describe('Route Guard Protection', () => {
  beforeEach(() => {
    clearSession();
  });

  it('redirects unauthenticated user away from protected area to login', () => {
    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>LOGIN_PAGE</div>} />
          <Route
            path="/app/dashboard"
            element={
              <ProtectedRoute>
                <div>PROTECTED_DASHBOARD</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('PROTECTED_DASHBOARD')).not.toBeInTheDocument();
    expect(screen.getByText('LOGIN_PAGE')).toBeInTheDocument();
  });

  it('allows access to protected area when authenticated session exists', () => {
    saveSession({
      username: 'analyst@sentinelx.io',
      role: 'ANALYST',
      token: 'test_token',
      loginTime: new Date().toISOString(),
    });

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>LOGIN_PAGE</div>} />
          <Route
            path="/app/dashboard"
            element={
              <ProtectedRoute>
                <div>PROTECTED_DASHBOARD</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('PROTECTED_DASHBOARD')).toBeInTheDocument();
  });
});

