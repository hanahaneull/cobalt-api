/**
 * Cobalt API types module
 *
 * This module contains all TypeScript type definitions for interacting with the
 * Cobalt API. It includes request parameters, response types, and interfaces for
 * all API operations.
 *
 * @example
 * ```ts
 * import type { CobaltRequest, CobaltResponse } from "@cute/cobalt-api";
 *
 * const request: CobaltRequest = {
 *   url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
 *   videoQuality: "1080"
 * };
 * ```
 *
 * @module
 */

/**
 * Request parameters for the Cobalt API processing endpoint
 *
 * Used with the {@link CobaltClient.process} method to specify how media should be processed.
 */
export interface CobaltRequest {
  /** Source URL - required */
  url: string;

  /** Audio bitrate in kbps: 320 / 256 / 128 / 96 / 64 / 8 */
  audioBitrate?: "320" | "256" | "128" | "96" | "64" | "8";

  /** Audio format: best / mp3 / ogg / wav / opus */
  audioFormat?: "best" | "mp3" | "ogg" | "wav" | "opus";

  /** Download mode: auto / audio / mute */
  downloadMode?: "auto" | "audio" | "mute";

  /** Filename style: classic / pretty / basic / nerdy */
  filenameStyle?: "classic" | "pretty" | "basic" | "nerdy";

  /** Video quality: max / 4320 / 2160 / 1440 / 1080 / 720 / 480 / 360 / 240 / 144 */
  videoQuality?:
    | "max"
    | "4320"
    | "2160"
    | "1440"
    | "1080"
    | "720"
    | "480"
    | "360"
    | "240"
    | "144";

  /** Disable metadata in the file */
  disableMetadata?: boolean;

  /** Always tunnel all files, even when not necessary */
  alwaysProxy?: boolean;

  /** Local processing: disabled / preferred / forced */
  localProcessing?: "disabled" | "preferred" | "forced";

  /** Subtitle language code (ISO 639-1) */
  subtitleLang?: string;

  /** YouTube video codec: h264 / av1 / vp9 */
  youtubeVideoCodec?: "h264" | "av1" | "vp9";

  /** YouTube video container: auto / mp4 / webm / mkv */
  youtubeVideoContainer?: "auto" | "mp4" | "webm" | "mkv";

  /** YouTube dub language code (ISO 639-1) */
  youtubeDubLang?: string;

  /** Convert Twitter GIFs to actual GIF format */
  convertGif?: boolean;

  /** Allow H265/HEVC videos from TikTok/Xiaohongshu */
  allowH265?: boolean;

  /** Download original sound used in TikTok video */
  tiktokFullAudio?: boolean;

  /** Prefer higher quality YouTube audio if possible */
  youtubeBetterAudio?: boolean;

  /** Use HLS formats when downloading from YouTube */
  youtubeHLS?: boolean;
}

/**
 * Base response interface with status
 *
 * All response types from the Cobalt API extend this interface.
 */
export interface CobaltResponseBase {
  /** Response status: tunnel / redirect / local-processing / picker / error */
  status: "tunnel" | "redirect" | "local-processing" | "picker" | "error";
  /** Filename for the file (available when applicable) */
  filename?: string;
}

/**
 * Tunnel/Redirect response
 *
 * Returned when the media is ready for download through a tunnel URL or direct redirect.
 * Use {@link CobaltClient.downloadFromTunnel} to download the file.
 */
export interface TunnelRedirectResponse extends CobaltResponseBase {
  status: "tunnel" | "redirect";
  /** URL for the cobalt tunnel, or redirect to an external link */
  url: string;
  /** Cobalt-generated filename for the file being downloaded */
  filename: string;
}

/**
 * Output metadata object
 *
 * Contains metadata information that can be embedded in the output file.
 */
export interface OutputMetadata {
  /** Album name or collection title */
  album?: string;
  /** Composer of the track */
  composer?: string;
  /** Track's genre(s) */
  genre?: string;
  /** Copyright information or ownership details */
  copyright?: string;
  /** Title of the track or media file */
  title?: string;
  /** Artist or creator name */
  artist?: string;
  /** Album's artist or creator name */
  album_artist?: string;
  /** Track number or position in album */
  track?: string;
  /** Release date or creation date */
  date?: string;
  /** Subtitle language code (ISO 639-2) */
  sublanguage?: string;
}

/**
 * Output object for local processing
 *
 * Contains information about the output file when local processing is used.
 */
export interface OutputObject {
  /** MIME type of the output file */
  type: string;
  /** Filename of the output file */
  filename: string;
  /** Metadata associated with the file */
  metadata?: OutputMetadata;
  /** Whether tunnels include a subtitle file */
  subtitles?: boolean;
}

/**
 * Audio object for local processing
 *
 * Contains audio-specific configuration and information.
 */
export interface AudioObject {
  /** Defines whether audio codec data is copied */
  copy: boolean;
  /** Output audio format */
  format: string;
  /** Preferred bitrate of audio format */
  bitrate: string;
  /** Whether tunnels include a cover art file */
  cover?: boolean;
  /** Whether cover art should be cropped to a square */
  cropCover?: boolean;
}

/**
 * Local processing response
 *
 * Returned when the media needs to be processed locally on the client side.
 * Contains tunnel URLs for the different media streams.
 */
export interface LocalProcessingResponse extends CobaltResponseBase {
  status: "local-processing";
  /** Type: merge, mute, audio, gif, or remux */
  type: "merge" | "mute" | "audio" | "gif" | "remux";
  /** Origin service (youtube, twitter, instagram, etc) */
  service: string;
  /** Array of tunnel URLs */
  tunnel: string[];
  /** Details about the output file */
  output: OutputObject;
  /** Audio-specific details */
  audio?: AudioObject;
  /** Whether the output is in HLS format */
  isHLS?: boolean;
}

/**
 * Picker object for picker response
 *
 * Represents an individual media item in a picker response.
 */
export interface PickerObject {
  /** Type: photo / video / gif */
  type: "photo" | "video" | "gif";
  /** URL of the media */
  url: string;
  /** Thumbnail URL */
  thumb?: string;
}

/**
 * Picker response
 *
 * Returned when there are multiple media items to choose from, such as
 * in an image slideshow or gallery.
 */
export interface PickerResponse extends CobaltResponseBase {
  status: "picker";
  /** Returned when an image slideshow has a general background audio */
  audio?: string;
  /** Cobalt-generated filename, returned if audio exists */
  audioFilename?: string;
  /** Array of objects containing the individual media */
  picker: PickerObject[];
}

/**
 * Error context object
 *
 * Provides additional context about an error condition.
 */
export interface ErrorContext {
  /** Origin service */
  service?: string;
  /** The maximum downloadable video duration or the rate limit window */
  limit?: number;
}

/**
 * Error object
 *
 * Contains information about what went wrong during processing.
 */
export interface ErrorObject {
  /** Machine-readable error code explaining the failure reason */
  code: string;
  /** Additional error context */
  context?: ErrorContext;
}

/**
 * Error response
 *
 * Returned when an error occurs during processing.
 */
export interface ErrorResponse extends CobaltResponseBase {
  status: "error";
  /** Error code & optional context */
  error: ErrorObject;
}

/**
 * Union type for all possible Cobalt API responses
 *
 * This is the return type for {@link CobaltClient.process} and encompasses
 * all possible response types from the API.
 */
export type CobaltResponse =
  | TunnelRedirectResponse
  | LocalProcessingResponse
  | PickerResponse
  | ErrorResponse;

/**
 * Cobalt instance information
 *
 * Contains information about the Cobalt API instance.
 */
export interface CobaltInfo {
  /** Cobalt version */
  version: string;
  /** Instance URL */
  url: string;
  /** Instance start time in unix milliseconds */
  startTime: string;
  /** Site key for a turnstile widget */
  turnstileSitekey?: string;
  /** Array of services which this instance supports */
  services: string[];
}

/**
 * Git information
 *
 * Contains information about the git repository running the instance.
 */
export interface GitInfo {
  /** Commit hash */
  commit: string;
  /** Git branch */
  branch: string;
  /** Git remote */
  remote: string;
}

/**
 * Instance info response
 *
 * Return type for {@link CobaltClient.getInstanceInfo}.
 */
export interface InstanceInfoResponse {
  /** Information about the cobalt instance */
  cobalt: CobaltInfo;
  /** Information about the codebase that is currently running */
  git: GitInfo;
}
