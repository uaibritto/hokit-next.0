import {
    MODULE_METADATA,
    SNIPPETS_METADATA,
    storage,
    TODOS_METADATA
} from "@hokit/metadata"
import type {
    ModuleConfig,
    RegisteredSnippet,
    RegisteredTodo,
    ScannedModule
} from "@hokit/types"
import "reflect-metadata"

export function scanModules(): ScannedModule[] {
    const modules: ScannedModule[] = []

    for (const ctor of storage.modules) {
        const moduleConfig = Reflect.getOwnMetadata(
            MODULE_METADATA,
            ctor
        ) as ModuleConfig
        const snippets = (Reflect.getOwnMetadata(SNIPPETS_METADATA, ctor) ??
            []) as RegisteredSnippet[]
        const todos = (Reflect.getOwnMetadata(TODOS_METADATA, ctor) ??
            []) as RegisteredTodo[]

        const mappedSnippets = snippets.map((snippet) => {
            const todo = todos.find(
                (item) => item.propertyKey === snippet.propertyKey
            )

            return {
                propertyKey: snippet.propertyKey,
                config: snippet.config,
                ...(todo ? { todo: todo.message } : {})
            }
        })

        modules.push({
            constructor: ctor,
            module: moduleConfig,
            snippets: mappedSnippets
        })
    }

    return modules
}
