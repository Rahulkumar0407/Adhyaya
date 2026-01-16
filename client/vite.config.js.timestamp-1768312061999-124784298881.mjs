// vite.config.js
import { defineConfig } from "file:///D:/Adhyaya/Adhyaya/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Adhyaya/Adhyaya/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      },
      "/socket.io": {
        target: "http://localhost:5000",
        ws: true
      }
    }
  },
  build: {
    // Enable minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        // Remove console.log in production
        drop_debugger: true
      }
    },
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - cached separately
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["framer-motion", "lucide-react"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-utils": ["axios", "date-fns"]
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1e3,
    // Enable source maps for debugging (disable in production)
    sourcemap: false
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "lucide-react",
      "axios",
      "@tanstack/react-query"
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxBZGh5YXlhXFxcXEFkaHlheWFcXFxcY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxBZGh5YXlhXFxcXEFkaHlheWFcXFxcY2xpZW50XFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9BZGh5YXlhL0FkaHlheWEvY2xpZW50L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gICAgcGx1Z2luczogW3JlYWN0KCldLFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgICAgcG9ydDogNTE3MyxcclxuICAgICAgICBwcm94eToge1xyXG4gICAgICAgICAgICAnL2FwaSc6IHtcclxuICAgICAgICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMCcsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJy9zb2NrZXQuaW8nOiB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjUwMDAnLFxyXG4gICAgICAgICAgICAgICAgd3M6IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICAgIC8vIEVuYWJsZSBtaW5pZmljYXRpb25cclxuICAgICAgICBtaW5pZnk6ICd0ZXJzZXInLFxyXG4gICAgICAgIHRlcnNlck9wdGlvbnM6IHtcclxuICAgICAgICAgICAgY29tcHJlc3M6IHtcclxuICAgICAgICAgICAgICAgIGRyb3BfY29uc29sZTogdHJ1ZSwgLy8gUmVtb3ZlIGNvbnNvbGUubG9nIGluIHByb2R1Y3Rpb25cclxuICAgICAgICAgICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gQ29kZSBzcGxpdHRpbmcgZm9yIGJldHRlciBjYWNoaW5nXHJcbiAgICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFZlbmRvciBjaHVua3MgLSBjYWNoZWQgc2VwYXJhdGVseVxyXG4gICAgICAgICAgICAgICAgICAgICd2ZW5kb3ItcmVhY3QnOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgJ3ZlbmRvci11aSc6IFsnZnJhbWVyLW1vdGlvbicsICdsdWNpZGUtcmVhY3QnXSxcclxuICAgICAgICAgICAgICAgICAgICAndmVuZG9yLXF1ZXJ5JzogWydAdGFuc3RhY2svcmVhY3QtcXVlcnknXSxcclxuICAgICAgICAgICAgICAgICAgICAndmVuZG9yLXV0aWxzJzogWydheGlvcycsICdkYXRlLWZucyddXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIEluY3JlYXNlIGNodW5rIHNpemUgd2FybmluZyBsaW1pdFxyXG4gICAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcclxuICAgICAgICAvLyBFbmFibGUgc291cmNlIG1hcHMgZm9yIGRlYnVnZ2luZyAoZGlzYWJsZSBpbiBwcm9kdWN0aW9uKVxyXG4gICAgICAgIHNvdXJjZW1hcDogZmFsc2VcclxuICAgIH0sXHJcbiAgICAvLyBPcHRpbWl6ZSBkZXBlbmRlbmNpZXNcclxuICAgIG9wdGltaXplRGVwczoge1xyXG4gICAgICAgIGluY2x1ZGU6IFtcclxuICAgICAgICAgICAgJ3JlYWN0JyxcclxuICAgICAgICAgICAgJ3JlYWN0LWRvbScsXHJcbiAgICAgICAgICAgICdyZWFjdC1yb3V0ZXItZG9tJyxcclxuICAgICAgICAgICAgJ2ZyYW1lci1tb3Rpb24nLFxyXG4gICAgICAgICAgICAnbHVjaWRlLXJlYWN0JyxcclxuICAgICAgICAgICAgJ2F4aW9zJyxcclxuICAgICAgICAgICAgJ0B0YW5zdGFjay9yZWFjdC1xdWVyeSdcclxuICAgICAgICBdXHJcbiAgICB9XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFRLFNBQVMsb0JBQW9CO0FBQ2xTLE9BQU8sV0FBVztBQUVsQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsUUFBUTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0gsUUFBUTtBQUFBLFFBQ0osUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2xCO0FBQUEsTUFDQSxjQUFjO0FBQUEsUUFDVixRQUFRO0FBQUEsUUFDUixJQUFJO0FBQUEsTUFDUjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFBQSxJQUVILFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxNQUNYLFVBQVU7QUFBQSxRQUNOLGNBQWM7QUFBQTtBQUFBLFFBQ2QsZUFBZTtBQUFBLE1BQ25CO0FBQUEsSUFDSjtBQUFBO0FBQUEsSUFFQSxlQUFlO0FBQUEsTUFDWCxRQUFRO0FBQUEsUUFDSixjQUFjO0FBQUE7QUFBQSxVQUVWLGdCQUFnQixDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxVQUN6RCxhQUFhLENBQUMsaUJBQWlCLGNBQWM7QUFBQSxVQUM3QyxnQkFBZ0IsQ0FBQyx1QkFBdUI7QUFBQSxVQUN4QyxnQkFBZ0IsQ0FBQyxTQUFTLFVBQVU7QUFBQSxRQUN4QztBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUE7QUFBQSxJQUVBLHVCQUF1QjtBQUFBO0FBQUEsSUFFdkIsV0FBVztBQUFBLEVBQ2Y7QUFBQTtBQUFBLEVBRUEsY0FBYztBQUFBLElBQ1YsU0FBUztBQUFBLE1BQ0w7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
