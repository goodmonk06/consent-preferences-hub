/**
 * Domain event type definitions
 * These events represent important state changes in the system
 */

export enum EventType {
  // User events
  USER_CREATED = 'USER_CREATED',

  // Consent events
  CONSENT_GRANTED = 'CONSENT_GRANTED',
  CONSENT_DENIED = 'CONSENT_DENIED',
  CONSENT_UPDATED = 'CONSENT_UPDATED',
  CONSENT_EXPIRED = 'CONSENT_EXPIRED',
  CONSENT_WITHDRAWN = 'CONSENT_WITHDRAWN',

  // Template events
  TEMPLATE_CREATED = 'TEMPLATE_CREATED',
  TEMPLATE_APPLIED = 'TEMPLATE_APPLIED',

  // Preference events
  PREFERENCE_UPDATED = 'PREFERENCE_UPDATED',
  PREFERENCE_BULK_UPDATED = 'PREFERENCE_BULK_UPDATED',

  // Group events
  USER_ADDED_TO_GROUP = 'USER_ADDED_TO_GROUP',
  USER_REMOVED_FROM_GROUP = 'USER_REMOVED_FROM_GROUP',

  // Audit events
  AUDIT_LOG_CREATED = 'AUDIT_LOG_CREATED',
}

export interface BaseEvent {
  id?: string;
  type: EventType;
  aggregateId: string; // The ID of the primary entity (userId, consentId, etc.)
  timestamp?: Date;
  metadata?: {
    requestId?: string;
    userId?: string;
    source?: string;
    ipAddress?: string;
    userAgent?: string;
    [key: string]: unknown;
  };
}

// User Events

export interface UserCreatedEvent extends BaseEvent {
  type: EventType.USER_CREATED;
  payload: {
    userId: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

// Consent Events

export interface ConsentGrantedEvent extends BaseEvent {
  type: EventType.CONSENT_GRANTED;
  aggregateId: string; // userId
  payload: {
    userId: string;
    categoryId: string;
    categoryKey: string;
    categoryName: string;
    consentId: string;
    source?: string;
  };
}

export interface ConsentDeniedEvent extends BaseEvent {
  type: EventType.CONSENT_DENIED;
  aggregateId: string; // userId
  payload: {
    userId: string;
    categoryId: string;
    categoryKey: string;
    categoryName: string;
    consentId: string;
    source?: string;
  };
}

export interface ConsentUpdatedEvent extends BaseEvent {
  type: EventType.CONSENT_UPDATED;
  aggregateId: string; // userId
  payload: {
    userId: string;
    categoryId: string;
    categoryKey: string;
    oldStatus: 'granted' | 'denied';
    newStatus: 'granted' | 'denied';
    consentId: string;
    source?: string;
  };
}

export interface ConsentWithdrawnEvent extends BaseEvent {
  type: EventType.CONSENT_WITHDRAWN;
  aggregateId: string; // userId
  payload: {
    userId: string;
    categoryId: string;
    categoryKey: string;
    withdrawalId: string;
    reason?: string;
  };
}

export interface ConsentExpiredEvent extends BaseEvent {
  type: EventType.CONSENT_EXPIRED;
  aggregateId: string; // userId
  payload: {
    userId: string;
    categoryId: string;
    categoryKey: string;
    consentId: string;
    expiresAt: string;
  };
}

// Template Events

export interface TemplateCreatedEvent extends BaseEvent {
  type: EventType.TEMPLATE_CREATED;
  aggregateId: string; // templateId
  payload: {
    templateId: string;
    templateKey: string;
    templateName: string;
    region?: string;
    userType?: string;
  };
}

export interface TemplateAppliedEvent extends BaseEvent {
  type: EventType.TEMPLATE_APPLIED;
  aggregateId: string; // templateId
  payload: {
    templateId: string;
    templateKey: string;
    userId?: string;
    groupId?: string;
    appliedBy?: string;
    affectedUserCount: number;
  };
}

// Preference Events

export interface PreferenceUpdatedEvent extends BaseEvent {
  type: EventType.PREFERENCE_UPDATED;
  aggregateId: string; // userId
  payload: {
    userId: string;
    channel: string;
    oldFrequency: string;
    newFrequency: string;
    preferenceId: string;
  };
}

export interface PreferenceBulkUpdatedEvent extends BaseEvent {
  type: EventType.PREFERENCE_BULK_UPDATED;
  aggregateId: string; // userId
  payload: {
    userId: string;
    updates: Array<{
      channel: string;
      frequency: string;
    }>;
  };
}

// Group Events

export interface UserAddedToGroupEvent extends BaseEvent {
  type: EventType.USER_ADDED_TO_GROUP;
  aggregateId: string; // userId
  payload: {
    userId: string;
    groupId: string;
    groupKey: string;
    groupName: string;
    addedBy?: string;
  };
}

export interface UserRemovedFromGroupEvent extends BaseEvent {
  type: EventType.USER_REMOVED_FROM_GROUP;
  aggregateId: string; // userId
  payload: {
    userId: string;
    groupId: string;
    groupKey: string;
    groupName: string;
    removedBy?: string;
  };
}

// Union type of all events
export type DomainEvent =
  | UserCreatedEvent
  | ConsentGrantedEvent
  | ConsentDeniedEvent
  | ConsentUpdatedEvent
  | ConsentWithdrawnEvent
  | ConsentExpiredEvent
  | TemplateCreatedEvent
  | TemplateAppliedEvent
  | PreferenceUpdatedEvent
  | PreferenceBulkUpdatedEvent
  | UserAddedToGroupEvent
  | UserRemovedFromGroupEvent;
