// Structured logging utility with request ID tracing
// Phase 0: Visibility Quick Wins

export interface LogContext {
  requestId: string;
  functionName: string;
  userId?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  requestId: string;
  function: string;
  message: string;
  data?: Record<string, unknown>;
  durationMs?: number;
  userId?: string;
}

// Generate a unique request ID for tracing
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `req_${timestamp}_${random}`;
}

// Create a logger instance for a specific function/request
export function createLogger(functionName: string, requestId?: string): Logger {
  return new Logger(functionName, requestId || generateRequestId());
}

export class Logger {
  private functionName: string;
  private requestId: string;
  private startTime: number;
  private userId?: string;

  constructor(functionName: string, requestId: string) {
    this.functionName = functionName;
    this.requestId = requestId;
    this.startTime = Date.now();
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  getRequestId(): string {
    return this.requestId;
  }

  private formatLog(level: LogEntry['level'], message: string, data?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      requestId: this.requestId,
      function: this.functionName,
      message,
      durationMs: Date.now() - this.startTime,
    };

    if (data) {
      entry.data = data;
    }

    if (this.userId) {
      entry.userId = this.userId;
    }

    // Structured JSON output for parsing by log aggregators
    console.log(JSON.stringify(entry));
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.formatLog('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.formatLog('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.formatLog('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.formatLog('error', message, data);
  }

  // Log function completion with duration
  complete(status: 'success' | 'error', data?: Record<string, unknown>): void {
    this.formatLog('info', `Function completed: ${status}`, {
      ...data,
      totalDurationMs: Date.now() - this.startTime,
      status,
    });
  }

  // Create child logger for sub-operations
  child(operation: string): Logger {
    const childLogger = new Logger(`${this.functionName}:${operation}`, this.requestId);
    if (this.userId) {
      childLogger.setUserId(this.userId);
    }
    return childLogger;
  }
}

// Extract request ID from headers or generate new one
export function getRequestIdFromHeaders(req: Request): string {
  return req.headers.get('x-request-id') || 
         req.headers.get('x-correlation-id') || 
         generateRequestId();
}

// CORS headers with request ID
export function corsHeadersWithRequestId(requestId: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-id',
    'X-Request-ID': requestId,
  };
}
