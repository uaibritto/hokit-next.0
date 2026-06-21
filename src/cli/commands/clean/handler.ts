import { rm } from "node:fs/promises"

import { loadConfig } from "@hokit/config/load-config"
import { resolvePresets } from "@hokit/config/resolve-presets"
import { resolveOutputPath } from "@hokit/filesystem/resolve-output-path"
import { logger } from "@hokit/logger"

export async function cleanHandler() {
    const config = await loadConfig()

    const presets = resolvePresets(config)

    for (const preset of Object.values(presets)) {
        if (!preset) continue

        const output = resolveOutputPath(
            process.cwd(),
            config.cwd,
            preset.output
        )

        await rm(output, {
            force: true,
            recursive: true
        })
    }

    logger.success("Generated files removed.")
}
