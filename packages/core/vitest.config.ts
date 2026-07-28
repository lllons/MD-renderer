import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // jsdom provides a global `window` so DOMPurify sanitizes exactly as it
    // would in the browser — no jsdom dependency leaks into the shipped library.
    environment: "jsdom",
    include: ["test/**/*.test.ts"],
  },
});
