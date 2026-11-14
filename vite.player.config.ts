import { defineConfig } from "vite";

// Library mode embeds sprite assets so exported games need no server.
export default defineConfig({
  publicDir: false,
  build: {
    outDir: ".generated", emptyOutDir: true,
    lib: { entry: "src/game-player.ts", name: "LearnDevGame", formats: ["iife"], fileName: () => "game-player.js" },
  },
});
