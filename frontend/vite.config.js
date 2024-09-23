import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  peerDependencies: {
    react: '^17.0.0 || ^18.0.0',
    'react-dom': '^17.0.0 || ^18.0.0',
  },
});
