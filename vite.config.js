// vite.config.js in the main directory
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, 'build/ui'),  // 修改为你想要的输出目录
  }
});
