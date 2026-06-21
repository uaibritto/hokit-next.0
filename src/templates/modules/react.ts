export function reactModuleTemplate() {
    return `import { Module, Snippet, Todo, type SnippetDefinition } from "hokit"

@Module({ preset: "react" })
export class ReactModule {
    @Snippet({
        name: "React component",
        prefix: "rfc",
        body: ["export function \${1:Component}() {", "    return <div>$0</div>", "}"]
    })
    declare component: SnippetDefinition

    @Todo("Implementação futura")
    declare rfc: SnippetDefinition
}
`
}
