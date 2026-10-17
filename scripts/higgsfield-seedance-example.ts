/**
 * Minimal example: generate a video via the Higgsfield API (Seedance 2.5,
 * text-to-video) using the official @higgsfield/client v2 SDK.
 *
 * Requires HF_CREDENTIALS in .env.local, in "key-id:key-secret" format.
 * The credential is read by the SDK from the environment — it is never
 * logged or printed by this script.
 *
 * Run: npx tsx scripts/higgsfield-seedance-example.ts
 */
import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Next.js reads .env.local itself; a standalone script does not, so load it
// explicitly without ever printing its contents.
const envLocalPath = resolve(process.cwd(), ".env.local");
if (existsSync(envLocalPath)) {
  for (const line of readFileSync(envLocalPath, "utf-8").split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

import {
  higgsfield,
  AuthenticationError,
  CredentialsMissedError,
  NotEnoughCreditsError,
  BadInputError,
  ValidationError,
  APIError,
} from "@higgsfield/client/v2";

async function main() {
  if (!process.env.HF_CREDENTIALS) {
    console.error(
      "Missing HF_CREDENTIALS. Add it to .env.local as HF_CREDENTIALS=key-id:key-secret (do not commit this file)."
    );
    process.exitCode = 1;
    return;
  }

  console.log("Submitting Seedance 2.5 text-to-video request...");

  const response = await higgsfield.subscribe("bytedance/seedance-2.5/text-to-video", {
    input: {
      prompt: "A cinematic scene at sunset",
      duration: 5,
      resolution: "720p",
      aspect_ratio: "16:9",
    },
    withPolling: true,
  });

  switch (response.status) {
    case "completed": {
      const url = response.video?.url ?? response.images?.[0]?.url;
      if (url) {
        console.log("Success. Video URL:", url);
      } else {
        console.error("Request reported completed but no media URL was returned.");
        process.exitCode = 1;
      }
      return;
    }
    case "nsfw":
      console.error("Request was rejected by content moderation (nsfw). No video was generated.");
      process.exitCode = 1;
      return;
    case "failed":
      console.error("Generation failed. No video was generated.");
      process.exitCode = 1;
      return;
    default:
      console.error("Request did not reach a terminal state:", response.status);
      process.exitCode = 1;
  }
}

main().catch((error) => {
  if (error instanceof CredentialsMissedError || error instanceof AuthenticationError) {
    console.error("Authentication failed — check HF_CREDENTIALS in .env.local.");
  } else if (error instanceof NotEnoughCreditsError) {
    console.error("Insufficient credits on this Higgsfield account.");
  } else if (error instanceof BadInputError || error instanceof ValidationError) {
    console.error("Invalid input parameters:", error.message);
  } else if (error instanceof APIError) {
    console.error("API error:", error.statusCode, error.message);
  } else {
    console.error("Request failed:", error instanceof Error ? error.message : error);
  }
  process.exitCode = 1;
});
