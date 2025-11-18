import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: unknown;
    statusCode: number;
  };
}

export function handleError(error: unknown): NextResponse<ErrorResponse> {
  // Log the error (in production, send to logging service)
  console.error('API Error:', error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
          statusCode: 400,
        },
      },
      { status: 400 }
    );
  }

  // Handle our custom app errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          details: error instanceof ValidationError ? error.details : undefined,
          statusCode: error.statusCode,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: unknown };

    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        {
          error: {
            message: 'A record with this unique field already exists',
            code: 'DUPLICATE_RECORD',
            statusCode: 409,
          },
        },
        { status: 409 }
      );
    }

    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        {
          error: {
            message: 'Record not found',
            code: 'NOT_FOUND',
            statusCode: 404,
          },
        },
        { status: 404 }
      );
    }
  }

  // Default error response
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred';

  return NextResponse.json(
    {
      error: {
        message,
        code: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
      },
    },
    { status: 500 }
  );
}

// Helper to validate request body
export async function validateBody<T>(
  request: Request,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw error;
    }
    throw new ValidationError('Invalid request body');
  }
}

// Helper to validate params
export function validateParams<T>(
  params: unknown,
  schema: { parse: (data: unknown) => T }
): T {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      throw error;
    }
    throw new ValidationError('Invalid parameters');
  }
}
