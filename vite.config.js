// vite.config.js in the main directory
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  const outDir = process.env.VITE_OUT_DIR || 'dist';
  return {
    build: {
      outDir: path.resolve(__dirname, outDir),
      emptyOutDir: true // 确保构建时清空输出目录
    }
  };
});
