import type {
  CobaltRequest,
  CobaltResponse,
  InstanceInfoResponse,
} from "./types.ts";

/**
 * Cobalt API client module for TypeScript
 *
 * This module provides the main {@link CobaltClient} class for interacting with
 * Cobalt API instances. It offers type-safe methods for processing media URLs,
 * downloading files, and retrieving instance information.
 *
 * @example
 * ```ts
 * import { CobaltClient } from "@cute/cobalt-api";
 *
 * const client = new CobaltClient("https://api.cobalt.tools", "your-api-key");
 *
 * // Process a video
 * const result = await client.process({
 *   url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
 *   videoQuality: "1080"
 * });
 * ```
 *
 * @module
 */
export class CobaltClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  /**
   * Create a new Cobalt API client
   *
   * @param baseUrl The base URL of the Cobalt API instance (e.g., "https://api.cobalt.tools")
   * @param apiKey The API key for authentication (optional, not required for public instances)
   *
   * @example
   * ```ts
   * // Create client for public instance
   * const client = new CobaltClient("https://api.cobalt.tools");
   *
   * // Create client for private instance with API key
   * const privateClient = new CobaltClient("https://private.cobalt.tools", "your-api-key");
   * ```
   */
  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.apiKey = apiKey;
  }

  /**
   * Get the authorization header for API requests
   * @returns The authorization header value or undefined if no API key is provided
   */
  private getAuthHeader(): string | undefined {
    return this.apiKey ? `Api-Key ${this.apiKey}` : undefined;
  }

  /**
   * Process a media URL using the Cobalt API
   *
   * This method sends a request to the Cobalt API to process a media URL
   * and returns the appropriate response based on the processing result.
   *
   * @param request The processing request parameters
   * @returns Promise resolving to the API response
   * @throws Error if the request fails
   *
   * @example
   * ```ts
   * const result = await client.process({
   *   url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
   *   videoQuality: "1080",
   *   audioFormat: "mp3"
   * });
   *
   * if (result.status === "tunnel") {
   *   console.log("Download URL:", result.url);
   *   console.log("Filename:", result.filename);
   * }
   * ```
   */
  async process(request: CobaltRequest): Promise<CobaltResponse> {
    const url = `${this.baseUrl}/`;

    try {
      const headers: Record<string, string> = {
        "Accept": "application/json",
        "Content-Type": "application/json",
      };

      const authHeader = this.getAuthHeader();
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      });

      let data: CobaltResponse;

      try {
        data = await response.json() as CobaltResponse;
      } catch (jsonError) {
        // If JSON parsing fails, check if it's an HTTP error
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // If response is OK but JSON parsing failed, rethrow the JSON error
        throw jsonError;
      }

      if (data.status === "error") {
        // Log the error response for debugging
        // console.error("API error response:", data);
        throw new Error(
          `Cobalt API error: ${data.error.code}${
            data.error.context
              ? ` (context: ${JSON.stringify(data.error.context)})`
              : ""
          }`,
        );
      }

      if (!response.ok) {
        // Log the error response for debugging
        // console.error("Error response:", data);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to process request: ${error.message}`);
      }
      throw new Error("Failed to process request: Unknown error");
    }
  }

  /**
   * Get basic instance information from the Cobalt API
   *
   * Retrieves information about the Cobalt instance including version,
   * supported services, and other metadata.
   *
   * @returns Promise resolving to instance information
   * @throws Error if the request fails
   *
   * @example
   * ```ts
   * const info = await client.getInstanceInfo();
   * console.log("Cobalt version:", info.cobalt.version);
   * console.log("Supported services:", info.cobalt.services.join(", "));
   * ```
   */
  async getInstanceInfo(): Promise<InstanceInfoResponse> {
    const url = `${this.baseUrl}/`;

    try {
      const headers: Record<string, string> = {
        "Accept": "application/json",
      };

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json() as InstanceInfoResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get instance info: ${error.message}`);
      }
      throw new Error("Failed to get instance info: Unknown error");
    }
  }

  /**
   * Download a file from a tunnel URL
   *
   * Downloads the actual file data from a tunnel URL that was returned
   * by a previous {@link process} request.
   *
   * @param tunnelUrl The tunnel URL returned from a previous process request
   * @returns Promise resolving to the file data as ArrayBuffer
   * @throws Error if the request fails
   *
   * @example
   * ```ts
   * const result = await client.process({
   *   url: "https://youtube.com/watch?v=dQw4w9WgXcQ"
   * });
   *
   * if (result.status === "tunnel") {
   *   const fileData = await client.downloadFromTunnel(result.url);
   *   await Deno.writeFile("video.mp4", new Uint8Array(fileData));
   * }
   * ```
   */
  async downloadFromTunnel(tunnelUrl: string): Promise<ArrayBuffer> {
    try {
      const headers: Record<string, string> = {};

      const response = await fetch(tunnelUrl, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to download from tunnel: ${error.message}`);
      }
      throw new Error("Failed to download from tunnel: Unknown error");
    }
  }

  /**
   * Process a URL and automatically download the result if it's a tunnel or redirect
   *
   * This is a convenience method that combines {@link process} and {@link downloadFromTunnel}
   * into a single operation. It automatically downloads the file when the response
   * type is "tunnel" or "redirect".
   *
   * @param request The processing request parameters
   * @returns Promise resolving to an object with response type and file data (if applicable)
   * @throws Error if the request fails
   *
   * @example
   * ```ts
   * const { response, file } = await client.processAndDownload({
   *   url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
   *   videoQuality: "720",
   *   audioFormat: "mp3"
   * });
   *
   * if (file) {
   *   await Deno.writeFile("video.mp4", new Uint8Array(file));
   *   console.log("Downloaded:", response.filename);
   * } else {
   *   console.log("Processing result:", response.status);
   * }
   * ```
   */
  async processAndDownload(request: CobaltRequest): Promise<{
    response: CobaltResponse & { filename?: string };
    file?: ArrayBuffer;
  }> {
    const response = await this.process(request);

    // If it's a tunnel or redirect, download the file
    if (response.status === "tunnel" || response.status === "redirect") {
      const file = await this.downloadFromTunnel(response.url);
      return { response, file };
    }

    // For other response types, just return the response
    return { response };
  }
}
