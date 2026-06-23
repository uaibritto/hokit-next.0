import { rm } from "node:fs/promises"
import { join } from "node:path"

import { loadConfig } from "@hokit/config/load-config"
import { resolvePresets } from "@hokit/config/resolve-presets"
import { resolveOutputPath } from "@hokit/filesystem/resolve-output-path"
import { logger } from "@hokit/logger"

export async function cleanHandler() {
    const config = await loadConfig()

    const presets = resolvePresets(config)

    for (const [name, preset] of Object.entries(presets)) {
        if (!preset) continue

        const output = resolveOutputPath(
            process.cwd(),
            config.cwd,
            join(config.output, `${name}.json`)
        )

        await rm(output, {
            force: true,
            recursive: true
        })
    }

    logger.success("Generated files removed.")
}
