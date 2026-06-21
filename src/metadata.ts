import { ModuleConfig, SnippetConfig } from "@hokit/types"

export const modules = new Map<Function, ModuleConfig>()
export const snippets = new Map<
    Function,
    Array<{
        propertyKey: string | symbol
        options: SnippetConfig
    }>
>()
export const todos = new Map<Function, Map<string | symbol, string>>()
