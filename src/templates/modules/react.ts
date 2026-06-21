export const reactTemplate = `
import { Module, Snippet, SnippetDefinition } from "hokit"

@Module({
    target: "react"
})
export class ExampleModule {
    @Snippet({
        name: "",
        prefix: "",
        body: [
            "$0"
        ]
    })
    declare component: SnippetDefinition
}
`
