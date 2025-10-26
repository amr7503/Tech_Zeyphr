import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Use relative asset paths for production builds so the site works when served from
  // a subpath or via a CDN. In development we keep the default '/'.
  base: mode === "development" ? "/" : "./",
  server: {
    host: "::",
    port: 8080,
  // Allow Render preview hosts to access the dev server when doing remote previews.
  // Add any other hostnames that need access here.
  // Include both variants to be permissive during preview/redeploy troubleshooting.
  allowedHosts: ["tech-zeyphr.onrender.com", "tech-zeyphr-1.onrender.com"],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
