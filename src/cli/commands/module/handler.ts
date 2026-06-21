import { mkdir, writeFile } from "node:fs/promises"
import { basename, join } from "node:path"

import { loadConfig } from "@hokit/config/load-config"
import { resolveProjectPath } from "@hokit/filesystem/resolve-project-path"
import { logger } from "@hokit/logger"
import { Presets } from "@hokit/presets/registry"
import { emptyModuleTemplate, reactModuleTemplate } from "@hokit/templates"
import type { Preset } from "@hokit/types"

export async function moduleHandler(presetName?: string) {
    const names = Object.keys(Presets) as Preset[]

    if (presetName === "--list") {
        console.log(names.join("\n"))
        return
    }

    const config = await loadConfig()
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
        throw new Error(
            `Preset "${selected}" is not enabled in hokit.config.ts.`
        )
    }

    const directory = resolveProjectPath(process.cwd(), config.cwd, {
        allowRoot: true
    })
    const file = join(directory, `${selected}.ts`)
    const template =
        selected === "react" ? reactModuleTemplate() : emptyModuleTemplate()

    await mkdir(directory, { recursive: true })

    try {
        await writeFile(file, template, { flag: "wx", mode: 0o644 })
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "EEXIST") {
            throw new Error(`Module "${basename(file)}" already exists.`)
        }
        throw error
    }

    logger.success(`Created ${file}.`)
}
