import { join } from "node:path"

import { compileModule } from "@hokit/build/compile-module"
import { resolvePresets } from "@hokit/config/resolve-presets"
import { generateDocs } from "@hokit/docs/generate-docs"
import { resolveOutputPath } from "@hokit/filesystem/resolve-output-path"
import { resolveProjectPath } from "@hokit/filesystem/resolve-project-path"
import { loadModules } from "@hokit/loader/load-modules"
import { storage } from "@hokit/metadata"
import { scanModules } from "@hokit/scanner/scan-modules"
import { Schemas } from "@hokit/schemas/registry"
import type { BuildConfig, ScannedModule } from "@hokit/types"
import { writeSchema } from "@hokit/writers/write-schema"

export interface BuildOptions {
    includeTodos?: boolean
}

export async function build(
    config: BuildConfig,
    root = process.cwd(),
    options: BuildOptions = {}
) {
    storage.clear()
    await loadModules(resolveProjectPath(root, config.cwd, { allowRoot: true }))

    const presets = resolvePresets(config)
    const schema = Schemas.vscode

    if (!schema) {
        throw new Error('Schema "vscode" not found.')
    }

    const modules = scanModules()

    const grouped = new Map<string, ScannedModule[]>()

    for (const module of modules) {
        const entries = grouped.get(module.module.preset) ?? []
        entries.push(module)
        grouped.set(module.module.preset, entries)
    }

    const outputs: string[] = []

    for (const [presetName, entries] of grouped) {
        const first = entries[0]
        if (!first) continue

        const preset = presets[presetName as keyof typeof presets]

        if (!preset) {
            throw new Error(`Preset "${presetName}" not found.`)
        }

        const combined: ScannedModule = {
            constructor: first.constructor,
            module: first.module,
            snippets: entries.flatMap((entry) => entry.snippets),
            todos: entries.flatMap((entry) => entry.todos)
        }
        const output = join(config.output, `${presetName}.json`)
        const compiled = compileModule(combined, preset, output, options)
        resolveOutputPath(root, config.cwd, compiled.output)
        outputs.push(await writeSchema(compiled, schema, root))
    }

    if (
        config.docs === "on" ||
        (typeof config.docs === "object" && config.docs.enabled === "on")
    ) {
        await generateDocs(config, root)
    }

    return { modules: modules.length, outputs }
}
