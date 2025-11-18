import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.DATABASE_URL =
  'postgresql://test:test@localhost:5432/test?schema=public';
process.env.AUTH_SECRET = 'test-secret-key-at-least-32-characters-long';
process.env.NODE_ENV = 'test';
