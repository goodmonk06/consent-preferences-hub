import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create consent categories
  const categories = [
    {
      key: 'analytics',
      name: 'Analytics',
      description: 'Allow us to collect analytics data to improve our services',
    },
    {
      key: 'marketing',
      name: 'Marketing',
      description: 'Receive marketing communications and promotional offers',
    },
    {
      key: 'research',
      name: 'Research',
      description: 'Participate in research studies and surveys',
    },
    {
      key: 'personalization',
      name: 'Personalization',
      description: 'Enable personalized content and recommendations',
    },
  ];

  console.log('Creating consent categories...');
  for (const category of categories) {
    await prisma.consentCategory.upsert({
      where: { key: category.key },
      update: {},
      create: category,
    });
  }

  // Create sample users
  const users = [
    { email: 'alice@example.com' },
    { email: 'bob@example.com' },
    { email: 'charlie@example.com' },
  ];

  console.log('Creating sample users...');
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });

    // Create default notification preferences for each user
    const channels = ['email', 'sms', 'push'] as const;
    for (const channel of channels) {
      await prisma.notificationPreference.upsert({
        where: {
          userId_channel: {
            userId: user.id,
            channel,
          },
        },
        update: {},
        create: {
          userId: user.id,
          channel,
          frequency: 'normal',
        },
      });
    }

    console.log(`  ✓ Created user: ${userData.email}`);
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
