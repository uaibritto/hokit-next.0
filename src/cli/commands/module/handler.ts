import { mkdir, writeFile } from "node:fs/promises"
import { basename, join } from "node:path"

import { addPresetToConfig } from "@hokit/config/add-preset-to-config"
import { loadConfig } from "@hokit/config/load-config"
import { resolveProjectPath } from "@hokit/filesystem/resolve-project-path"
import { logger } from "@hokit/logger"
import { Presets } from "@hokit/presets/registry"
import { moduleTemplate } from "@hokit/templates"
import type { Preset } from "@hokit/types"

import { addTodoToModule } from "./add-todo-to-module"

export interface ModuleOptions {
    list?: boolean
    todo?: boolean
}

export async function moduleHandler(
    presetName?: string,
    options: ModuleOptions = {}
) {
    const names = Object.keys(Presets) as Preset[]

    if (options.list) {
        if (options.todo) {
            throw new Error('Flags "--list" and "--todo" cannot be combined.')
        }
        console.log(names.join("\n"))
        return
    }

    const config = await loadConfig(process.cwd(), {
        allowEmptyPresets: true
    })
    const selected = presetName ?? config.presets[0]

    if (!selected) {
        throw new Error("No preset is enabled in hokit.config.ts.")
    }

    if (!names.includes(selected as Preset)) {
        throw new Error(
            `Unknown preset "${selected}". Available presets: ${names.join(", ")}.`
        )
    }

    if (!config.presets.includes(selected as Preset)) {
        await addPresetToConfig(selected as Preset)
        config.presets.push(selected as Preset)
        logger.info(`Enabled preset "${selected}" in hokit.config.ts.`)
    }

    const directory = resolveProjectPath(process.cwd(), config.cwd, {
        allowRoot: true
    })
    const file = join(directory, `${selected}.ts`)
    const template = moduleTemplate(selected as Preset, {
        todo: options.todo ?? false
    })

    await mkdir(directory, { recursive: true })

    try {
        await writeFile(file, template, { flag: "wx", mode: 0o644 })
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "EEXIST") {
            if (options.todo) {
                await addTodoToModule(file)
                logger.success(`Added Todo to ${file}.`)
                return
            }
            throw new Error(`Module "${basename(file)}" already exists.`)
        }
        throw error
    }

    logger.success(`Created ${file}.`)
}
