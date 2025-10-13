/**
 * Test file for Cobalt API client
 * Run with: deno test --allow-net test.ts
 */

import { assertEquals, assertExists, assertRejects } from "@std/assert";
import { CobaltClient } from "../src/index.ts";

// Mock fetch for testing
const originalFetch = globalThis.fetch;

// Test data
const mockBaseUrl = "https://api.cobalt.tools";
const mockApiKey = "test-api-key";

// Mock responses
const mockInstanceInfoResponse = {
  cobalt: {
    version: "0.6.0",
    url: "https://api.cobalt.tools",
    startTime: "1640995200000",
    services: ["youtube", "twitter", "tiktok", "instagram"],
  },
  git: {
    commit: "abc123",
    branch: "main",
    remote: "origin",
  },
};

const mockTunnelResponse = {
  status: "tunnel",
  url: "https://api.cobalt.tools/tunnel/abc123",
  filename: "video.mp4",
};

const mockErrorResponse = {
  status: "error",
  error: {
    code: "content.not_available",
    context: {
      service: "youtube",
    },
  },
};

Deno.test("CobaltClient - Constructor with API key", () => {
  const client = new CobaltClient(mockBaseUrl, mockApiKey);
  assertExists(client);
});

Deno.test("CobaltClient - Constructor without API key", () => {
  const client = new CobaltClient(mockBaseUrl);
  assertExists(client);
});

Deno.test("CobaltClient - Constructor removes trailing slash", () => {
  const client = new CobaltClient("https://api.cobalt.tools/");
  assertExists(client);
});

Deno.test("CobaltClient - getInstanceInfo success", async () => {
  // Mock fetch
  globalThis.fetch = () => {
    return Promise.resolve(
      new Response(JSON.stringify(mockInstanceInfoResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  };

  const client = new CobaltClient(mockBaseUrl, mockApiKey);
  const result = await client.getInstanceInfo();

  assertEquals(result.cobalt.version, "0.6.0");
  assertEquals(result.cobalt.services.length, 4);
  assertEquals(result.git.commit, "abc123");

  // Restore original fetch
  globalThis.fetch = originalFetch;
});

Deno.test("CobaltClient - getInstanceInfo without API key", async () => {
  // Mock fetch
  globalThis.fetch = (_url, options) => {
    // Verify no Authorization header is sent
    const headers = options?.headers as Record<string, string> | undefined;
    assertEquals(headers?.Authorization, undefined);

    return Promise.resolve(
      new Response(JSON.stringify(mockInstanceInfoResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  };

  const client = new CobaltClient(mockBaseUrl);
  const result = await client.getInstanceInfo();

  assertEquals(result.cobalt.version, "0.6.0");

  // Restore original fetch
  globalThis.fetch = originalFetch;
});

Deno.test("CobaltClient - process success", async () => {
  // Mock fetch
  globalThis.fetch = (_url, options) => {
    // Verify Authorization header is sent
    const headers = options?.headers as Record<string, string> | undefined;
    assertEquals(headers?.Authorization, `Api-Key ${mockApiKey}`);

    return Promise.resolve(
      new Response(JSON.stringify(mockTunnelResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  };

  const client = new CobaltClient(mockBaseUrl, mockApiKey);
  const result = await client.process({
    url: "https://youtube.com/watch?v=test",
    videoQuality: "1080",
  });

  assertEquals(result.status, "tunnel");
  if (result.status === "tunnel" || result.status === "redirect") {
    assertEquals(result.filename, "video.mp4");
  }

  // Restore original fetch
  globalThis.fetch = originalFetch;
});

Deno.test("CobaltClient - process error response", async () => {
  // Mock fetch
  globalThis.fetch = () => {
    return Promise.resolve(
      new Response(JSON.stringify(mockErrorResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  };

  const client = new CobaltClient(mockBaseUrl, mockApiKey);

  await assertRejects(
    async () => {
      await client.process({
        url: "https://youtube.com/watch?v=invalid",
      });
    },
    Error,
    "Cobalt API error: content.not_available",
  );

  // Restore original fetch
  globalThis.fetch = originalFetch;
});

Deno.test("CobaltClient - process HTTP error", async () => {
  // Mock fetch
  globalThis.fetch = () => {
    return Promise.resolve(
      new Response("Internal Server Error", {
        status: 500,
        statusText: "Internal Server Error",
      }),
    );
  };

  const client = new CobaltClient(mockBaseUrl, mockApiKey);

  await assertRejects(
    async () => {
      await client.process({
        url: "https://youtube.com/watch?v=test",
      });
    },
    Error,
    "HTTP error! status: 500",
  );

  // Restore original fetch
  globalThis.fetch = originalFetch;
});

Deno.test("CobaltClient - downloadFromTunnel success", async () => {
  const mockFileData = new Uint8Array([1, 2, 3, 4, 5]);

  // Mock fetch
  globalThis.fetch = () => {
    return Promise.resolve(
      new Response(mockFileData.buffer, {
        status: 200,
        headers: { "Content-Type": "video/mp4" },
      }),
    );
  };

  const client = new CobaltClient(mockBaseUrl, mockApiKey);
  const result = await client.downloadFromTunnel(
    "https://api.cobalt.tools/tunnel/abc123",
  );

  assertEquals(result.byteLength, 5);

  // Restore original fetch
  globalThis.fetch = originalFetch;
});

Deno.test("CobaltClient - downloadFromTunnel without API key", async () => {
  const mockFileData = new Uint8Array([1, 2, 3, 4, 5]);

  // Mock fetch
  globalThis.fetch = () => {
    return Promise.resolve(
      new Response(mockFileData.buffer, {
        status: 200,
        headers: { "Content-Type": "video/mp4" },
      }),
    );
  };

  const client = new CobaltClient(mockBaseUrl);
  const result = await client.downloadFromTunnel(
    "https://api.cobalt.tools/tunnel/abc123",
  );

  assertEquals(result.byteLength, 5);

  // Restore original fetch
  globalThis.fetch = originalFetch;
});

Deno.test("CobaltClient - downloadFromTunnel error", async () => {
  // Mock fetch
  globalThis.fetch = () => {
    return Promise.resolve(
      new Response("Not Found", {
        status: 404,
        statusText: "Not Found",
      }),
    );
  };

  const client = new CobaltClient(mockBaseUrl, mockApiKey);

  await assertRejects(
    async () => {
      await client.downloadFromTunnel(
        "https://api.cobalt.tools/tunnel/invalid",
      );
    },
    Error,
    "HTTP error! status: 404",
  );

  // Restore original fetch
  globalThis.fetch = originalFetch;
});

Deno.test("CobaltClient - processAndDownload with tunnel", async () => {
  const mockFileData = new Uint8Array([1, 2, 3, 4, 5]);
  let fetchCallCount = 0;

  // Mock fetch
  globalThis.fetch = (_url, _options) => {
    fetchCallCount++;

    if (fetchCallCount === 1) {
      // First call - process request
      return Promise.resolve(
        new Response(JSON.stringify(mockTunnelResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    } else {
      // Second call - download from tunnel
      return Promise.resolve(
        new Response(mockFileData.buffer, {
          status: 200,
          headers: { "Content-Type": "video/mp4" },
        }),
      );
    }
  };

  const client = new CobaltClient(mockBaseUrl, mockApiKey);
  const result = await client.processAndDownload({
    url: "https://youtube.com/watch?v=test",
    videoQuality: "1080",
  });

  assertEquals(result.response.status, "tunnel");
  assertExists(result.file);
  if (result.file) {
    assertEquals(result.file.byteLength, 5);
  }
  assertEquals(fetchCallCount, 2);

  // Restore original fetch
  globalThis.fetch = originalFetch;
});

Deno.test("CobaltClient - processAndDownload with local processing", async () => {
  const mockLocalProcessingResponse = {
    status: "local-processing",
    type: "merge",
    service: "youtube",
    tunnel: [
      "https://api.cobalt.tools/tunnel/video1",
      "https://api.cobalt.tools/tunnel/audio1",
    ],
    output: {
      type: "video/mp4",
      filename: "merged-video.mp4",
      metadata: {
        title: "Test Video",
      },
    },
  };

  // Mock fetch
  globalThis.fetch = () => {
    return Promise.resolve(
      new Response(JSON.stringify(mockLocalProcessingResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  };

  const client = new CobaltClient(mockBaseUrl, mockApiKey);
  const result = await client.processAndDownload({
    url: "https://youtube.com/watch?v=test",
    localProcessing: "preferred",
  });

  assertEquals(result.response.status, "local-processing");
  assertEquals(result.file, undefined); // No file downloaded for local processing

  // Restore original fetch
  globalThis.fetch = originalFetch;
});

Deno.test("CobaltClient - Request parameters validation", async () => {
  // Mock fetch
  globalThis.fetch = (_url, options) => {
    const body = JSON.parse(options?.body as string);

    // Verify required parameter
    assertEquals(typeof body.url, "string");
    assertEquals(body.url, "https://youtube.com/watch?v=test");

    // Verify optional parameters
    assertEquals(body.videoQuality, "720");
    assertEquals(body.audioFormat, "opus");
    assertEquals(body.disableMetadata, true);

    return Promise.resolve(
      new Response(JSON.stringify(mockTunnelResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  };

  const client = new CobaltClient(mockBaseUrl, mockApiKey);
  await client.process({
    url: "https://youtube.com/watch?v=test",
    videoQuality: "720",
    audioFormat: "opus",
    disableMetadata: true,
    youtubeVideoCodec: "av1",
    tiktokFullAudio: true,
  });

  // Restore original fetch
  globalThis.fetch = originalFetch;
});
