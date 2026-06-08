import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Port 5174 avoids clashing with the default Vite port (5173)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
});
