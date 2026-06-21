import { loadConfig } from "@hokit/config/load-config"
import { resolvePresets } from "@hokit/config/resolve-presets"
import { VERSION } from "@hokit/version"

export async function infoHandler() {
    const config = await loadConfig()
    const presets = resolvePresets(config)

    console.log(`Hokit ${VERSION}
Project: ${process.cwd()}
Modules: ${config.cwd}
Target: ${config.target ?? "vscode"}
Presets: ${Object.keys(presets).join(", ")}`)
}
