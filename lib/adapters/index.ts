/**
 * Adapter interfaces for external integrations
 * Provides abstraction for notifications, analytics, and storage
 */

// ============================================================================
// Notification Adapters
// ============================================================================

export interface NotificationPayload {
  to: string; // email, phone number, device token, etc.
  subject?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface INotificationAdapter {
  send(payload: NotificationPayload): Promise<void>;
  getName(): string;
}

// Console adapter (for development)
export class ConsoleNotificationAdapter implements INotificationAdapter {
  getName(): string {
    return 'console';
  }

  async send(payload: NotificationPayload): Promise<void> {
    console.log('[Notification]', {
      to: payload.to,
      subject: payload.subject,
      message: payload.message,
    });
  }
}

// Email adapter stub (integrate with SendGrid, SES, etc.)
export class EmailNotificationAdapter implements INotificationAdapter {
  constructor(private apiKey?: string) {}

  getName(): string {
    return 'email';
  }

  async send(payload: NotificationPayload): Promise<void> {
    // TODO: Integrate with actual email provider
    console.log('[Email]', {
      to: payload.to,
      subject: payload.subject,
      body: payload.message,
    });
  }
}

// ============================================================================
// Analytics Adapters
// ============================================================================

export interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
}

export interface IAnalyticsAdapter {
  track(event: AnalyticsEvent): Promise<void>;
  identify(userId: string, traits?: Record<string, unknown>): Promise<void>;
  getName(): string;
}

// Console adapter (for development)
export class ConsoleAnalyticsAdapter implements IAnalyticsAdapter {
  getName(): string {
    return 'console';
  }

  async track(event: AnalyticsEvent): Promise<void> {
    console.log('[Analytics Track]', event);
  }

  async identify(userId: string, traits?: Record<string, unknown>): Promise<void> {
    console.log('[Analytics Identify]', { userId, traits });
  }
}

// Segment adapter stub
export class SegmentAnalyticsAdapter implements IAnalyticsAdapter {
  constructor(private writeKey?: string) {}

  getName(): string {
    return 'segment';
  }

  async track(event: AnalyticsEvent): Promise<void> {
    // TODO: Integrate with Segment API
    console.log('[Segment Track]', event);
  }

  async identify(userId: string, traits?: Record<string, unknown>): Promise<void> {
    // TODO: Integrate with Segment API
    console.log('[Segment Identify]', { userId, traits });
  }
}

// ============================================================================
// Storage Adapters
// ============================================================================

export interface IStorageAdapter {
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  get(key: string): Promise<unknown | null>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getName(): string;
}

// In-memory adapter (for development/testing)
export class InMemoryStorageAdapter implements IStorageAdapter {
  private store: Map<string, { value: unknown; expiresAt?: number }> = new Map();

  getName(): string {
    return 'in-memory';
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async get(key: string): Promise<unknown | null> {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Redis adapter stub
export class RedisStorageAdapter implements IStorageAdapter {
  constructor(private connection?: unknown) {}

  getName(): string {
    return 'redis';
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    // TODO: Integrate with Redis client
    console.log('[Redis SET]', { key, value, ttl });
  }

  async get(key: string): Promise<unknown | null> {
    // TODO: Integrate with Redis client
    console.log('[Redis GET]', { key });
    return null;
  }

  async delete(key: string): Promise<void> {
    // TODO: Integrate with Redis client
    console.log('[Redis DEL]', { key });
  }

  async exists(key: string): Promise<boolean> {
    // TODO: Integrate with Redis client
    console.log('[Redis EXISTS]', { key });
    return false;
  }
}

// ============================================================================
// Adapter Registry
// ============================================================================

export class AdapterRegistry {
  private notificationAdapters: Map<string, INotificationAdapter> = new Map();
  private analyticsAdapters: Map<string, IAnalyticsAdapter> = new Map();
  private storageAdapters: Map<string, IStorageAdapter> = new Map();

  registerNotificationAdapter(adapter: INotificationAdapter): void {
    this.notificationAdapters.set(adapter.getName(), adapter);
  }

  registerAnalyticsAdapter(adapter: IAnalyticsAdapter): void {
    this.analyticsAdapters.set(adapter.getName(), adapter);
  }

  registerStorageAdapter(adapter: IStorageAdapter): void {
    this.storageAdapters.set(adapter.getName(), adapter);
  }

  getNotificationAdapter(name: string): INotificationAdapter | undefined {
    return this.notificationAdapters.get(name);
  }

  getAnalyticsAdapter(name: string): IAnalyticsAdapter | undefined {
    return this.analyticsAdapters.get(name);
  }

  getStorageAdapter(name: string): IStorageAdapter | undefined {
    return this.storageAdapters.get(name);
  }
}

// Global registry instance
export const adapterRegistry = new AdapterRegistry();

// Register default adapters
adapterRegistry.registerNotificationAdapter(new ConsoleNotificationAdapter());
adapterRegistry.registerAnalyticsAdapter(new ConsoleAnalyticsAdapter());
adapterRegistry.registerStorageAdapter(new InMemoryStorageAdapter());
