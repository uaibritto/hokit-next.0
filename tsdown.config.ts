import { defineConfig } from "tsdown"
import path from 'node:path'

export default defineConfig({
    entry: [
        path.join('src', 'index.ts'),
        path.join('src', 'cli', 'index.ts')
    ],
    outDir: "dist",
    dts: true,
    format: ["esm"],
    minify: true,
    clean: true,
    outExtensions: () => ({
        js: ".js"
    })
})
