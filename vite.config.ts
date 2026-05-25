import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/lib/index.ts"),
      name: "AnthusVultus",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "anthus-vultus.js" : "anthus-vultus.cjs")
    },
    rollupOptions: {
      external: ["react", "react-dom", "gsap"]
    }
  }
});
