/**
 * cobalt - TypeScript & type-safe client wrapper
 *
 * A complete TypeScript package for interacting with Cobalt API instances.
 * Supports API key authentication and provides full type safety.
 *
 * @example
 * ```typescript
 * import { CobaltClient } from "@cute/cobalt-api";
 *
 * const client = new CobaltClient("https://api.cobalt.tools", "your-api-key");
 *
 * // Process a YouTube video
 * const result = await client.process({
 *   url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
 *   videoQuality: "1080",
 *   audioFormat: "mp3"
 * });
 *
 * // Get instance information
 * const info = await client.getInstanceInfo();
 * console.log(info.cobalt.version);
 * ```
 *
 * @module
 */

// Export all types
export * from "./types.ts";

// Export the client class and utility function
export { CobaltClient } from "./client.ts";
