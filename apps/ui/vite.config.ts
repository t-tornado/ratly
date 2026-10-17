/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": `${import.meta.dirname}/src`
    }
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: [
            'src/modules/**/*.test.tsx',
            'src/modules/**/*.test.ts',
            'src/lib/**/*.test.ts',
            'src/components/**/*.test.tsx',
            'src/providers/**/*.test.tsx',
          ],
          environment: 'jsdom',
          setupFiles: ['src/test/setup.ts'],
        }
      },
      {
        extends: true,
        test: {
          name: 'guards',
          include: ['src/guards/**/*.test.ts'],
          environment: 'node',
        }
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook')
          })
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{
              browser: 'chromium'
            }]
          }
        }
      }
    ]
  }
});