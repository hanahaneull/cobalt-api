# Cobalt API - TypeScript Client for cobalt.tools

A type-safe TypeScript client for interacting with Cobalt API instances. This
package provides full TypeScript support and is designed specifically for JS
runtime.

## Features

- 🎯 Full TypeScript support with complete type definitions
- 🔐 API key authentication support
- 📦 Simple, intuitive API design
- 🚀 Built for any JS runtime
- 🛡️ Type-safe error handling
- 📚 Comprehensive documentation

## Installation

This is a JSR package. You can install it directly using your package manager:

```bash
# deno, pnpm 10.9+, and yarn 4.9+ with first class JSR support
deno add jsr:@cute/cobalt-api
pnpm add jsr:@cute/cobalt-api
yarn add jsr:@cute/cobalt-api

# npm, bun, and older versions of yarn or pnpm
npx jsr add @cute/cobalt-api
bunx jsr add @cute/cobalt-api
yarn dlx jsr add @cute/cobalt-api
pnpm dlx jsr add @cute/cobalt-api
```

## Usage

### Type Imports and Autocomplete

This package provides full TypeScript type definitions with excellent autocomplete support. You can import types in several ways:

```typescript
// Import both the client and types together
import { CobaltClient, type CobaltRequest, type CobaltResponse } from "@cute/cobalt-api";

// Or import types directly from the types module
import type { CobaltRequest, CobaltResponse } from "@cute/cobalt-api/types";

// Or import all types at once
import type * as CobaltTypes from "@cute/cobalt-api/types";
```

All types are fully exported and will provide autocomplete support in your IDE:

```typescript
// When creating a request, you'll get autocomplete for all options
const request: CobaltRequest = {
  url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
  // IDE will suggest all available properties:
  videoQuality: "1080",    // Autocomplete shows: "max" | "4320" | "2160" | ...
  audioFormat: "mp3",      // Autocomplete shows: "best" | "mp3" | "ogg" | ...
  downloadMode: "auto",    // Autocomplete shows: "auto" | "audio" | "mute"
  // ... and all other options
};

// When handling responses, you'll get autocomplete for all response types
const response = await client.process(request);

// TypeScript will know the exact type based on the status
if (response.status === "tunnel") {
  // IDE knows this is TunnelRedirectResponse
  console.log(response.url);      // Autocomplete available
  console.log(response.filename);  // Autocomplete available
}
```

### Basic Setup

```typescript
import { CobaltClient } from "@cute/cobalt-api";

// Create a client instance with your Cobalt API URL
// API key is optional - only required for private instances
const client = new CobaltClient(
  "https://api.cobalt.tools",
  "your-api-key-here",
);

// Or for public instances without authentication:
const publicClient = new CobaltClient("https://api.cobalt.tools");
```

### Processing Media

```typescript
// Process a YouTube video
const result = await client.process({
  url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
  videoQuality: "1080",
  audioFormat: "mp3",
  filenameStyle: "pretty",
});

console.log(result);
```

### Process and Download in One Step

```typescript
// Process and automatically download if it's a tunnel or redirect
const { response, file } = await client.processAndDownload({
  url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
  videoQuality: "720",
  audioFormat: "opus",
});

if (file) {
  // Save the file to disk
  await Deno.writeFile("video.mp4", new Uint8Array(file));
  console.log("File downloaded successfully!");
}
```

### Getting Instance Information

```typescript
// Get information about the Cobalt instance
const info = await client.getInstanceInfo();

console.log("Cobalt version:", info.cobalt.version);
console.log("Supported services:", info.cobalt.services);
console.log("Instance URL:", info.cobalt.url);
```

### Downloading from Tunnel URLs

```typescript
// If you have a tunnel URL from a previous request
const tunnelUrl = "https://api.cobalt.tools/tunnel/abc123...";
const fileData = await client.downloadFromTunnel(tunnelUrl);

// Save the file
await Deno.writeFile("downloaded-file.mp4", new Uint8Array(fileData));
```

## API Reference

### CobaltClient

#### Constructor

```typescript
new CobaltClient(baseUrl: string, apiKey: string)
```

- `baseUrl`: The base URL of your Cobalt API instance
- `apiKey`: Your API key for authentication

#### Methods

##### `process(request: CobaltRequest): Promise<CobaltResponse>`

Process a media URL using the Cobalt API.

##### `processAndDownload(request: CobaltRequest): Promise<{ response: CobaltResponse; file?: ArrayBuffer }>`

Process a URL and automatically download the result if it's a tunnel or
redirect.

##### `getInstanceInfo(): Promise<InstanceInfoResponse>`

Get basic instance information from the Cobalt API.

##### `downloadFromTunnel(tunnelUrl: string): Promise<ArrayBuffer>`

Download a file from a tunnel URL.

### Request Options

The `process` method accepts a `CobaltRequest` object with the following
options:

#### General Options

- `url` (required): Source URL
- `audioBitrate`: `"320" | "256" | "128" | "96" | "64" | "8"` (kbps) - Default:
  `"128"`
- `audioFormat`: `"best" | "mp3" | "ogg" | "wav" | "opus"` - Default: `"mp3"`
- `downloadMode`: `"auto" | "audio" | "mute"` - Default: `"auto"`
- `filenameStyle`: `"classic" | "pretty" | "basic" | "nerdy"` - Default:
  `"basic"`
- `videoQuality`:
  `"max" | "4320" | "2160" | "1440" | "1080" | "720" | "480" | "360" | "240" | "144"` -
  Default: `"1080"`
- `disableMetadata`: `boolean` - Default: `false`
- `alwaysProxy`: `boolean` - Default: `false`
- `localProcessing`: `"disabled" | "preferred" | "forced"` - Default:
  `"disabled"`
- `subtitleLang`: `string` (ISO 639-1 language code)

#### Service-Specific Options

- `youtubeVideoCodec`: `"h264" | "av1" | "vp9"` - Default: `"h264"`
- `youtubeVideoContainer`: `"auto" | "mp4" | "webm" | "mkv"` - Default: `"auto"`
- `youtubeDubLang`: `string` (ISO 639-1 language code)
- `convertGif`: `boolean` - Default: `true`
- `allowH265`: `boolean` - Default: `false`
- `tiktokFullAudio`: `boolean` - Default: `false`
- `youtubeBetterAudio`: `boolean` - Default: `false`
- `youtubeHLS`: `boolean` - Default: `false`

## Response Types

The API can return different types of responses:

- **Tunnel/Redirect**: When the file is ready for download
- **Local Processing**: When you need to process files locally
- **Picker**: When there are multiple items to choose from
- **Error**: When something goes wrong

Each response type is fully typed and provides access to all the data returned
by the Cobalt API.

### Filename Access

All response objects from the `process()` and `processAndDownload()` methods include a convenient `filename` property that automatically extracts the appropriate filename based on the response type:

- **Tunnel/Redirect responses**: Uses the filename from the response
- **Local processing responses**: Uses the filename from the output object
- **Picker responses**: Uses the audio filename if available
- **Error responses**: Filename is undefined

This eliminates the need to manually check different response types to extract the filename.

## Error Handling

The client provides comprehensive error handling:

```typescript
try {
  const result = await client.process({
    url: "https://invalid-url.com/video",
  });
} catch (error) {
  console.error("Processing failed:", error.message);
  // Errors include detailed information about what went wrong
}
```

## Examples

### Download YouTube Audio Only

```typescript
import { CobaltClient } from "@cute/cobalt-api";

const client = new CobaltClient(
  "https://your-cobalt-instance.com",
  "your-api-key",
);

const { response, file } = await client.processAndDownload({
  url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
  downloadMode: "audio",
  audioFormat: "mp3",
  audioBitrate: "320",
});

if (file) {
  await Deno.writeFile("audio.mp3", new Uint8Array(file));
  console.log("Audio downloaded!");
}
```

### Download TikTok Video with Original Audio

```typescript
const { response, file } = await client.processAndDownload({
  url: "https://tiktok.com/@user/video/1234567890",
  videoQuality: "1080",
  tiktokFullAudio: true,
  filenameStyle: "pretty",
});

if (file) {
  await Deno.writeFile("tiktok-video.mp4", new Uint8Array(file));
}
```

### Process Multiple URLs

```typescript
const urls = [
  "https://youtube.com/watch?v=video1",
  "https://youtube.com/watch?v=video2",
  "https://youtube.com/watch?v=video3",
];

for (const url of urls) {
  try {
    const result = await client.process({
      url,
      videoQuality: "720",
      audioFormat: "mp3",
    });
    console.log(`Processed ${url}:`, result.status);
  } catch (error) {
    console.error(`Failed to process ${url}:`, error.message);
  }
}
```

## Known Issue

Sometimes it can hang forever (redirect/tunnel) (instance issue, probably), set timeout to prevent that.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please file an issue on the
GitHub repository.
