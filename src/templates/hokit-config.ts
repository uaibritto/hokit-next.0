export function hokitConfigTemplate() {
    return `import { defineConfig } from "hokit"

export default defineConfig({
    cwd: "src/modules",
    output: "dist/snippets",
    presets: [],
    docs: "off"
})
`
}
