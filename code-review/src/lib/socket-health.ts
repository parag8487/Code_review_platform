/**
 * Socket Health Check Utility
 * This module provides functions to monitor and validate socket connections
 * to prevent connection errors.
 */

import io, { Socket } from "socket.io-client";

export interface SocketHealthStatus {
  connected: boolean;
  connectionTime: number | null;
  lastPing: number | null;
  errorCount: number;
  lastError: string | null;
}

export class SocketHealthMonitor {
  private socket: Socket | null = null;
  private healthStatus: SocketHealthStatus = {
    connected: false,
    connectionTime: null,
    lastPing: null,
    errorCount: 0,
    lastError: null
  };
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private listeners: Array<(status: SocketHealthStatus) => void> = [];

  constructor(private url: string, private options: any = {}) {}

  public connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // Disconnect existing socket if any
        if (this.socket) {
          this.socket.disconnect();
        }

        // Create new socket connection
        this.socket = io(this.url, {
          path: "/api/socket_io",
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          timeout: 10000,
          withCredentials: true,
          ...this.options
        });

        // Set up event listeners
        this.setupEventListeners();

        // Resolve when connected
        this.socket.on("connect", () => {
          this.healthStatus.connected = true;
          this.healthStatus.connectionTime = Date.now();
          this.reconnectAttempts = 0;
          this.notifyListeners();
          resolve(true);
        });

        // Reject on connection error
        this.socket.on("connect_error", (error) => {
          this.healthStatus.errorCount++;
          this.healthStatus.lastError = error.message;
          this.notifyListeners();
          
          // If we've exceeded max reconnect attempts, reject
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts: ${error.message}`));
          } else {
            this.reconnectAttempts++;
          }
        });
      } catch (error) {
        this.healthStatus.errorCount++;
        this.healthStatus.lastError = error instanceof Error ? error.message : String(error);
        this.notifyListeners();
        reject(error);
      }
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("disconnect", (reason) => {
      this.healthStatus.connected = false;
      this.notifyListeners();
      
      // Attempt to reconnect if it was not a manual disconnect
      if (reason !== "io client disconnect") {
        this.reconnectAttempts++;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.connect().catch(() => {
              // Silently fail, errors are handled in the connect method
            });
          }, 1000 * this.reconnectAttempts); // Exponential backoff
        }
      }
    });

    this.socket.on("pong", () => {
      this.healthStatus.lastPing = Date.now();
      this.notifyListeners();
    });

    // Handle any custom error events from the server
    this.socket.on("error", (error) => {
      this.healthStatus.errorCount++;
      this.healthStatus.lastError = error instanceof Error ? error.message : String(error);
      this.notifyListeners();
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.healthStatus.connected = false;
    this.notifyListeners();
  }

  public getHealthStatus(): SocketHealthStatus {
    return { ...this.healthStatus };
  }

  public isConnected(): boolean {
    return this.healthStatus.connected;
  }

  public emit(event: string, data?: any): boolean {
    if (this.socket && this.healthStatus.connected) {
      this.socket.emit(event, data);
      return true;
    }
    return false;
  }

  public on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  public off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  public addHealthListener(listener: (status: SocketHealthStatus) => void) {
    this.listeners.push(listener);
  }

  public removeHealthListener(listener: (status: SocketHealthStatus) => void) {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners() {
    const status = this.getHealthStatus();
    this.listeners.forEach(listener => listener(status));
  }

  // Diagnostic method to test socket connection
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.connect();
      if (this.isConnected()) {
        return { success: true, message: "Socket connection successful" };
      } else {
        return { success: false, message: "Socket connection failed" };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Socket connection error: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }
}

// Utility function to validate socket configuration
export function validateSocketConfig(url: string, options: any = {}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check URL
  if (!url || typeof url !== 'string') {
    errors.push("Invalid URL: URL is required and must be a string");
  } else {
    try {
      new URL(url);
    } catch (e) {
      errors.push("Invalid URL: Must be a valid URL");
    }
  }
  
  // Check transports
  if (options.transports) {
    if (!Array.isArray(options.transports)) {
      errors.push("Invalid transports: Must be an array");
    } else {
      const validTransports = ['websocket', 'polling'];
      const invalidTransports = options.transports.filter((t: string) => !validTransports.includes(t));
      if (invalidTransports.length > 0) {
        errors.push(`Invalid transports: ${invalidTransports.join(', ')}. Valid options are: ${validTransports.join(', ')}`);
      }
    }
  }
  
  // Check timeout
  if (options.timeout !== undefined && (typeof options.timeout !== 'number' || options.timeout <= 0)) {
    errors.push("Invalid timeout: Must be a positive number");
  }
  
  // Check reconnection attempts
  if (options.reconnectionAttempts !== undefined && (typeof options.reconnectionAttempts !== 'number' || options.reconnectionAttempts < 0)) {
    errors.push("Invalid reconnectionAttempts: Must be a non-negative number");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}