import type { SnippetConfig } from "./snippet"

export interface RegisteredSnippet {
    propertyKey: string | symbol
    config: SnippetConfig
}

export interface RegisteredTodo {
    propertyKey: string | symbol
    message: string
}
