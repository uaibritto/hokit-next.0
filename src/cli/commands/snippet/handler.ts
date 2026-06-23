import { access, mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { addPresetToConfig } from "@hokit/config/add-preset-to-config"
import { loadConfig } from "@hokit/config/load-config"
import { resolveProjectPath } from "@hokit/filesystem/resolve-project-path"
import { logger } from "@hokit/logger"
import { Presets } from "@hokit/presets/registry"
import {
    emptyTemplateIndexTemplate,
    snippetBodyTemplate
} from "@hokit/templates"
import type { PresetName } from "@hokit/types"

function assertIdentifier(value: string, label: string) {
    if (/^[A-Za-z_$][\w$]*$/.test(value)) return
    throw new Error(
        `${label} "${value}" must be a valid TypeScript identifier.`
    )
}

async function exists(path: string) {
    try {
        await access(path)
        return true
    } catch {
        return false
    }
}

async function createFileIfMissing(path: string, content: string) {
    try {
        await writeFile(path, content, { flag: "wx", mode: 0o644 })
        return true
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "EEXIST") return false
        throw error
    }
}

function addTemplateImport(source: string, preset: string) {
    const importLine = `import { template } from "@/templates/${preset}"`
    if (source.includes(importLine)) return source

    const hokitImport = source.match(/^import .* from "hokit"\n/m)
    if (!hokitImport?.index && hokitImport?.index !== 0) {
        return `${importLine}\n\n${source}`
    }

    const end = hokitImport.index + hokitImport[0].length
    return `${source.slice(0, end)}\n${importLine}\n${source.slice(end)}`
}

function addSnippetToModule(source: string, preset: string, prefix: string) {
    if (new RegExp(`declare\\s+${prefix}\\s*:`).test(source)) {
        throw new Error(`Snippet "${prefix}" already exists in ${preset}.ts.`)
    }

    const next = addTemplateImport(source, preset)
    const snippet = `    @Snippet({
        name: "${prefix}",
        prefix: "${prefix}",
        body: template.${prefix},
        template: true
    })
    declare ${prefix}: SnippetDefinition
`
    const index = next.lastIndexOf("\n}")
    if (index === -1) throw new Error(`Could not update module "${preset}".`)

    return `${next.slice(0, index)}\n${snippet}${next.slice(index)}`
}

function addSnippetToTemplateIndex(source: string, prefix: string) {
    const importLine = `import { ${prefix} } from "./${prefix}"`
    let next = source.includes(importLine) ? source : `${importLine}\n${source}`

    const object = next.match(/export const template = \{([\s\S]*?)\}/m)
    if (!object?.index && object?.index !== 0) {
        return `${next.trimEnd()}\n\nexport const template = {\n    ${prefix}\n}\n`
    }

    const templateContent = object[1] ?? ""
    if (new RegExp(`\\b${prefix}\\b`).test(templateContent)) return next

    const insertAt = object.index + object[0].lastIndexOf("}")
    const content = templateContent.trim()
    const entry = content ? `,\n    ${prefix}\n` : `\n    ${prefix}\n`

    next = `${next.slice(0, insertAt)}${entry}${next.slice(insertAt)}`
    return next.endsWith("\n") ? next : `${next}\n`
}

export async function snippetHandler(presetName?: string, prefix?: string) {
    if (!presetName) {
        throw new Error('Use "hokit snippet --<preset> <prefix>".')
    }
    if (!prefix) throw new Error("Snippet prefix is required.")

    assertIdentifier(presetName, "Preset")
    assertIdentifier(prefix, "Prefix")

    const config = await loadConfig(process.cwd(), {
        allowEmptyPresets: true
    })
    const names: PresetName[] = [
        ...Object.keys(Presets),
        ...Object.keys(config.customPresets ?? {})
    ]

    if (!names.includes(presetName)) {
        throw new Error(
            `Unknown preset "${presetName}". Available presets: ${names.join(", ")}.`
        )
    }

    if (!config.presets.includes(presetName)) {
        await addPresetToConfig(presetName)
        logger.info(`Enabled preset "${presetName}" in hokit.config.ts.`)
    }

    const modulesDirectory = resolveProjectPath(process.cwd(), config.cwd, {
        allowRoot: true
    })
    const modulePath = join(modulesDirectory, `${presetName}.ts`)
    const templateDirectory = resolveProjectPath(
        process.cwd(),
        `src/templates/${presetName}`,
        { allowRoot: true }
    )
    const templateIndexPath = join(templateDirectory, "index.ts")
    const snippetTemplatePath = join(templateDirectory, `${prefix}.ts`)

    if (!(await exists(modulePath))) {
        throw new Error(
            `Module "${presetName}.ts" was not found. Run "hokit module --${presetName}" first.`
        )
    }

    await mkdir(templateDirectory, { recursive: true })
    await createFileIfMissing(templateIndexPath, emptyTemplateIndexTemplate())
    await createFileIfMissing(snippetTemplatePath, snippetBodyTemplate(prefix))

    const index = await readFile(templateIndexPath, "utf8")
    await writeFile(templateIndexPath, addSnippetToTemplateIndex(index, prefix))

    const module = await readFile(modulePath, "utf8")
    await writeFile(
        modulePath,
        addSnippetToModule(module, presetName, prefix),
        { mode: 0o644 }
    )

    logger.success(`Created snippet "${prefix}" for preset "${presetName}".`)
}
