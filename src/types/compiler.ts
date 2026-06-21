import type { Scope } from "./core"
import type { SnippetConfig } from "./snippet"

export interface CompiledModule {
    output: string
    scopes: Scope[]
    snippets: SnippetConfig[]
}
