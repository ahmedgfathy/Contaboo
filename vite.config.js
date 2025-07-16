import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Remove proxy configuration to use Vercel serverless functions directly
  // API calls will go to /api/* which are handled by Vercel functions
})
