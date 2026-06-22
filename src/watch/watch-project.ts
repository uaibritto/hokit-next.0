import { build } from "@hokit/build/build"
import { logger } from "@hokit/logger"
import type { BuildConfig } from "@hokit/types"
import chokidar from "chokidar"

export async function watchProject(config: BuildConfig) {
    // Estes estados serializam builds disparados por alterações rápidas.
    let running = false
    let queued = false

    const rebuild = async () => {
        if (running) {
            queued = true
            return
        }

        running = true

        do {
            queued = false
            try {
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

    const watcher = chokidar.watch(config.cwd, {
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
        watcher.once("ready", resolveReady)
    )
    logger.info("Watching files...")

    return watcher
}
