import type { Scope } from "./core"
import type { SnippetConfig } from "./snippet"

/** Define destino, escopos e transformação opcional de um preset. */
export interface PresetConfig {
    output: string
    scopes: Scope[]
    tags?: string[]
    transform?(snippets: SnippetConfig[]): SnippetConfig[]
}
