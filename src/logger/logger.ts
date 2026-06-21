import pc from "picocolors"

import { HokitError } from "../errors"
import { type LogLevel, LOG_LEVEL_WEIGHT } from "./levels"

export interface LoggerOptions {
    level?: LogLevel
}

export class Logger {
    private level: LogLevel

    constructor(options: LoggerOptions = {}) {
        this.level = options.level ?? "info"
    }

    private canLog(level: LogLevel) {
        return LOG_LEVEL_WEIGHT[this.level] >= LOG_LEVEL_WEIGHT[level]
    }

    info(message: string) {
        if (this.canLog("info")) {
            console.log(`${pc.blue("ℹ")} ${message}`)
        }
    }

    success(message: string) {
        if (this.canLog("info")) {
            console.log(`${pc.green("✓")} ${message}`)
        }
    }

    warn(message: string) {
        if (this.canLog("warn")) {
            console.warn(`${pc.yellow("⚠")} ${message}`)
        }
    }

    debug(message: string) {
        if (this.canLog("debug")) {
            console.debug(`${pc.dim("◦")} ${pc.dim(message)}`)
        }
    }

    error(error: unknown) {
        if (!this.canLog("error")) {
            return
        }

        if (error instanceof HokitError) {
            console.error(
                `${pc.red("✖")} ${pc.bold(error.name)}: ${error.message}`
            )

            console.error(`  ${pc.dim("Code:")} ${pc.red(error.code)}`)

            if (error.hint) {
                console.error(`  ${pc.dim("Hint:")} ${error.hint}`)
            }

            if (error.cause instanceof Error) {
                console.error(`  ${pc.dim("Cause:")} ${error.cause.message}`)
            }

            return
        }

        if (error instanceof Error) {
            console.error(
                `${pc.red("✖")} ${pc.bold(error.name)}: ${error.message}`
            )

            return
        }

        console.error(`${pc.red("✖")} Unknown error`)
        console.error(error)
    }
}

export const logger = new Logger()
