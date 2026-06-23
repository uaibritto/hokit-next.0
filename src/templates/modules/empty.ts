export function emptyModuleTemplate() {
    return `import { Module, Snippet, type SnippetDefinition } from "hokit"

@Module({ preset: "empty" })
export class EmptyModule {}
`
}
