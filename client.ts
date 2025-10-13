import type {
  CobaltRequest,
  CobaltResponse,
  InstanceInfoResponse,
} from "./types.ts";

/**
 * Cobalt API client for TypeScript
 * Provides type-safe methods to interact with a Cobalt API instance
 */
export class CobaltClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  /**
   * Create a new Cobalt API client
   * @param baseUrl The base URL of the Cobalt API instance (e.g., "https://api.cobalt.tools")
   * @param apiKey The API key for authentication (optional, not required for public instances)
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
   * @param request The processing request parameters
   * @returns Promise resolving to the API response
   * @throws Error if the request fails
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
   * @returns Promise resolving to instance information
   * @throws Error if the request fails
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
   * @param tunnelUrl The tunnel URL returned from a previous process request
   * @returns Promise resolving to the file data as ArrayBuffer
   * @throws Error if the request fails
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
   * @param request The processing request parameters
   * @returns Promise resolving to an object with response type and file data (if applicable)
   * @throws Error if the request fails
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
