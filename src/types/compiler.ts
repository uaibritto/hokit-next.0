import type { Scope } from "./core"
import type { SnippetConfig } from "./snippet"

/** Resultado neutro que um schema transforma no formato final. */
export interface CompiledModule {
    output: string
    scopes: Scope[]
    snippets: SnippetConfig[]
}
