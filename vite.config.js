import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      vue(), 
      Components({
        resolvers: [
          IconsResolver({
            prefix: "icons",
            enabledCollections: ['fa6-solid'],
            alias: {
                fas: "fa6-solid",
            },
          }),
        ],
      }),
      Icons({
        compiler: "vue3",
      }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
