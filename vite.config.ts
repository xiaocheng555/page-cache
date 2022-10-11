import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import DefineOptions from 'unplugin-vue-define-options/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    vueJsx(),
    // vueSetupExtend(),
    DefineOptions()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.vue', '.js', '.json', '.tsx', '.ts']
  },
  build: {
    rollupOptions: {
      output: {
        // 重写sanitizeFileName方法，不生成‘_’前缀文件，解决vite打包之后生成 ‘_plugin-vue_export-helper.cdc0426e.js’ 文件，gh-page不解析_前缀文件，导致gh-page页面访问该文件报404
        // https://github.com/rollup/rollup/blob/master/src/utils/sanitizeFileName.ts
        sanitizeFileName (name) {
          const INVALID_CHAR_REGEX = /[\x00-\x1F\x7F<>*#"{}|^[\]`;?:&=+$,]/g
          const DRIVE_LETTER_REGEX = /^[a-z]:/i
          const match = DRIVE_LETTER_REGEX.exec(name)
          const driveLetter = match ? match[0] : ''

          // A `:` is only allowed as part of a windows drive letter (ex: C:\foo)
          // Otherwise, avoid them because they can refer to NTFS alternate data streams.
          return driveLetter + name.substr(driveLetter.length).replace(INVALID_CHAR_REGEX, '')
        }
      }
    }
  }
})
