import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { addPresetToConfig } from "@hokit/config/add-preset-to-config"
import { loadConfig } from "@hokit/config/load-config"
import { availablePresetNames } from "@hokit/config/resolve-presets"
import { resolveProjectPath } from "@hokit/filesystem/resolve-project-path"
import { logger } from "@hokit/logger"
import { emptyTemplateIndexTemplate, moduleTemplate } from "@hokit/templates"
import type { PresetName } from "@hokit/types"

import { assertPresetCliName } from "../shared/names"

export interface ModuleOptions {
    list?: boolean
}

export async function moduleHandler(
    presetName?: string,
    options: ModuleOptions = {}
) {
    const config = await loadConfig(process.cwd(), {
        allowEmptyPresets: true
    })
    const names = availablePresetNames(config) as PresetName[]

    if (options.list) {
        console.log(names.join("\n"))
        return
    }

    const selected = presetName ?? config.presets[0]

    if (!selected) {
        throw new Error("No preset is enabled in hokit.config.ts.")
    }

    if (!names.includes(selected)) {
        throw new Error(
            `Unknown preset "${selected}". Available presets: ${names.join(", ")}.`
        )
    }

    assertPresetCliName(selected)

    if (!config.presets.includes(selected)) {
        await addPresetToConfig(selected)
        config.presets.push(selected)
        logger.info(`Enabled preset "${selected}" in hokit.config.ts.`)
    }

    const directory = resolveProjectPath(process.cwd(), config.cwd, {
        allowRoot: true
    })
    const file = join(directory, `${selected}.ts`)
    const templateDirectory = resolveProjectPath(
        process.cwd(),
        `src/templates/${selected}`,
        { allowRoot: true }
    )
    const templateFile = join(templateDirectory, "index.ts")
    const template = moduleTemplate(selected)

    await mkdir(directory, { recursive: true })
    await mkdir(templateDirectory, { recursive: true })

    try {
        await writeFile(templateFile, emptyTemplateIndexTemplate(), {
            flag: "wx",
            mode: 0o644
        })
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error
    }

    try {
        await writeFile(file, template, { flag: "wx", mode: 0o644 })
        logger.success(`Created ${file}.`)
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error
        logger.success(`Updated ${file}.`)
    }
}
