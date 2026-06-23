import { resolve } from "node:path"

import { build } from "@hokit/build/build"
import { loadConfig } from "@hokit/config/load-config"
import { resolveProjectPath } from "@hokit/filesystem/resolve-project-path"
import { logger } from "@hokit/logger"
import type { BuildConfig } from "@hokit/types"
import chokidar, { type FSWatcher } from "chokidar"

export async function watchProject(root = process.cwd()) {
    let running = false
    let queued = false
    let watcher: FSWatcher | undefined
    const watched = new Set([
        resolve(root, "hokit.config.ts"),
        resolve(root, "src/templates")
    ])

    const loadBuildConfig = async (): Promise<BuildConfig> => {
        const config = await loadConfig(root)
        const modulesDirectory = resolveProjectPath(root, config.cwd, {
            allowRoot: true
        })
        watched.add(modulesDirectory)
        watcher?.add(modulesDirectory)

        return config
    }

    const rebuild = async () => {
        if (running) {
            queued = true
            return
        }

        running = true

        do {
            queued = false
            try {
                const config = await loadBuildConfig()
                const result = await build(config)
                logger.success(
                    `Built ${result.modules} module(s) into ${result.outputs.length} file(s).`
                )
            } catch (error) {
                logger.error(error)
            }
        } while (queued)

        running = false
    }

    await rebuild()

    watcher = chokidar.watch([...watched], {
        ignoreInitial: true,
        ignored: "**/.hokit-*.ts",
        usePolling: true,
        interval: 100,
        awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 20
        }
    })

    watcher.on("all", () => {
        logger.info("Changes detected.")
        void rebuild()
    })
    watcher.on("error", (error) => logger.error(error))

    await new Promise<void>((resolveReady) =>
        watcher?.once("ready", resolveReady)
    )
    logger.info("Watching files...")

    return watcher
}
