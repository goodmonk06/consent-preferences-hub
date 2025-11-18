/**
 * Event Bus - in-memory event publishing and subscription
 * Can be extended to use external message queues (Redis, RabbitMQ, Kafka)
 */

import { DomainEvent, EventType } from './types';
import { logger } from '../logger';
import { metrics, METRIC_NAMES } from '../metrics';

type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void> | void;

interface Subscription {
  id: string;
  eventTypes: EventType[];
  handler: EventHandler;
}

class EventBus {
  private subscriptions: Map<string, Subscription> = new Map();
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.EVENTS_ENABLED !== 'false';
  }

  /**
   * Subscribe to one or more event types
   */
  subscribe(eventTypes: EventType | EventType[], handler: EventHandler): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      eventTypes: types,
      handler,
    });

    logger.info('Event subscription added', {
      subscriptionId,
      eventTypes: types,
    });

    return subscriptionId;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): boolean {
    const deleted = this.subscriptions.delete(subscriptionId);

    if (deleted) {
      logger.info('Event subscription removed', { subscriptionId });
    }

    return deleted;
  }

  /**
   * Publish an event to all matching subscribers
   */
  async publish(event: DomainEvent): Promise<void> {
    if (!this.enabled) {
      logger.debug('Event bus disabled, skipping event', { eventType: event.type });
      return;
    }

    // Add timestamp and ID if not present
    const enrichedEvent = {
      ...event,
      id: event.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: event.timestamp || new Date(),
    };

    logger.info('Publishing event', {
      eventId: enrichedEvent.id,
      eventType: enrichedEvent.type,
      aggregateId: enrichedEvent.aggregateId,
    });

    metrics.incrementCounter(METRIC_NAMES.EVENT_PUBLISHED, {
      eventType: enrichedEvent.type,
    });

    const matchingSubscriptions = Array.from(this.subscriptions.values()).filter((sub) =>
      sub.eventTypes.includes(enrichedEvent.type)
    );

    logger.debug(`Found ${matchingSubscriptions.length} matching subscriptions`);

    // Execute all handlers (in parallel for now, can be made sequential if needed)
    const handlerPromises = matchingSubscriptions.map(async (sub) => {
      try {
        logger.debug('Executing event handler', {
          subscriptionId: sub.id,
          eventType: enrichedEvent.type,
        });

        await sub.handler(enrichedEvent);

        metrics.incrementCounter(METRIC_NAMES.EVENT_PROCESSED, {
          eventType: enrichedEvent.type,
          status: 'success',
        });

        logger.debug('Event handler completed successfully', {
          subscriptionId: sub.id,
        });
      } catch (error) {
        metrics.incrementCounter(METRIC_NAMES.EVENT_PROCESSED, {
          eventType: enrichedEvent.type,
          status: 'error',
        });

        logger.error('Event handler failed', {
          subscriptionId: sub.id,
          eventType: enrichedEvent.type,
          error,
        });

        // Don't throw - we want other handlers to continue even if one fails
      }
    });

    await Promise.all(handlerPromises);

    logger.info('Event published and processed', {
      eventId: enrichedEvent.id,
      handlersExecuted: matchingSubscriptions.length,
    });
  }

  /**
   * Get count of active subscriptions
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Clear all subscriptions (useful for testing)
   */
  clear(): void {
    this.subscriptions.clear();
    logger.info('All event subscriptions cleared');
  }
}

// Export singleton instance
export const eventBus = new EventBus();

// Export class for testing
export { EventBus };
