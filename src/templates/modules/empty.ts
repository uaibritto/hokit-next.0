export function emptyModuleTemplate() {
    return `import { Module, Snippet, Todo, type SnippetDefinition } from "hokit"

@Module({ preset: "empty" })
export class EmptyModule {
    @Snippet({
        name: "Empty example",
        prefix: "empty",
        body: ["$0"]
    })
    declare example: SnippetDefinition

    @Todo("Implementação futura")
    declare todo: SnippetDefinition
}
`
}
