import path from "node:path"
import { fileURLToPath } from "node:url"

import { logger } from "@hokit/logger"
import chokidar from "chokidar"
import { execa } from "execa"

async function runBuildWorker(): Promise<void> {
    const dirname = path.dirname(fileURLToPath(import.meta.url))
    const worker = path.resolve(dirname, "workers/build-worker.js")

    await execa(process.execPath, [worker], {
        stdio: "inherit"
    })
}

export async function watchMode(): Promise<void> {
    await runBuildWorker()

    logger.info("watching...")

    const watcher = chokidar.watch("src/modules", { ignoreInitial: true })

    watcher.on("all", async (_event, file) => {
        logger.info(`Change detected ${file}`)

        try {
            await runBuildWorker()
        } catch (err) {
            logger.error((err as Error).message)
        }
    })
}
