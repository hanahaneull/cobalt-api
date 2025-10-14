/**
 * Example demonstrating type usage with autocomplete
 *
 * This file shows how the exported types can be used with full
 * TypeScript autocomplete support.
 */

import { CobaltClient, type CobaltRequest } from "./src/index.ts";
// Alternatively, you can import types directly:
// import type { CobaltRequest, CobaltResponse } from "./src/types.ts";

// Create a new client instance
const client = new CobaltClient("https://api.cobalt.tools");

// Create a request with full type autocomplete
const request: CobaltRequest = {
  url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
  // All these properties will have autocomplete support:
  videoQuality: "1080",
  audioFormat: "mp3",
  downloadMode: "mute",
  filenameStyle: "pretty",
  disableMetadata: false,
  youtubeBetterAudio: true,
};

// Process the request with proper typing
async function processVideo() {
  try {
    const response = await client.process(request);

    // Response will have proper autocomplete for all response types
    switch (response.status) {
      case "tunnel":
      case "redirect":
        console.log(`Download URL: ${response.url}`);
        console.log(`Filename: ${response.filename}`);
        break;

      case "local-processing":
        console.log(`Processing type: ${response.type}`);
        console.log(`Service: ${response.service}`);
        break;

      case "picker":
        console.log(`Picker items: ${response.picker.length}`);
        break;

      case "error":
        console.error(`Error: ${response.error.code}`);
        break;
    }
  } catch (error) {
    console.error("Failed to process video:", error);
  }
}

// Get instance information with proper typing
async function getInstanceInfo() {
  try {
    const info = await client.getInstanceInfo();

    // All these properties will have autocomplete support:
    console.log(`Cobalt version: ${info.cobalt.version}`);
    console.log(`Instance URL: ${info.cobalt.url}`);
    console.log(`Supported services: ${info.cobalt.services.join(", ")}`);
    console.log(`Git commit: ${info.git.commit}`);
  } catch (error) {
    console.error("Failed to get instance info:", error);
  }
}

// Run the examples
if (import.meta.main) {
  await processVideo();
  await getInstanceInfo();
}
