import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const VALID_CHANNELS = ['email', 'sms', 'push'];
const VALID_FREQUENCIES = ['none', 'low', 'normal', 'high'];

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: userId } = await context.params;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all notification preferences for the user
    const preferences = await prisma.notificationPreference.findMany({
      where: { userId },
      orderBy: { channel: 'asc' },
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: userId } = await context.params;
    const body = await request.json();

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { channel, frequency, metaJson } = body;

    if (!channel || !frequency) {
      return NextResponse.json(
        { error: 'channel and frequency are required' },
        { status: 400 }
      );
    }

    if (!VALID_CHANNELS.includes(channel)) {
      return NextResponse.json(
        { error: `channel must be one of: ${VALID_CHANNELS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!VALID_FREQUENCIES.includes(frequency)) {
      return NextResponse.json(
        { error: `frequency must be one of: ${VALID_FREQUENCIES.join(', ')}` },
        { status: 400 }
      );
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
    console.error('Update preference error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
