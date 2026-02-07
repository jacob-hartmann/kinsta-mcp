/**
 * HTML Utilities
 *
 * Shared HTML helper functions for escaping and rendering.
 */

/**
 * Escape HTML special characters to prevent XSS attacks.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
