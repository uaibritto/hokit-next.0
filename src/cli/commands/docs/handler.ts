import { loadConfig } from "@hokit/config/load-config"
import { generateDocs } from "@hokit/docs/generate-docs"
import { logger } from "@hokit/logger"

export async function docsHandler() {
    const config = await loadConfig()
    const result = await generateDocs(config)
    logger.success(
        `Generated ${result.pages} documentation page(s) at ${result.index}.`
    )
    return result
}
