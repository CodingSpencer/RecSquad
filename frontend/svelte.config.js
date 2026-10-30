import { createRequire } from 'node:module'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const require = createRequire(import.meta.url)

let adapter
try {
  adapter = require('@sveltejs/adapter-auto').default
} catch (e) {
  throw new Error(
    "Missing dependency '@sveltejs/adapter-auto'. Run 'cd frontend && npm install' " +
      '(or ./install.sh from the repo root) before building. Original error: ' + e.message
  )
}

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  }
}
