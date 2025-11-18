# Consent & Preferences Hub

A full-stack TypeScript application for managing user consents and notification preferences. Built with Next.js, Prisma, and PostgreSQL.

## Overview

This hub provides:
- **User consent management** for different data collection purposes (analytics, marketing, research, etc.)
- **Notification preferences** management (email, SMS, push) with frequency controls
- **REST APIs** for external services to read/write user preferences
- **Web UI** for users to manage their own settings

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Simple email-based session authentication (iron-session)
- **Styling**: Tailwind CSS

## Data Model

### User
```typescript
{
  id: string          // Unique identifier (cuid)
  email: string       // Email address (unique)
  createdAt: DateTime // Account creation timestamp
}
```

### ConsentCategory
```typescript
{
  id: string          // Unique identifier (cuid)
  key: string         // Unique key (e.g., 'analytics', 'marketing')
  name: string        // Display name
  description: string // Purpose description
  createdAt: DateTime // Category creation timestamp
}
```

### UserConsent
```typescript
{
  id: string                           // Unique identifier (cuid)
  userId: string                       // Reference to User
  categoryId: string                   // Reference to ConsentCategory
  status: 'granted' | 'denied'         // Consent status
  updatedAt: DateTime                  // Last update timestamp
  createdAt: DateTime                  // Consent creation timestamp
}
```

### NotificationPreference
```typescript
{
  id: string                                    // Unique identifier (cuid)
  userId: string                                // Reference to User
  channel: 'email' | 'sms' | 'push'             // Notification channel
  frequency: 'none' | 'low' | 'normal' | 'high' // Notification frequency
  metaJson: JSON                                // Optional metadata
  updatedAt: DateTime                           // Last update timestamp
  createdAt: DateTime                           // Preference creation timestamp
}
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for local database)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd consent-preferences-hub
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Start the PostgreSQL database:
```bash
docker-compose up -d
```

5. Run database migrations:
```bash
npm run db:migrate
```

6. Seed the database with sample data:
```bash
npm run db:seed
```

7. Start the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations (development)
- `npm run db:migrate:deploy` - Deploy migrations (production)
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:reset` - Reset database (⚠️ destructive)
- `npm run db:generate` - Generate Prisma Client

## Sample Users

After seeding, these users are available:
- alice@example.com
- bob@example.com
- charlie@example.com

## API Reference

All API endpoints return JSON responses.

### Authentication

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "user": {
    "id": "clx123...",
    "email": "user@example.com"
  }
}
```

#### Get Current User
```bash
GET /api/auth/me
```

**Response:**
```json
{
  "user": {
    "id": "clx123...",
    "email": "user@example.com"
  }
}
```

#### Logout
```bash
POST /api/auth/logout
```

### Consents

#### Get User Consents
```bash
GET /api/users/:userId/consents
```

**Response:**
```json
{
  "consents": [
    {
      "categoryId": "clx456...",
      "categoryKey": "analytics",
      "categoryName": "Analytics",
      "description": "Allow us to collect analytics data to improve our services",
      "status": "granted",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    {
      "categoryId": "clx789...",
      "categoryKey": "marketing",
      "categoryName": "Marketing",
      "description": "Receive marketing communications and promotional offers",
      "status": null,
      "updatedAt": null
    }
  ]
}
```

#### Update User Consent
```bash
POST /api/users/:userId/consents
Content-Type: application/json

{
  "categoryId": "clx456...",
  "status": "granted"
}
```

**Response:**
```json
{
  "consent": {
    "id": "clx999...",
    "userId": "clx123...",
    "categoryId": "clx456...",
    "status": "granted",
    "updatedAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Preferences

#### Get User Notification Preferences
```bash
GET /api/users/:userId/preferences
```

**Response:**
```json
{
  "preferences": [
    {
      "id": "clx111...",
      "userId": "clx123...",
      "channel": "email",
      "frequency": "normal",
      "metaJson": null,
      "updatedAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "clx222...",
      "userId": "clx123...",
      "channel": "sms",
      "frequency": "low",
      "metaJson": null,
      "updatedAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Update User Notification Preference
```bash
POST /api/users/:userId/preferences
Content-Type: application/json

{
  "channel": "email",
  "frequency": "high",
  "metaJson": { "custom": "data" }
}
```

**Response:**
```json
{
  "preference": {
    "id": "clx111...",
    "userId": "clx123...",
    "channel": "email",
    "frequency": "high",
    "metaJson": { "custom": "data" },
    "updatedAt": "2024-01-15T10:35:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## Using the APIs from Other Services

### Example: Check if user has granted analytics consent

```bash
curl -X GET http://localhost:3000/api/users/clx123.../consents \
  -H "Content-Type: application/json"
```

### Example: Update notification preferences

```bash
curl -X POST http://localhost:3000/api/users/clx123.../preferences \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "email",
    "frequency": "low"
  }'
```

### Integration Pattern

1. **Store User ID**: When a user is created in your app, store their consent hub user ID
2. **Check Consents**: Before performing analytics/marketing actions, check user consents:
   ```typescript
   const response = await fetch(`${CONSENT_HUB_URL}/api/users/${userId}/consents`);
   const { consents } = await response.json();
   const analyticsConsent = consents.find(c => c.categoryKey === 'analytics');

   if (analyticsConsent?.status === 'granted') {
     // Proceed with analytics
   }
   ```

3. **Respect Preferences**: Before sending notifications, check preferences:
   ```typescript
   const response = await fetch(`${CONSENT_HUB_URL}/api/users/${userId}/preferences`);
   const { preferences } = await response.json();
   const emailPref = preferences.find(p => p.channel === 'email');

   if (emailPref?.frequency !== 'none') {
     // Send notification based on frequency
   }
   ```

## Web UI

- **Home** (`/`) - Login and dashboard
- **Consent Management** (`/me/consent`) - Toggle consent for each category
- **Notification Preferences** (`/me/preferences`) - Set frequency for each channel

## Database Schema Visualization

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id (PK)             │
│ email (unique)      │
│ createdAt           │
└─────────────────────┘
         ↓
         ↓ (1:N)
         ↓
┌─────────────────────┐         ┌─────────────────────┐
│   UserConsent       │────────▶│  ConsentCategory    │
├─────────────────────┤         ├─────────────────────┤
│ id (PK)             │         │ id (PK)             │
│ userId (FK)         │         │ key (unique)        │
│ categoryId (FK)     │         │ name                │
│ status              │         │ description         │
│ updatedAt           │         │ createdAt           │
│ createdAt           │         └─────────────────────┘
└─────────────────────┘

         ↓ (1:N)
         ↓
┌─────────────────────┐
│ NotificationPref    │
├─────────────────────┤
│ id (PK)             │
│ userId (FK)         │
│ channel             │
│ frequency           │
│ metaJson            │
│ updatedAt           │
│ createdAt           │
└─────────────────────┘
```

## Production Deployment

### Environment Variables

For production, update `.env`:

```bash
# Production database URL
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# Strong random secret (use: openssl rand -base64 32)
AUTH_SECRET="your-secure-random-string-at-least-32-characters"
```

### Deployment Steps

1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npm run db:migrate:deploy`
4. Build the app: `npm run build`
5. Start the server: `npm start`

### Recommended Setup

- Use connection pooling (e.g., PgBouncer) for production
- Set up proper CORS policies for API access
- Implement rate limiting on API endpoints
- Use a proper authentication system (OAuth, JWT) instead of the stub
- Enable HTTPS in production

## Architecture Notes

### API Design

- RESTful endpoints with resource-based URLs
- Consistent JSON request/response format
- Upsert pattern for consents and preferences (no separate update endpoint needed)
- User ID in URL path for explicit resource access

### Data Integrity

- Unique constraints on user-category and user-channel pairs
- Foreign key constraints with cascade deletes
- Timestamps for audit trails

### Security Considerations

⚠️ **Current Implementation**: Simple email-based auth for demo purposes

For production:
- Implement proper authentication (OAuth 2.0, JWT, etc.)
- Add API key authentication for service-to-service calls
- Implement RBAC (users can only access their own data)
- Add CSRF protection
- Rate limiting on all endpoints
- Input validation and sanitization

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
