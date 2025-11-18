import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateConsentSchema, userIdParamSchema } from '@/lib/validation';
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

    // Get all consent categories with user's consent status
    const categories = await prisma.consentCategory.findMany({
      include: {
        userConsents: {
          where: { userId },
        },
      },
      orderBy: { name: 'asc' },
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
    return handleError(error);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const { id: userId } = validateParams(params, userIdParamSchema);
    const { categoryId, status } = await validateBody(request, updateConsentSchema);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    // Verify category exists
    const category = await prisma.consentCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundError('Consent category', categoryId);
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
      include: {
        category: {
          select: {
            key: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ consent });
  } catch (error) {
    return handleError(error);
  }
}
