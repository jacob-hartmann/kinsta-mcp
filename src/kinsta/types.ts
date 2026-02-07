/**
 * Kinsta API Types
 *
 * Shared types for the Kinsta API client.
 */

// ---------------------------------------------------------------------------
// Error Types
// ---------------------------------------------------------------------------

/** Error codes returned by the Kinsta client */
export type KinstaErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

/**
 * Typed error for Kinsta API operations.
 */
export class KinstaClientError extends Error {
  constructor(
    message: string,
    public readonly code: KinstaErrorCode,
    public readonly statusCode: number | undefined,
    public readonly retryable: boolean
  ) {
    super(message);
    this.name = "KinstaClientError";
  }
}

// ---------------------------------------------------------------------------
// Result Types
// ---------------------------------------------------------------------------

/** Success result from a Kinsta API call */
export interface KinstaSuccess<T> {
  success: true;
  data: T;
}

/** Error result from a Kinsta API call */
export interface KinstaError {
  success: false;
  error: KinstaClientError;
}

/** Discriminated union for API results */
export type KinstaResult<T> = KinstaSuccess<T> | KinstaError;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Configuration for the Kinsta API client */
export interface KinstaConfig {
  /** Kinsta API key (required) */
  apiKey: string;
  /** Kinsta company ID (required for most endpoints) */
  companyId: string;
  /** API base URL (defaults to https://api.kinsta.com/v2) */
  baseUrl: string;
}
