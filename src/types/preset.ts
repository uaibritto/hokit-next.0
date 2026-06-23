import type { Scope } from "./core"
import type { SnippetConfig } from "./snippet"

export interface PresetConfig {
    output: string
    scopes: Scope[]
    tags?: string[]
    transform?(snippets: SnippetConfig[]): SnippetConfig[]
}
