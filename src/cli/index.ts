#!/usr/bin/env node

import { Commands } from "@hokit/cli/commands"
import { logger } from "@hokit/logger"
import { VERSION } from "@hokit/version"

const command = process.argv[2]
const args = process.argv.slice(3)
const flags = new Set(args.filter((argument) => argument.startsWith("--")))

function rejectUnknownFlags(allowed: string[]) {
    const unknown = [...flags].filter((flag) => !allowed.includes(flag))
    if (unknown[0]) throw new Error(`Unknown flag "${unknown[0]}".`)
}

try {
    if (command === "--version" || flags.has("--version")) {
        console.log(VERSION)
        process.exitCode = 0
    } else if (command === "--help" || flags.has("--help")) {
        await Commands.help()
    } else {
        switch (command) {
            case "init":
                rejectUnknownFlags([])
                await Commands.init()

                break

            case "build":
                rejectUnknownFlags([])
                await Commands.build()

                break

            case "module":
                rejectUnknownFlags(["--list", "--todo"])
                await Commands.module(
                    args.find((argument) => !argument.startsWith("--")),
                    {
                        list: flags.has("--list"),
                        todo: flags.has("--todo")
                    }
                )

                break

            case "doctor":
                rejectUnknownFlags([])
                await Commands.doctor()

                break

            case "lint":
                rejectUnknownFlags(["--fix"])
                await Commands.lint({
                    fix: flags.has("--fix")
                })

                break

            case "clean":
                rejectUnknownFlags([])
                await Commands.clean()

                break

            case "info":
                rejectUnknownFlags([])
                await Commands.info()

                break

            case "watch":
                rejectUnknownFlags([])
                await Commands.watch()

                break

            case "help":

            case undefined:
                await Commands.help()

                break

            default:
                logger.error(new Error(`Unknown command "${command}".`))
                process.exitCode = 1
        }
    }
} catch (error) {
    logger.error(error)
    process.exitCode = 1
}
