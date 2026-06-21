#!/usr/bin/env bun
import { logger } from "@hokit/logger"

import { help, init, module, watchMode } from "./commands"

const command = process.argv[2]

switch (command) {
    case "help":
        await help()
        break
    case "init":
        await init()
        break
    case "module":
        await module(process.argv[3] ?? "empty")
        break
    case "watch":
        await watchMode()
        break
    default:
        logger.info(`Tem nada aqui não doido`)
}
