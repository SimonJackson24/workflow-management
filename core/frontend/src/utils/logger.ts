// core/frontend/src/utils/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private static instance: Logger;
  private logQueue: LogEntry[] = [];
  private readonly maxQueueSize = 100;
  private readonly logEndpoint = '/api/logs';

  private constructor() {
    window.onerror = (message, source, lineno, colno, error) => {
      this.error('Uncaught Error', { message, source, lineno, colno, error });
    };

    window.onunhandledrejection = (event) => {
      this.error('Unhandled Promise Rejection', { reason: event.reason });
    };
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userId: localStorage.getItem('userId') || undefined,
      sessionId: localStorage.getItem('sessionId') || undefined,
    };
  }

  private async sendLogs(): Promise<void> {
    if (this.logQueue.length === 0) return;

    try {
      const logs = [...this.logQueue];
      this.logQueue = [];

      await fetch(this.logEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs }),
      });
    } catch (error) {
      console.error('Failed to send logs:', error);
      // Re-add logs to queue
      this.logQueue = [...this.logQueue, ...logs];
    }
  }

  public debug(message: string, data?: any): void {
    const entry = this.createLogEntry('debug', message, data);
    this.logQueue.push(entry);
    
    if (process.env.NODE_ENV !== 'production') {
      console.debug(message, data);
    }

    if (this.logQueue.length >= this.maxQueueSize) {
      this.sendLogs();
    }
  }

  public info(message: string, data?: any): void {
    const entry = this.createLogEntry('info', message, data);
    this.logQueue.push(entry);
    console.info(message, data);

    if (this.logQueue.length >= this.maxQueueSize) {
      this.sendLogs();
    }
  }

  public warn(message: string, data?: any): void {
    const entry = this.createLogEntry('warn', message, data);
    this.logQueue.push(entry);
    console.warn(message, data);
    this.sendLogs();
  }

  public error(message: string, data?: any): void {
    const entry = this.createLogEntry('error', message, data);
    this.logQueue.push(entry);
    console.error(message, data);
    this.sendLogs();
  }
}

export const logger = Logger.getInstance();
