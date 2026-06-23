import { access, mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { addPresetToConfig } from "@hokit/config/add-preset-to-config"
import { loadConfig } from "@hokit/config/load-config"
import { availablePresetNames } from "@hokit/config/resolve-presets"
import { resolveProjectPath } from "@hokit/filesystem/resolve-project-path"
import { writeAtomic } from "@hokit/filesystem/write-atomic"
import { logger } from "@hokit/logger"
import {
    emptyTemplateIndexTemplate,
    moduleTemplate,
    snippetBodyTemplate
} from "@hokit/templates"
import type { PresetName } from "@hokit/types"

import { assertPresetCliName, assertSnippetCliName } from "../shared/names"

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

function addTodoImport(source: string) {
    if (source.includes(" Todo,") || source.includes(", Todo")) return source

    return source.replace(
        /import \{ ([^}]+) \} from "hokit"/,
        (statement, imports: string) => {
            const parts = imports.split(",").map((part) => part.trim())
            const firstType = parts.findIndex((part) =>
                part.startsWith("type ")
            )
            const next =
                firstType === -1
                    ? [...parts, "Todo"]
                    : [
                          ...parts.slice(0, firstType),
                          "Todo",
                          ...parts.slice(firstType)
                      ]

            return `import { ${next.join(", ")} } from "hokit"`
        }
    )
}

function addSnippetToModule(
    source: string,
    preset: string,
    prefix: string,
    options: { todo?: boolean } = {}
) {
    if (new RegExp(`declare\\s+${prefix}\\s*:`).test(source)) {
        throw new Error(`Snippet "${prefix}" already exists in ${preset}.ts.`)
    }

    const next = options.todo
        ? addTodoImport(addTemplateImport(source, preset))
        : addTemplateImport(source, preset)
    const todo = options.todo ? `    @Todo("")\n` : ""
    const snippet = `${todo}    @Snippet({
        name: "",
        prefix: "${prefix}",
        body: template.${prefix},
        description: "",
        template: false
    })
    declare ${prefix}: SnippetDefinition
`
    const index = next.lastIndexOf("}")
    if (index === -1) throw new Error(`Could not update module "${preset}".`)

    return `${next.slice(0, index)}\n${snippet}${next.slice(index)}`
}

function addSnippetToTemplateIndex(source: string, prefix: string) {
    const importLine = `import { ${prefix} } from "./${prefix}"`
    let next = source.includes(importLine)
        ? source
        : `${importLine}\n\n${source}`

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
    next = next.replace(
        /((?:import [^\n]+\n)+)\n*(export const template)/,
        "$1\n$2"
    )
    return next.endsWith("\n") ? next : `${next}\n`
}

export interface SnippetOptions {
    todo?: boolean
    list?: boolean
}

export async function snippetHandler(
    presetName?: string,
    prefix?: string,
    options: SnippetOptions = {}
) {
    const config = await loadConfig(process.cwd(), {
        allowEmptyPresets: true
    })
    const names = availablePresetNames(config) as PresetName[]

    if (options.list) {
        console.log(names.join("\n"))
        return
    }

    if (!presetName) {
        throw new Error('Use "hokit snippet --<preset> <prefix>".')
    }
    if (!prefix) throw new Error("Snippet prefix is required.")

    assertPresetCliName(presetName)
    assertSnippetCliName(prefix)

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

    await mkdir(modulesDirectory, { recursive: true })
    await createFileIfMissing(modulePath, moduleTemplate(presetName))

    const module = await readFile(modulePath, "utf8")
    const nextModule = addSnippetToModule(module, presetName, prefix, options)
    const index = (await exists(templateIndexPath))
        ? await readFile(templateIndexPath, "utf8")
        : emptyTemplateIndexTemplate()
    const nextIndex = addSnippetToTemplateIndex(index, prefix)

    await mkdir(templateDirectory, { recursive: true })
    await createFileIfMissing(snippetTemplatePath, snippetBodyTemplate(prefix))
    await writeAtomic(templateIndexPath, nextIndex)
    await writeAtomic(modulePath, nextModule)

    logger.success(
        `Created ${options.todo ? "todo" : "snippet"} "${prefix}" for preset "${presetName}".`
    )
}
