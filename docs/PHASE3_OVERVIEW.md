# Phase 3 Overview: Consent & Preferences Hub

## Purpose Statement

The **Consent & Preferences Hub** is a specialized microservice designed to be the single source of truth for user consent management and communication preferences across a distributed application ecosystem. It solves the critical problem of GDPR, CCPA, and privacy regulation compliance by providing a centralized, auditable, and extensible consent tracking system that can be integrated with multiple downstream services (analytics, marketing automation, notification systems, data warehouses, etc.).

This hub enables organizations to:
- Track explicit user consent for data processing purposes with full audit trails
- Manage notification preferences across multiple channels (email, SMS, push)
- Provide users with self-service preference management
- Generate compliance reports and consent withdrawal tracking
- Integrate with external systems through events and adapters

## Current Features (Post-Phase 2)

### Core Domain
- **User Management**: Email-based user identification
- **Consent Categories**: Pre-defined categories (analytics, marketing, research, personalization)
- **User Consents**: Grant/deny tracking with timestamps
- **Notification Preferences**: Channel-specific frequency controls (email, SMS, push)

### API Surface
- RESTful JSON APIs for consents and preferences
- Zod-based request validation
- Centralized error handling with consistent error shapes
- Type-safe end-to-end

### Developer Experience
- Docker Compose for local development
- Prisma migrations and seeding
- Vitest test framework with initial test coverage
- TypeScript strict mode
- Comprehensive README with API examples

### Infrastructure
- Next.js 16 (App Router)
- PostgreSQL database via Prisma ORM
- Iron-session for simple authentication
- Dockerfile for containerized deployment

## Current Limitations

1. **Domain Depth**: Limited entities - no audit logging, templates, or grouping capabilities
2. **Events**: No event system for notifying downstream systems of consent changes
3. **Integration**: No adapter pattern for external service integration
4. **Bulk Operations**: APIs only support single-item operations
5. **Compliance**: No built-in reporting or consent withdrawal tracking
6. **Observability**: No structured logging or metrics
7. **Tooling**: No CLI for admin operations
8. **Test Coverage**: Basic test coverage, needs domain logic and integration tests
9. **Documentation**: Needs architecture diagrams, integration recipes, domain modeling docs

## Phase 3 Plan

### 1. Domain Model Deepening

**Consent Audit Log**
- Track every consent status change with timestamp, old value, new value, source
- Enable compliance reporting and dispute resolution
- Support "who changed what when" queries

**Consent Templates**
- Pre-configured consent category bundles for different user types/regions
- Enable quick onboarding with region-specific compliance presets (GDPR, CCPA, etc.)
- Versioning support for template updates

**User Groups & Segments**
- Group users by cohorts (beta users, regions, subscription tiers)
- Apply bulk consent operations to groups
- Targeted communication preference policies

**Consent Withdrawal Tracking**
- Track withdrawal requests separately from consent changes
- Support grace periods and delayed data deletion
- Generate compliance reports for data deletion requests

### 2. Event System

**Domain Events**
- `ConsentGranted`, `ConsentDenied`, `ConsentWithdrawn`
- `PreferenceUpdated`, `UserCreated`
- Event payload includes full context for downstream processing

**Event Bus**
- In-memory event bus for local handling
- Extensible to external message queues (Redis, RabbitMQ, Kafka)
- Async event processing with error handling

**Event Handlers**
- Webhook delivery to external systems
- Audit log writers
- Analytics tracking
- Notification triggers

### 3. Adapter Interfaces

**Notification Adapters**
- `INotificationAdapter` interface for sending notifications
- Implementations: Console (dev), Email (SendGrid/SES), SMS (Twilio), Push (FCM)
- Used for consent confirmation emails, preference update notifications

**Analytics Adapters**
- `IAnalyticsAdapter` for tracking consent metrics
- Implementations: Console (dev), Segment, Google Analytics, Mixpanel
- Track consent rates, withdrawal rates, preference distributions

**Storage Adapters**
- `IStorageAdapter` for flexible data persistence
- Implementations: Prisma (default), Redis (caching), S3 (archives)
- Enable multi-tier storage strategies

### 4. Bulk Operations & Advanced APIs

**New Endpoints**
- `POST /api/users/:id/consents/bulk` - Update multiple consents atomically
- `POST /api/users/:id/preferences/bulk` - Update all preferences at once
- `GET /api/consents/audit` - Query consent audit log
- `GET /api/reports/compliance` - Generate compliance reports
- `POST /api/templates` - Create/manage consent templates
- `POST /api/groups` - Manage user groups

**Query Capabilities**
- Filtering by date range, consent status, user attributes
- Pagination for large result sets
- CSV export for compliance reporting

### 5. CLI Tooling

**Admin Commands**
- `consent-cli seed` - Seed database with sample data
- `consent-cli migrate` - Run database migrations
- `consent-cli user create <email>` - Create user
- `consent-cli audit <userId>` - View audit log for user
- `consent-cli report <startDate> <endDate>` - Generate compliance report
- `consent-cli template apply <templateId> <groupId>` - Apply template to group

### 6. Observability

**Structured Logging**
- `lib/logger.ts` with context-aware logging (request ID, user ID, action)
- Log levels: DEBUG, INFO, WARN, ERROR
- JSON structured logs for production parsing

**Metrics**
- `lib/metrics.ts` with counters, gauges, histograms
- Track: API request rates, consent change rates, error rates, latency
- Exportable to Prometheus/Datadog/CloudWatch

**Health Checks**
- `/api/health` endpoint
- Database connectivity check
- Dependency health status

### 7. Enhanced Testing

**Domain Logic Tests**
- Consent state machine tests
- Template application logic
- Audit log generation
- Event emission verification

**Integration Tests**
- API endpoint tests with real database
- Event flow tests (end-to-end event handling)
- Adapter integration tests

**Test Fixtures**
- Factory functions for creating test data
- Realistic user scenarios (GDPR user, CCPA user, enterprise user)
- Edge case coverage (consent conflicts, bulk failures)

### 8. Comprehensive Documentation

**New Documentation**
- `docs/ARCHITECTURE.md` - System architecture, layers, components
- `docs/DOMAIN_MODEL.md` - Entity relationships, state machines, business rules
- `docs/INTEGRATION_RECIPES.md` - How to integrate with auth, notification, analytics systems
- `docs/API_REFERENCE.md` - Complete API documentation with examples
- `docs/COMPLIANCE.md` - GDPR/CCPA compliance guidelines
- `docs/DEPLOYMENT.md` - Production deployment guide

**Enhanced README**
- Expanded "Getting Started" with Docker quickstart
- Multiple example flows (not just one)
- Integration patterns section
- Troubleshooting guide

### 9. Seed Data Expansion

**Multiple User Personas**
- `alice@example.com` - All consents granted, high notification frequency
- `bob@example.com` - Selective consents, low notification frequency
- `charlie@example.com` - All consents denied, notifications disabled
- `enterprise@bigcorp.com` - Enterprise user with custom consents
- `eu-user@example.de` - GDPR-region user with specific requirements

**Rich Audit History**
- Pre-seeded audit log with multiple consent changes over time
- Demonstrates consent withdrawal and re-grant flows
- Shows template application history

**Templates & Groups**
- "GDPR Standard" template
- "CCPA Minimal" template
- "Enterprise Full Access" template
- User groups: "EU Users", "Beta Testers", "Premium Subscribers"

## Success Metrics

Phase 3 will be considered successful when:

1. **Domain Model**: 5+ new entities added (audit log, templates, groups, withdrawal requests, event log)
2. **API Coverage**: 10+ new endpoints covering bulk operations, reporting, templates, groups
3. **Event System**: Functional event bus with 3+ event types and handlers
4. **Adapters**: 3+ adapter interfaces with stub and production implementations
5. **Tests**: 50+ tests covering domain logic, integrations, and edge cases
6. **Documentation**: 6+ documentation files totaling 3000+ words
7. **CLI**: 5+ admin commands fully functional
8. **Observability**: Structured logging and metrics in place
9. **Seed Data**: 5+ user personas with rich interaction history
10. **Production Ready**: Can deploy to production and handle real compliance requirements

## Integration Vision

This hub is designed to fit into a larger "AI-driven community OS" ecosystem:

- **Auth Service**: Receives user creation events, validates user IDs
- **Notification Service**: Queries preferences before sending any notification
- **Analytics Service**: Checks consent before tracking user behavior
- **Data Warehouse**: Only ingests data from users with appropriate consents
- **Admin Dashboard**: Uses APIs to generate compliance reports
- **User Portal**: Self-service preference management
- **Webhook Service**: Delivers consent change events to third-party integrations

## Next Steps (Phase 4+)

Beyond Phase 3, potential enhancements include:

- **Multi-tenancy**: Support multiple organizations in single deployment
- **Role-Based Access Control**: Different admin permission levels
- **Consent Delegation**: Parents managing children's consents
- **Geographic Rules Engine**: Auto-apply regional compliance rules
- **Consent Expiration**: Time-limited consents with auto-renewal
- **Machine Learning**: Predict consent preferences, detect anomalies
- **Blockchain Integration**: Immutable consent audit trail
- **GraphQL API**: Alternative API surface for complex queries
- **Mobile SDKs**: Native iOS/Android SDKs for mobile app integration
