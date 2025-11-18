import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { handleError, UnauthorizedError } from '@/lib/errors';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new UnauthorizedError('Not authenticated');
    }

    return NextResponse.json({ user });
  } catch (error) {
    return handleError(error);
  }
}
