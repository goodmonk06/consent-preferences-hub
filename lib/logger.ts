/**
 * Structured logging utility for the Consent Hub
 * Provides context-aware logging with different levels
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogContext {
  requestId?: string;
  userId?: string;
  action?: string;
  [key: string]: unknown;
}

class Logger {
  private context: LogContext = {};
  private minLevel: LogLevel;

  constructor() {
    this.minLevel = this.getLogLevelFromEnv();
  }

  private getLogLevelFromEnv(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    return (LogLevel[level as keyof typeof LogLevel] || LogLevel.INFO);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatLog(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...this.context,
      ...(data && { data }),
    };

    if (process.env.NODE_ENV === 'production') {
      // JSON format for production (easily parseable by log aggregators)
      return JSON.stringify(logEntry);
    } else {
      // Pretty format for development
      return `[${timestamp}] ${level} ${message} ${
        Object.keys(this.context).length > 0 ? JSON.stringify(this.context) : ''
      } ${data ? JSON.stringify(data) : ''}`;
    }
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatLog(level, message, data);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  /**
   * Set context that will be included in all subsequent logs
   */
  setContext(context: LogContext): Logger {
    this.context = { ...this.context, ...context };
    return this;
  }

  /**
   * Clear all context
   */
  clearContext(): Logger {
    this.context = {};
    return this;
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger();
    childLogger.context = { ...this.context, ...context };
    return childLogger;
  }

  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error | unknown): void {
    const errorData = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : error;

    this.log(LogLevel.ERROR, message, errorData);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for testing
export { Logger };
