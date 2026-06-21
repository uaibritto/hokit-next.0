import { build } from "@hokit/build/build"
import { loadConfig } from "@hokit/config/load-config"
import { logger } from "@hokit/logger"

export async function buildHandler() {
    const config = await loadConfig()
    const result = await build(config)

    if (result.outputs.length === 0) {
        logger.warn("No snippet modules found.")
        return result
    }

    logger.success(
        `Built ${result.modules} module(s) into ${result.outputs.length} file(s).`
    )

    return result
}
