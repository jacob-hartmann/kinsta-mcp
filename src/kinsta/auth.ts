/**
 * Kinsta Authentication
 *
 * Loads Kinsta API credentials from environment variables.
 *
 * Authentication is API key-based:
 *   - KINSTA_API_KEY (required) - Bearer token for the Kinsta API
 *   - KINSTA_COMPANY_ID (required for most endpoints)
 *   - KINSTA_API_BASE_URL (optional, defaults to https://api.kinsta.com/v2)
 */

import { KINSTA_API_BASE_URL } from "../constants.js";
import type { KinstaConfig } from "./types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export class KinstaAuthError extends Error {
  constructor(
    message: string,
    public readonly code: "NO_API_KEY" | "NO_COMPANY_ID"
  ) {
    super(message);
    this.name = "KinstaAuthError";
  }
}

// ---------------------------------------------------------------------------
// Config Loading
// ---------------------------------------------------------------------------

/**
 * Load Kinsta configuration from environment variables.
 *
 * @throws {KinstaAuthError} if required credentials are missing.
 */
export function loadKinstaConfig(): KinstaConfig {
  const apiKey = process.env["KINSTA_API_KEY"];
  if (!apiKey) {
    throw new KinstaAuthError(
      "KINSTA_API_KEY environment variable is required. " +
        "Generate one in MyKinsta > Company settings > API Keys.",
      "NO_API_KEY"
    );
  }

  const companyId = process.env["KINSTA_COMPANY_ID"];
  if (!companyId) {
    throw new KinstaAuthError(
      "KINSTA_COMPANY_ID environment variable is required. " +
        "Find it in MyKinsta under Company settings.",
      "NO_COMPANY_ID"
    );
  }

  const baseUrl = process.env["KINSTA_API_BASE_URL"] ?? KINSTA_API_BASE_URL;

  return { apiKey, companyId, baseUrl };
}

/**
 * Check whether Kinsta API credentials are configured.
 * Returns true if both KINSTA_API_KEY and KINSTA_COMPANY_ID are set.
 */
export function isKinstaConfigured(): boolean {
  return !!(process.env["KINSTA_API_KEY"] && process.env["KINSTA_COMPANY_ID"]);
}
