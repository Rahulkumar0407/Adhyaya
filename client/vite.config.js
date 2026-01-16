import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true
            },
            '/socket.io': {
                target: 'http://localhost:5000',
                ws: true
            }
        }
    },
    build: {
        // Use esbuild for minification (built-in, no extra install needed)
        minify: 'esbuild',
        // Code splitting for better caching
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunks - cached separately
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-ui': ['framer-motion', 'lucide-react'],
                    'vendor-query': ['@tanstack/react-query'],
                    'vendor-utils': ['axios', 'date-fns']
                }
            }
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Enable source maps for debugging (disable in production)
        sourcemap: false
    },
    // Optimize dependencies
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            'framer-motion',
            'lucide-react',
            'axios',
            '@tanstack/react-query'
        ]
    }
});
