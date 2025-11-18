import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updatePreferenceSchema, userIdParamSchema } from '@/lib/validation';
import {
  handleError,
  NotFoundError,
  validateBody,
  validateParams,
} from '@/lib/errors';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const { id: userId } = validateParams(params, userIdParamSchema);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    // Get all notification preferences for the user
    const preferences = await prisma.notificationPreference.findMany({
      where: { userId },
      orderBy: { channel: 'asc' },
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const { id: userId } = validateParams(params, userIdParamSchema);
    const { channel, frequency, metaJson } = await validateBody(
      request,
      updatePreferenceSchema
    );

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    // Upsert notification preference
    const preference = await prisma.notificationPreference.upsert({
      where: {
        userId_channel: {
          userId,
          channel,
        },
      },
      update: {
        frequency,
        metaJson: metaJson ?? undefined,
      },
      create: {
        userId,
        channel,
        frequency,
        metaJson: metaJson ?? undefined,
      },
    });

    return NextResponse.json({ preference });
  } catch (error) {
    return handleError(error);
  }
}
