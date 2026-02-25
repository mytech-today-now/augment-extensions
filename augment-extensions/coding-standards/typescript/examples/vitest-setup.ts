// test/setup.ts - Vitest + MSW Setup Example
// This file sets up the test environment with MSW for API mocking

import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server';

// ============================================================================
// MSW Server Setup
// ============================================================================

// Start MSW server before all tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error' // Fail tests on unhandled requests
  });
  console.log('🔶 MSW server started');
});

// Reset handlers after each test to ensure test isolation
afterEach(() => {
  server.resetHandlers();
  cleanup(); // Clean up React Testing Library
});

// Clean up after all tests
afterAll(() => {
  server.close();
  console.log('🔶 MSW server closed');
});

// ============================================================================
// MSW Handlers (test/mocks/handlers.ts)
// ============================================================================

import { http, HttpResponse } from 'msw';

export const handlers = [
  // GET /api/users - List users
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ]);
  }),

  // GET /api/users/:id - Get user by ID
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id: Number(id),
      name: 'John Doe',
      email: 'john@example.com'
    });
  }),

  // POST /api/users - Create user
  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json();
    return HttpResponse.json(
      { id: 3, ...newUser },
      { status: 201 }
    );
  }),

  // PUT /api/users/:id - Update user
  http.put('/api/users/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    return HttpResponse.json({
      id: Number(id),
      ...updates
    });
  }),

  // DELETE /api/users/:id - Delete user
  http.delete('/api/users/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json(
      { message: `User ${id} deleted` },
      { status: 200 }
    );
  }),

  // Error response example
  http.get('/api/error', () => {
    return HttpResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }),

  // Delayed response example
  http.get('/api/slow', async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return HttpResponse.json({ data: 'slow response' });
  }),

  // Paginated response example
  http.get('/api/posts', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;

    return HttpResponse.json({
      data: Array.from({ length: limit }, (_, i) => ({
        id: (page - 1) * limit + i + 1,
        title: `Post ${(page - 1) * limit + i + 1}`
      })),
      pagination: {
        page,
        limit,
        total: 100,
        totalPages: Math.ceil(100 / limit)
      }
    });
  })
];

// ============================================================================
// MSW Server (test/mocks/server.ts)
// ============================================================================

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// ============================================================================
// Example Test (src/api/users.test.ts)
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';
import { UserList } from './UserList';

describe('UserList', () => {
  it('renders users from API', async () => {
    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Override handler for this specific test
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json(
          { message: 'Failed to fetch users' },
          { status: 500 }
        );
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('Error loading users')).toBeInTheDocument();
    });
  });

  it('handles empty response', async () => {
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json([]);
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  it('creates a new user', async () => {
    const { getByRole, getByLabelText } = render(<UserForm />);

    const nameInput = getByLabelText('Name');
    const emailInput = getByLabelText('Email');
    const submitButton = getByRole('button', { name: 'Submit' });

    await userEvent.type(nameInput, 'New User');
    await userEvent.type(emailInput, 'new@example.com');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('User created successfully')).toBeInTheDocument();
    });
  });
});

