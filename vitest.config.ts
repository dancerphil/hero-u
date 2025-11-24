import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        // environment: 'jsdom', // 使用 jsdom 模拟浏览器环境
        include: ['packages/*/src/**/*.test.{ts,tsx}'],
        // coverage: {
        //     provider: 'v8',
        //     include: ['packages/*/src/**/*.{ts,tsx}'],
        // },
    },
});
