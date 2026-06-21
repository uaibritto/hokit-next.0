export function hokitConfigTemplate() {
    return `import { defineConfig } from "hokit"

export default defineConfig({
    cwd: "src/modules",
    presets: ["react"],
    target: "vscode"
})
`
}
