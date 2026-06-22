import type { ModuleTemplateOptions } from "./language"

/** Cria um módulo mínimo para presets definidos pelo próprio projeto. */
export function customModuleTemplate(
    preset: string,
    options: ModuleTemplateOptions = {}
) {
    const words = preset.split(/[^a-zA-Z0-9]+/).filter(Boolean)
    const className = `${words.map((word) => word[0]?.toUpperCase() + word.slice(1)).join("")}Module`
    const property = preset.replaceAll(/[^a-zA-Z0-9_$]/g, "_")
    const todoImport = options.todo ? ", Todo" : ""
    const todo = options.todo ? `    @Todo("Future implementation")\n` : ""

    return `import { Module, Snippet${todoImport}, type SnippetDefinition } from "hokit"

@Module({ preset: "${preset}" })
export class ${className} {
${todo}    @Snippet({
        name: "${preset}",
        prefix: "${preset}",
        body: ["$0"]
    })
    declare ${property}: SnippetDefinition
}
`
}
