/**
 * Cerebras Logger - Utility for logging and debugging Cerebras API responses
 */

// Set to true to enable detailed logging
export const DEBUG_CEREBRAS = true;

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Logger class for Cerebras API
export class CerebrasLogger {
  private requestId: string;
  private startTime: number;
  private logPrefix: string;
  
  constructor(requestId: string = 'unknown') {
    this.requestId = requestId;
    this.startTime = Date.now();
    this.logPrefix = `[Cerebras ${requestId}]`;
  }
  
  /**
   * Set the request ID
   */
  setRequestId(id: string): void {
    this.requestId = id;
    this.logPrefix = `[Cerebras ${id}]`;
  }
  
  /**
   * Log a message with the specified level
   */
  log(level: LogLevel, message: string, data?: any): void {
    if (!DEBUG_CEREBRAS) return;
    
    const timestamp = new Date().toISOString();
    const elapsed = Date.now() - this.startTime;
    
    const logMessage = `${this.logPrefix} [${level}] [+${elapsed}ms] ${message}`;
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage);
        if (data) console.error(data);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        if (data) console.warn(data);
        break;
      case LogLevel.INFO:
        console.log(logMessage);
        if (data) console.log(data);
        break;
      case LogLevel.DEBUG:
      default:
        console.log(logMessage);
        if (data) console.log(data);
        break;
    }
  }
  
  /**
   * Log a debug message
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }
  
  /**
   * Log an info message
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }
  
  /**
   * Log a warning message
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }
  
  /**
   * Log an error message
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }
  
  /**
   * Log request details
   */
  logRequest(prompt: string, options: any): void {
    this.info('Request started');
    this.debug('Prompt', prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''));
    this.debug('Options', options);
  }
  
  /**
   * Log response details
   */
  logResponse(response: any): void {
    this.info('Response received');
    
    if (response) {
      if (response.id) {
        this.setRequestId(response.id);
      }
      
      this.debug('Response details', {
        id: response.id || 'unknown',
        headers: response.headers || {},
        status: response.status || 'unknown'
      });
    }
  }
  
  /**
   * Log completion details
   */
  logCompletion(text: string): void {
    this.info('Completion received');
    this.debug('Text length', text.length);
    this.debug('Text preview', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
  }
  
  /**
   * Log error details
   */
  logError(error: any): void {
    this.error('Error occurred', error);
    
    if (error instanceof Error) {
      this.error('Error details', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    // Try to extract response details if available
    const errorObj = error as any;
    if (errorObj.response) {
      this.error('Response details', {
        status: errorObj.response.status || 'unknown',
        headers: errorObj.response.headers || {}
      });
      
      // Try to get the response body
      if (errorObj.response.text && typeof errorObj.response.text === 'function') {
        errorObj.response.text()
          .then((text: string) => {
            this.error('Response body', text);
          })
          .catch((e: Error) => {
            this.error('Could not read response body', e);
          });
      }
    }
  }
} 