/**
 * Shared Tool Utilities
 *
 * Common utilities for MCP tool implementations to reduce code duplication.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Response Types
// ---------------------------------------------------------------------------

export interface ToolTextContent {
  type: "text";
  text: string;
}

export interface ToolErrorResponse {
  [x: string]: unknown;
  isError: true;
  content: ToolTextContent[];
}

export interface ToolSuccessResponse {
  [x: string]: unknown;
  content: ToolTextContent[];
  structuredContent?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Output Schema
// ---------------------------------------------------------------------------

export const kinstaOutputSchema = z.looseObject({});

// ---------------------------------------------------------------------------
// ID Validation
// ---------------------------------------------------------------------------

const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export function validateId(value: string, paramName: string): string | null {
  if (!SAFE_ID_PATTERN.test(value))
    return `Invalid ${paramName}: contains illegal characters`;
  return null;
}

// ---------------------------------------------------------------------------
// Error Formatting
// ---------------------------------------------------------------------------

/**
 * Error code to user-friendly message mapping.
 * Resource type is optional - provides context-specific "not found" messages.
 */
const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED:
    "Your API key is invalid or expired. Generate a new one in MyKinsta > Company settings > API Keys.",
  FORBIDDEN: "Your API key does not have permission to access this resource.",
  RATE_LIMITED:
    "You have exceeded Kinsta's rate limit. Please wait a moment before trying again.",
};

/**
 * Format an error response for MCP tools.
 *
 * @param error - Error object with code and message
 * @param resourceType - Optional resource type for "not found" messages (e.g., "site", "environment")
 */
export function formatError(
  error: { code: string; message: string },
  resourceType?: string
): ToolErrorResponse {
  let errorMessage = error.message;

  if (error.code === "NOT_FOUND" && resourceType) {
    errorMessage = `The requested ${resourceType} was not found.`;
  } else {
    const mappedMessage = ERROR_MESSAGES[error.code];
    if (mappedMessage) {
      errorMessage = mappedMessage;
    }
  }

  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: `Kinsta API Error (${error.code}): ${errorMessage}`,
      },
    ],
  };
}

/**
 * Format an authentication error response.
 */
export function formatAuthError(message: string): ToolErrorResponse {
  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: `Authentication Error: ${message}`,
      },
    ],
  };
}

/**
 * Format a validation error response.
 */
export function formatValidationError(message: string): ToolErrorResponse {
  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: `Error: ${message}`,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Success Formatting
// ---------------------------------------------------------------------------

/**
 * Format a successful JSON response.
 */
export function formatSuccess(data: unknown): ToolSuccessResponse {
  const base: ToolSuccessResponse = {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
  if (data !== null && typeof data === "object") {
    base.structuredContent = data as Record<string, unknown>;
  }
  return base;
}

/**
 * Format a successful message response.
 */
export function formatMessage(message: string): ToolSuccessResponse {
  return {
    content: [
      {
        type: "text" as const,
        text: message,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Parameter Building
// ---------------------------------------------------------------------------

/**
 * Build a params object from input, filtering out undefined values.
 *
 * This is needed because TypeScript's exactOptionalPropertyTypes doesn't
 * allow explicitly setting undefined values on optional properties.
 *
 * @example
 * ```ts
 * const params = buildParams({
 *   name: "Site",
 *   description: undefined, // will be filtered out
 *   region: "us-east-1",
 * });
 * // Result: { name: "Site", region: "us-east-1" }
 * ```
 */
export function buildParams<T extends Record<string, unknown>>(
  input: T
): Partial<{ [K in keyof T]: Exclude<T[K], undefined> }> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as Partial<{ [K in keyof T]: Exclude<T[K], undefined> }>;
}
