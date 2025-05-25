import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/vocabulary-builder-game/', // <-- add this line or update it
  plugins: [react()],
})
