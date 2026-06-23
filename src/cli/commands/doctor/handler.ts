import { access } from "node:fs/promises"
import { join } from "node:path"

import { loadConfig } from "@hokit/config/load-config"
import { resolvePresets } from "@hokit/config/resolve-presets"
import { resolveOutputPath } from "@hokit/filesystem/resolve-output-path"
import { resolveProjectPath } from "@hokit/filesystem/resolve-project-path"
import { logger } from "@hokit/logger"

export async function doctorHandler() {
    const checks: Array<[string, () => Promise<void> | void]> = [
        [
            "Node.js 20.6 or newer",
            () => {
                const [major = 0, minor = 0] = process.versions.node
                    .split(".")
                    .map(Number)
                if (major < 20 || (major === 20 && minor < 6)) {
                    throw new Error(
                        `Node.js ${process.versions.node} is unsupported.`
                    )
                }
            }
        ],
        ["hokit.config.ts", async () => void (await access("hokit.config.ts"))]
    ]

    let config: Awaited<ReturnType<typeof loadConfig>> | undefined

    try {
        config = await loadConfig(undefined, {
            allowEmptyPresets: true
        })
        const presets = resolvePresets(config)
        checks.push([
            "Modules directory",
            async () =>
                void (await access(
                    resolveProjectPath(process.cwd(), config!.cwd, {
                        allowRoot: true
                    })
                ))
        ])
        for (const [name, preset] of Object.entries(presets)) {
            if (!preset) continue
            checks.push([
                `Safe output for ${name}`,
                () =>
                    void resolveOutputPath(
                        process.cwd(),
                        config!.cwd,
                        join(config!.output, `${name}.json`)
                    )
            ])
        }
    } catch (error) {
        logger.error(error)
        throw new Error("Project health check failed.")
    }

    for (const [name, check] of checks) {
        try {
            await check()
            logger.success(name)
        } catch (error) {
            logger.error(error)
            throw new Error(`Health check failed: ${name}.`)
        }
    }

    logger.success("Project is healthy.")
}
