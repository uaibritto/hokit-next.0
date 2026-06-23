import type { SnippetConfig } from "./snippet"

export interface SourceLocation {
    file: string
    line: number
    column: number
}

export interface RegisteredSnippet {
    propertyKey: string | symbol
    config: SnippetConfig
}

export interface RegisteredTodo {
    propertyKey: string | symbol
    message: string
}
