import { Module, Snippet, Todo } from "@hokit/decorators"
import { SnippetDefinition } from "@hokit/types"

@Module({ preset: "react" })
class ReactModule {
    @Snippet({
        name: "React Functional Component",
        prefix: "rfc",
        body: ["$0"]
    })
    declare component: SnippetDefinition

    @Todo("Implementação futura")
    declare action: SnippetDefinition
}
