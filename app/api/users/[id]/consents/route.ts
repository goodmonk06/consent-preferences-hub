import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

    // Get all consent categories with user's consent status
    const categories = await prisma.consentCategory.findMany({
      include: {
        userConsents: {
          where: { userId },
        },
      },
    });

    const consents = categories.map((category) => ({
      categoryId: category.id,
      categoryKey: category.key,
      categoryName: category.name,
      description: category.description,
      status: category.userConsents[0]?.status ?? null,
      updatedAt: category.userConsents[0]?.updatedAt ?? null,
    }));

    return NextResponse.json({ consents });
  } catch (error) {
    console.error('Get consents error:', error);
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

    const { categoryId, status } = body;

    if (!categoryId || !status) {
      return NextResponse.json(
        { error: 'categoryId and status are required' },
        { status: 400 }
      );
    }

    if (status !== 'granted' && status !== 'denied') {
      return NextResponse.json(
        { error: 'status must be either "granted" or "denied"' },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await prisma.consentCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Consent category not found' },
        { status: 404 }
      );
    }

    // Upsert user consent
    const consent = await prisma.userConsent.upsert({
      where: {
        userId_categoryId: {
          userId,
          categoryId,
        },
      },
      update: {
        status,
      },
      create: {
        userId,
        categoryId,
        status,
      },
    });

    return NextResponse.json({ consent });
  } catch (error) {
    console.error('Update consent error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
