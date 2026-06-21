import path from "node:path"

import { defineConfig } from "@hokit/config"

export default defineConfig({
    cwd: path.join("src", "modules"),
    presets: ["node", "react"],
    target: "vscode"
})
