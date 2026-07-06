import { rm } from "node:fs/promises";

const target = new URL("../.next", import.meta.url);

try {
  await rm(target, { recursive: true, force: true });
} catch {
  // Ignore cache cleanup failures; Next can still start if the folder is busy.
}
