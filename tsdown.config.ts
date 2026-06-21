import path from "node:path"

import { defineConfig } from "tsdown"

export default defineConfig({
    entry: [
        path.join("src", "index.ts"),
        path.join("src", "cli", "index.ts"),
        path.join("src", "validator", "index.ts")
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
