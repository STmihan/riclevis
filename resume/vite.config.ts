import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resumePlugin } from './vite-plugins/resume-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), resumePlugin()],
})
