/**
 * Kinsta Client Factory
 *
 * Shared factory for creating KinstaClient instances from MCP request context.
 * Used by both tools and resources to avoid code duplication.
 *
 * Caches the client instance and invalidates when env vars change.
 */

import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types.js";
import { KinstaClient } from "./client.js";
import { loadKinstaConfig, KinstaAuthError } from "./auth.js";

/**
 * Result type for getKinstaClient - allows callers to handle errors gracefully
 */
export type KinstaClientResult =
  | { success: true; client: KinstaClient }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Client Cache
// ---------------------------------------------------------------------------

let cachedClient: KinstaClient | undefined;
let cachedConfigHash: string | undefined;

function getConfigHash(): string {
  return `${process.env["KINSTA_API_KEY"] ?? ""}:${process.env["KINSTA_COMPANY_ID"] ?? ""}:${process.env["KINSTA_API_BASE_URL"] ?? ""}`;
}

/**
 * Get a KinstaClient from MCP request context.
 *
 * Loads API key and company ID from environment variables.
 * Caches the instance and invalidates if env vars change.
 *
 * @param _extra - MCP request handler extra context (reserved for future use)
 * @returns Result with client or error message
 */
export function getKinstaClient(
  _extra: RequestHandlerExtra<ServerRequest, ServerNotification>
): KinstaClientResult {
  try {
    const hash = getConfigHash();
    if (cachedClient && cachedConfigHash === hash) {
      return { success: true, client: cachedClient };
    }

    const config = loadKinstaConfig();
    cachedClient = new KinstaClient(config);
    cachedConfigHash = hash;
    return { success: true, client: cachedClient };
  } catch (err) {
    // Invalidate cache on error
    cachedClient = undefined;
    cachedConfigHash = undefined;

    if (err instanceof KinstaAuthError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown auth error",
    };
  }
}

/**
 * Get a KinstaClient, throwing on error.
 *
 * Use this variant when errors should propagate as exceptions (e.g., resources).
 *
 * @param extra - MCP request handler extra context
 * @returns KinstaClient instance
 * @throws Error if client cannot be created
 */
export function getKinstaClientOrThrow(
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>
): KinstaClient {
  const result = getKinstaClient(extra);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.client;
}
