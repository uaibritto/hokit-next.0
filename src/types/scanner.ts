import type { RegisteredTodo, SourceLocation } from "./metadata"
import type { ModuleConfig } from "./module"
import type { SnippetConfig } from "./snippet"

/** Representação intermediária após leitura da metadata. */
export interface ScannedSnippet {
    propertyKey: string | symbol
    config: SnippetConfig
    todo?: string
    location?: SourceLocation
}

export interface ScannedTodo extends RegisteredTodo {
    location?: SourceLocation
}

/** Módulo pronto para lint, documentação e build. */
export interface ScannedModule {
    constructor: Function
    module: ModuleConfig
    snippets: ScannedSnippet[]
    todos: ScannedTodo[]
}
