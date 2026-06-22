import type { ModuleTemplateOptions } from "./language"

export function emptyModuleTemplate(options: ModuleTemplateOptions = {}) {
    const todoImport = options.todo ? ", Todo" : ""
    const todo = options.todo ? `    @Todo("Future implementation")\n` : ""

    return `import { Module, Snippet${todoImport}, type SnippetDefinition } from "hokit"

@Module({ preset: "empty" })
export class EmptyModule {
${todo}    @Snippet({
        name: "Empty example",
        prefix: "empty",
        body: ["$0"]
    })
    declare example: SnippetDefinition
}
`
}
