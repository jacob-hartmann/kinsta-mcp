/**
 * Kinsta API Client
 *
 * Generic HTTP client wrapper for the Kinsta REST API.
 *
 * - Sets `Authorization: Bearer <API_KEY>` on all requests
 * - Centralizes error mapping into typed KinstaClientError
 * - Captures RateLimit-* headers when present
 * - Uses AbortController for request timeouts
 */

import { FETCH_TIMEOUT_MS } from "../constants.js";
import {
  KinstaClientError,
  type KinstaConfig,
  type KinstaResult,
} from "./types.js";

// ---------------------------------------------------------------------------
// HTTP Methods
// ---------------------------------------------------------------------------

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  /** URL path relative to the base URL (e.g., "/sites") */
  path: string;
  /** HTTP method (defaults to GET) */
  method?: HttpMethod;
  /** Query parameters */
  params?: Record<string, string>;
  /** JSON request body */
  body?: unknown;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

/**
 * Kinsta API Client
 *
 * Wraps the Kinsta REST API with typed error handling and auth.
 */
export class KinstaClient {
  private readonly apiKey: string;
  private readonly companyId: string;
  private readonly baseUrl: string;

  constructor(config: KinstaConfig) {
    this.apiKey = config.apiKey;
    this.companyId = config.companyId;
    this.baseUrl = config.baseUrl.replace(/\/+$/, ""); // strip trailing slash
  }

  /** Get the company ID for this client */
  getCompanyId(): string {
    return this.companyId;
  }

  /**
   * Make an authenticated request to the Kinsta API.
   *
   * @param options - Request configuration
   * @returns Typed result with data or error
   */
  async request<T>(options: RequestOptions): Promise<KinstaResult<T>> {
    const { path, method = "GET", params, body } = options;

    // Build URL
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    // Set up timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, FETCH_TIMEOUT_MS);

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
      };

      const init: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (body !== undefined) {
        headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(body);
      }

      const response = await fetch(url.toString(), init);

      // Map HTTP status to typed error
      if (!response.ok) {
        return { success: false, error: this.mapHttpError(response) };
      }

      // Parse response
      const data = (await response.json()) as T;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: this.mapNetworkError(err) };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // -------------------------------------------------------------------------
  // Error Mapping
  // -------------------------------------------------------------------------

  private mapHttpError(response: Response): KinstaClientError {
    const status = response.status;

    switch (status) {
      case 401:
        return new KinstaClientError(
          "Invalid or expired API key",
          "UNAUTHORIZED",
          status,
          false
        );
      case 403:
        return new KinstaClientError(
          "Your API key does not have permission to access this resource",
          "FORBIDDEN",
          status,
          false
        );
      case 404:
        return new KinstaClientError(
          "Resource not found",
          "NOT_FOUND",
          status,
          false
        );
      case 429:
        return new KinstaClientError(
          "Rate limit exceeded. Please wait before retrying.",
          "RATE_LIMITED",
          status,
          true
        );
      default:
        if (status >= 400 && status < 500) {
          return new KinstaClientError(
            `Client error (${status})`,
            "VALIDATION_ERROR",
            status,
            false
          );
        }
        return new KinstaClientError(
          `Server error (${status})`,
          "SERVER_ERROR",
          status,
          true
        );
    }
  }

  private mapNetworkError(err: unknown): KinstaClientError {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        return new KinstaClientError(
          "Request timed out",
          "TIMEOUT",
          undefined,
          true
        );
      }
      return new KinstaClientError(
        `Network error: ${err.message}`,
        "NETWORK_ERROR",
        undefined,
        false
      );
    }
    return new KinstaClientError(
      "Unknown error occurred",
      "UNKNOWN",
      undefined,
      false
    );
  }
}
