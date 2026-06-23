#!/usr/bin/env node

import { Commands } from "@hokit/cli/commands"
import { logger } from "@hokit/logger"
import { VERSION } from "@hokit/version"

const command = process.argv[2]
const args = process.argv.slice(3)
const flags = new Set(args.filter((argument) => argument.startsWith("--")))
const positionals = args.filter((argument) => !argument.startsWith("--"))

function rejectUnknownFlags(allowed: string[]) {
    const unknown = [...flags].filter((flag) => !allowed.includes(flag))
    if (unknown[0]) throw new Error(`Unknown flag "${unknown[0]}".`)
}

function pickSinglePresetFlag(knownFlags: string[]) {
    const presetFlags = args.filter(
        (argument) =>
            argument.startsWith("--") && !knownFlags.includes(argument)
    )

    if (presetFlags.length > 1) {
        throw new Error(`Unexpected flag "${presetFlags[1]}".`)
    }

    return presetFlags[0]?.slice(2)
}

function pickSinglePositional() {
    if (positionals.length > 1) {
        throw new Error(`Unexpected argument "${positionals[1]}".`)
    }

    return positionals[0]
}

function pickPresetAndPrefix(knownFlags: string[]) {
    const presetFlag = pickSinglePresetFlag(knownFlags)

    if (presetFlag) {
        if (positionals.length > 1) {
            throw new Error(`Unexpected argument "${positionals[1]}".`)
        }

        return {
            prefix: positionals[0],
            preset: presetFlag
        }
    }

    if (positionals.length > 2) {
        throw new Error(`Unexpected argument "${positionals[2]}".`)
    }

    return {
        prefix: positionals[1],
        preset: positionals[0]
    }
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
                rejectUnknownFlags(["--include-todo", "--include-todos"])
                await Commands.build({
                    includeTodos:
                        flags.has("--include-todo") ||
                        flags.has("--include-todos")
                })

                break

            case "module":
                if (flags.has("--list")) {
                    rejectUnknownFlags(["--list"])
                    if (pickSinglePositional()) {
                        throw new Error(
                            'Command "module --list" takes no preset.'
                        )
                    }
                }

                {
                    const presetFlag = pickSinglePresetFlag(["--list"])
                    const preset = pickSinglePositional()

                    if (presetFlag && preset) {
                        throw new Error(
                            "Choose either a preset flag or a positional preset."
                        )
                    }

                    await Commands.module(presetFlag ?? preset, {
                        list: flags.has("--list")
                    })
                }

                break

            case "snippet":
                {
                    const parsed = pickPresetAndPrefix(["--list"])
                    if (flags.has("--list") && positionals.length > 0) {
                        throw new Error(
                            'Command "snippet --list" takes no prefix.'
                        )
                    }
                    await Commands.snippet(parsed.preset, parsed.prefix, {
                        list: flags.has("--list")
                    })
                }

                break

            case "todo":
                {
                    const parsed = pickPresetAndPrefix(["--list"])
                    if (flags.has("--list") && positionals.length > 0) {
                        throw new Error(
                            'Command "todo --list" takes no prefix.'
                        )
                    }
                    await Commands.todo(parsed.preset, parsed.prefix, {
                        list: flags.has("--list")
                    })
                }

                break

            case "doctor":
                rejectUnknownFlags([])
                await Commands.doctor()

                break

            case "lint":
                rejectUnknownFlags(["--fix", "--json"])
                await Commands.lint({
                    fix: flags.has("--fix"),
                    json: flags.has("--json")
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
