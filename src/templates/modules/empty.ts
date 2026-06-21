export const emptyTemplate = `
import { Module, Snippet, SnippetDefinition } from "hokit"

@Module({
    target: ""
})
export class ExampleModule {
    @Snippet({
        name: "",
        prefix: "",
        body: [
            "$0"
        ]
    })
    declare snippet: SnippetDefinition
}
`
