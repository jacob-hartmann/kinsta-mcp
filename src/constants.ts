/**
 * Shared Constants
 *
 * Centralized constants used across the application.
 */

// ---------------------------------------------------------------------------
// API URLs
// ---------------------------------------------------------------------------

/** Kinsta API base URL */
export const KINSTA_API_BASE_URL = "https://api.kinsta.com/v2";

// ---------------------------------------------------------------------------
// Timeouts
// ---------------------------------------------------------------------------

/** Timeout for external API requests in milliseconds (30 seconds) */
export const FETCH_TIMEOUT_MS = 30_000;

// ---------------------------------------------------------------------------
// JSON-RPC Error Codes
// ---------------------------------------------------------------------------

/** JSON-RPC error code: Invalid request */
export const JSONRPC_ERROR_INVALID_REQUEST = -32600;

/** JSON-RPC error code: Internal error */
export const JSONRPC_ERROR_INTERNAL = -32603;
