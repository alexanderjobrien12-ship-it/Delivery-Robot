// Vite is the tool that turns our React code into a real website.
// This config file just tells Vite we're using React.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
