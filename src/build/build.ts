import { compileModule } from "@hokit/build/compile-module"
import { resolvePresets } from "@hokit/config/resolve-presets"
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
    /**
     * Carrega módulos.
     */
    storage.clear()
    await loadModules(resolveProjectPath(root, config.cwd, { allowRoot: true }))

    /**
     * Resolve presets.
     */
    const presets = resolvePresets(config)
    const schema = Schemas[config.target ?? "vscode"]

    if (!schema) {
        throw new Error(`Schema "${config.target}" not found.`)
    }

    /**
     * Escaneia metadata.
     */
    const modules = scanModules()

    /**
     * Compila módulos.
     */
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
        const compiled = compileModule(combined, preset, options)
        resolveOutputPath(root, config.cwd, compiled.output)
        outputs.push(await writeSchema(compiled, schema, root))
    }

    return { modules: modules.length, outputs }
}
