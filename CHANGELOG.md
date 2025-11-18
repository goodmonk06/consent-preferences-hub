# Changelog

All notable changes to the Consent & Preferences Hub will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-11-18

### Added - Phase 3: Deep Expansion

**Domain Model Expansion**
- `ConsentAuditLog` model for tracking all consent changes with full context
- `ConsentWithdrawal` model for GDPR/CCPA withdrawal request tracking
- `ConsentTemplate` and `ConsentTemplateItem` for reusable consent bundles
- `TemplateApplication` for tracking template applications
- `UserGroup` and `UserGroupMembership` for user segmentation
- `DomainEvent` model for event sourcing and integration
- `WebhookSubscription` and `WebhookDelivery` for webhook integration
- Enhanced `User` model with firstName, lastName, metadata, updatedAt
- Enhanced `ConsentCategory` with isRequired, displayOrder, isActive, region, legalBasis, dataRetentionDays
- Enhanced `UserConsent` with source, ipAddress, userAgent, notes, expiresAt, improved indexes
- Enhanced `NotificationPreference` with isEnabled, quietHours, timezone
- New enums: `AuditAction`, `WithdrawalStatus`
- Extended enums: `NotificationChannel` (in_app, webhook), `Frequency` (realtime)

**Observability & Infrastructure**
- Structured logging utility (`lib/logger.ts`) with context-aware logging
- Metrics collection system (`lib/metrics.ts`) for counters, gauges, histograms
- Event bus system (`lib/events/eventBus.ts`) for publishing and subscribing to domain events
- Domain event type definitions (`lib/events/types.ts`) with 12+ event types
- Adapter interfaces for notifications, analytics, and storage (`lib/adapters/index.ts`)
- Console, Email, Segment, Redis, and in-memory adapter implementations

**Documentation**
- `docs/PHASE3_OVERVIEW.md` - comprehensive Phase 3 plan and vision (3500+ words)
- `CHANGELOG.md` - this file

### Changed

**Schema Breaking Changes**
- User model now has `firstName`, `lastName`, `metadata`, and `updatedAt` fields
- ConsentCategory model has multiple new fields (see Added section)
- UserConsent model has multiple new fields and indexes (see Added section)
- NotificationPreference model has new fields (see Added section)

**Migration Required**
- Database migration required to upgrade from v0.2.0 to v0.3.0
- Run `npm run db:migrate` to apply schema changes

## [0.2.0] - 2025-11-18

### Added - Phase 2: Foundation & Consistency

**Validation & Error Handling**
- Zod validation schemas for all API inputs (`lib/validation.ts`)
- Centralized error handling with custom error classes (`lib/errors.ts`)
- Type-safe validation with `validateBody` and `validateParams` helpers
- Consistent error response shapes across all endpoints

**Testing**
- Vitest test framework setup (`vitest.config.ts`, `vitest.setup.ts`)
- 32 passing tests for validation and error handling
- Test scripts: `test`, `test:ui`, `test:run`, `test:coverage`, `typecheck`

**Infrastructure**
- Dockerfile for production deployment
- Updated docker-compose.yml with app service
- Next.js standalone output configuration
- Health check for PostgreSQL in docker-compose

**Developer Experience**
- Enhanced package.json with test, typecheck, and coverage scripts
- Improved TypeScript configuration

### Changed

**API Routes**
- All routes now use Zod validation instead of manual checks
- All routes use centralized error handling
- Improved error messages and HTTP status codes
- Added input validation error details in responses

## [0.1.0] - 2025-11-18

### Added - Initial Release

**Core Features**
- User management with email-based identification
- Consent category management (analytics, marketing, research, personalization)
- User consent tracking (granted/denied status)
- Notification preferences (email, SMS, push) with frequency controls
- RESTful JSON APIs for consents and preferences
- Session-based authentication with iron-session

**API Endpoints**
- `POST /api/auth/login` - Email-based login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `GET /api/users/:id/consents` - Get user's consents
- `POST /api/users/:id/consents` - Update user consent
- `GET /api/users/:id/preferences` - Get user's notification preferences
- `POST /api/users/:id/preferences` - Update notification preference

**UI Pages**
- Home page with login and dashboard
- `/me/consent` - Consent management with toggles
- `/me/preferences` - Notification preference management

**Database**
- Prisma schema with User, ConsentCategory, UserConsent, NotificationPreference models
- PostgreSQL database
- Seed script with sample data (3 users, 4 consent categories)

**Infrastructure**
- Next.js 16 with App Router and TypeScript
- Docker Compose for PostgreSQL
- Environment configuration with .env.example
- Comprehensive README with API documentation

**Developer Tools**
- Prisma migrations
- Database seeding
- npm scripts for common tasks

---

## Migration Guides

### v0.2.0 → v0.3.0

**Database Migration**
```bash
# Backup your database first!
npm run db:migrate
```

**Breaking Changes**
1. User model now requires handling of optional `firstName`, `lastName`, and `metadata` fields
2. ConsentCategory queries should account for new fields like `isActive`, `isRequired`
3. NotificationPreference queries should account for `isEnabled` field

**New Features to Integrate**
- Event bus: Subscribe to domain events for integration with other services
- Metrics: Monitor consent rates, API performance, etc.
- Logging: Structured logs for better debugging and monitoring
- Adapters: Integrate with email providers, analytics platforms, etc.

### v0.1.0 → v0.2.0

**No Breaking Changes**
- All existing API endpoints remain compatible
- No database migration required
- New error response format is more detailed but backward compatible

**Recommended Actions**
1. Add error handling in API clients to parse validation error details
2. Run tests to ensure compatibility: `npm run test`

---

## Upgrade Notes

### From 0.1.0 to Latest

1. Pull latest code
2. Install dependencies: `npm install`
3. Run migrations: `npm run db:migrate`
4. Run tests: `npm run test:run`
5. Review breaking changes above
6. Update integration code as needed

## Support

For issues, questions, or feature requests, please open an issue in the repository.
