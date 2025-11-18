/**
 * Metrics collection utility for the Consent Hub
 * Tracks counters, gauges, and histograms
 * Can be extended to export to Prometheus, Datadog, CloudWatch, etc.
 */

import { logger } from './logger';

interface MetricLabels {
  [key: string]: string | number;
}

interface Counter {
  name: string;
  value: number;
  labels: MetricLabels;
  lastUpdated: Date;
}

interface Gauge {
  name: string;
  value: number;
  labels: MetricLabels;
  lastUpdated: Date;
}

interface HistogramEntry {
  value: number;
  timestamp: Date;
}

interface Histogram {
  name: string;
  entries: HistogramEntry[];
  labels: MetricLabels;
}

class Metrics {
  private counters: Map<string, Counter> = new Map();
  private gauges: Map<string, Gauge> = new Map();
  private histograms: Map<string, Histogram> = new Map();
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.METRICS_ENABLED !== 'false';
  }

  private getKey(name: string, labels?: MetricLabels): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return `${name}{${labelStr}}`;
  }

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, labels?: MetricLabels, value: number = 1): void {
    if (!this.enabled) return;

    const key = this.getKey(name, labels);
    const existing = this.counters.get(key);

    if (existing) {
      existing.value += value;
      existing.lastUpdated = new Date();
    } else {
      this.counters.set(key, {
        name,
        value,
        labels: labels || {},
        lastUpdated: new Date(),
      });
    }

    logger.debug('Counter incremented', { name, labels, value });
  }

  /**
   * Set a gauge metric (point-in-time value)
   */
  setGauge(name: string, value: number, labels?: MetricLabels): void {
    if (!this.enabled) return;

    const key = this.getKey(name, labels);
    this.gauges.set(key, {
      name,
      value,
      labels: labels || {},
      lastUpdated: new Date(),
    });

    logger.debug('Gauge set', { name, labels, value });
  }

  /**
   * Record a histogram value (for latency, sizes, etc.)
   */
  recordHistogram(name: string, value: number, labels?: MetricLabels): void {
    if (!this.enabled) return;

    const key = this.getKey(name, labels);
    const existing = this.histograms.get(key);

    const entry: HistogramEntry = {
      value,
      timestamp: new Date(),
    };

    if (existing) {
      existing.entries.push(entry);
      // Keep only last 1000 entries to prevent memory bloat
      if (existing.entries.length > 1000) {
        existing.entries = existing.entries.slice(-1000);
      }
    } else {
      this.histograms.set(key, {
        name,
        entries: [entry],
        labels: labels || {},
      });
    }

    logger.debug('Histogram recorded', { name, labels, value });
  }

  /**
   * Get counter value
   */
  getCounter(name: string, labels?: MetricLabels): number {
    const key = this.getKey(name, labels);
    return this.counters.get(key)?.value || 0;
  }

  /**
   * Get gauge value
   */
  getGauge(name: string, labels?: MetricLabels): number | undefined {
    const key = this.getKey(name, labels);
    return this.gauges.get(key)?.value;
  }

  /**
   * Get histogram statistics
   */
  getHistogramStats(name: string, labels?: MetricLabels): {
    count: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } | undefined {
    const key = this.getKey(name, labels);
    const histogram = this.histograms.get(key);

    if (!histogram || histogram.entries.length === 0) {
      return undefined;
    }

    const values = histogram.entries.map((e) => e.value).sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count,
      min: values[0],
      max: values[count - 1],
      avg: sum / count,
      p50: values[Math.floor(count * 0.5)],
      p95: values[Math.floor(count * 0.95)],
      p99: values[Math.floor(count * 0.99)],
    };
  }

  /**
   * Get all metrics as a report
   */
  getReport(): {
    counters: Counter[];
    gauges: Gauge[];
    histograms: Record<string, ReturnType<typeof this.getHistogramStats>>;
  } {
    const histogramStats: Record<string, ReturnType<typeof this.getHistogramStats>> = {};

    for (const [key, histogram] of this.histograms.entries()) {
      histogramStats[key] = this.getHistogramStats(histogram.name, histogram.labels);
    }

    return {
      counters: Array.from(this.counters.values()),
      gauges: Array.from(this.gauges.values()),
      histograms: histogramStats,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }

  /**
   * Timer helper - measure duration of async operations
   */
  async measureAsync<T>(
    name: string,
    labels: MetricLabels | undefined,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.recordHistogram(name, duration, labels);
      this.incrementCounter(`${name}_total`, labels);
      this.incrementCounter(`${name}_success`, labels);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.recordHistogram(name, duration, labels);
      this.incrementCounter(`${name}_total`, labels);
      this.incrementCounter(`${name}_error`, labels);
      throw error;
    }
  }

  /**
   * Timer helper - measure duration of sync operations
   */
  measure<T>(
    name: string,
    labels: MetricLabels | undefined,
    fn: () => T
  ): T {
    const start = Date.now();
    try {
      const result = fn();
      const duration = Date.now() - start;
      this.recordHistogram(name, duration, labels);
      this.incrementCounter(`${name}_total`, labels);
      this.incrementCounter(`${name}_success`, labels);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.recordHistogram(name, duration, labels);
      this.incrementCounter(`${name}_total`, labels);
      this.incrementCounter(`${name}_error`, labels);
      throw error;
    }
  }
}

// Export singleton instance
export const metrics = new Metrics();

// Export class for testing
export { Metrics };

// Common metric names (constants to prevent typos)
export const METRIC_NAMES = {
  API_REQUEST: 'api_request',
  API_ERROR: 'api_error',
  API_LATENCY: 'api_latency',
  CONSENT_GRANTED: 'consent_granted',
  CONSENT_DENIED: 'consent_denied',
  CONSENT_WITHDRAWN: 'consent_withdrawn',
  PREFERENCE_UPDATED: 'preference_updated',
  USER_CREATED: 'user_created',
  TEMPLATE_APPLIED: 'template_applied',
  EVENT_PUBLISHED: 'event_published',
  EVENT_PROCESSED: 'event_processed',
  WEBHOOK_DELIVERED: 'webhook_delivered',
  WEBHOOK_FAILED: 'webhook_failed',
  DB_QUERY: 'db_query',
  DB_ERROR: 'db_error',
} as const;
