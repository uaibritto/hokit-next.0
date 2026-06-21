import type { ModuleConfig } from "./module"
import type { SnippetConfig } from "./snippet"

export interface ScannedSnippet {
    propertyKey: string | symbol
    config: SnippetConfig
    todo?: string
}

export interface ScannedModule {
    constructor: Function
    module: ModuleConfig
    snippets: ScannedSnippet[]
}
