import { readFileSync } from "node:fs"

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
import ts from "typescript"
import "reflect-metadata"

export function scanModules(): ScannedModule[] {
    const modules: ScannedModule[] = []

    for (const ctor of storage.modules) {
        // Decorators conhecem classe e propriedade, mas não arquivo/linha.
        // A AST original completa essa informação para diagnósticos e documentação.
        const sourcePath = storage.sources.get(ctor)
        const locations = new Map<
            string,
            import("@hokit/types").SourceLocation
        >()

        if (sourcePath) {
            const sourceText = readFileSync(sourcePath, "utf8")
            const sourceFile = ts.createSourceFile(
                sourcePath,
                sourceText,
                ts.ScriptTarget.Latest,
                true,
                ts.ScriptKind.TS
            )
            const declaration = sourceFile.statements.find(
                (statement): statement is ts.ClassDeclaration =>
                    ts.isClassDeclaration(statement) &&
                    statement.name?.text === ctor.name
            )

            for (const member of declaration?.members ?? []) {
                if (!ts.isPropertyDeclaration(member)) continue
                const point = sourceFile.getLineAndCharacterOfPosition(
                    member.getStart(sourceFile)
                )
                locations.set(member.name.getText(sourceFile), {
                    file: sourcePath,
                    line: point.line + 1,
                    column: point.character + 1
                })
            }
        }
        const moduleConfig = Reflect.getOwnMetadata(
            MODULE_METADATA,
            ctor
        ) as ModuleConfig
        const snippets = (Reflect.getOwnMetadata(SNIPPETS_METADATA, ctor) ??
            []) as RegisteredSnippet[]
        const todos = (Reflect.getOwnMetadata(TODOS_METADATA, ctor) ??
            []) as RegisteredTodo[]

        const mappedSnippets = snippets.map((snippet) => {
            // Todo e Snippet se relacionam pela mesma chave de propriedade.
            const todo = todos.find(
                (item) => item.propertyKey === snippet.propertyKey
            )
            const location = locations.get(String(snippet.propertyKey))

            return {
                propertyKey: snippet.propertyKey,
                config: snippet.config,
                ...(todo ? { todo: todo.message } : {}),
                ...(location ? { location } : {})
            }
        })

        const mappedTodos = todos.map((todo) => {
            const location = locations.get(String(todo.propertyKey))
            return { ...todo, ...(location ? { location } : {}) }
        })

        modules.push({
            constructor: ctor,
            module: moduleConfig,
            snippets: mappedSnippets,
            todos: mappedTodos
        })
    }

    return modules
}
