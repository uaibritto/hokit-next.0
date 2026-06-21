export const hokitConfigTemplate: string = `
    import { defineConfig } from "hokit"
    import path from "node:path"

export default defineConfig({
    cwd: path.join("src", "module"),
    presets: ["empty"],
    target: "vscode"
})
`
