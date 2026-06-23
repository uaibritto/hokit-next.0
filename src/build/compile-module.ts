import { ValidationError } from "@hokit/errors"
import type { CompiledModule, PresetConfig, ScannedModule } from "@hokit/types"
import { validateSnippets } from "@hokit/validator"

export function compileModule(
    module: ScannedModule,
    preset: PresetConfig,
    output: string,
    options: { includeTodos?: boolean } = {}
): CompiledModule {
    const snippetProperties = new Set(
        module.snippets.map((snippet) => snippet.propertyKey)
    )
    const orphanTodo = module.todos.find(
        (todo) => !snippetProperties.has(todo.propertyKey)
    )

    if (orphanTodo) {
        const field = String(orphanTodo.propertyKey)

        throw new ValidationError(
            `@Todo on "${field}" must decorate a @Snippet.`,
            orphanTodo.location
                ? `${orphanTodo.location.file}:${orphanTodo.location.line}:${orphanTodo.location.column}`
                : `Add @Snippet to "${field}" or remove the @Todo decorator.`
        )
    }

    const snippets = module.snippets.filter(
        (item) => options.includeTodos || item.todo === undefined
    )
    const configs = snippets.map((item) => item.config)

    const validation = validateSnippets(configs)

    if (!validation.valid) {
        const firstIssue = validation.issues[0]

        if (!firstIssue) {
            throw new ValidationError("Validation failed.")
        }

        const location =
            firstIssue.snippetIndex === undefined
                ? undefined
                : snippets[firstIssue.snippetIndex]?.location
        throw new ValidationError(
            firstIssue.message,
            location
                ? `${location.file}:${location.line}:${location.column}`
                : `Check the "${firstIssue.field}" field.`
        )
    }

    const transformed = preset.transform ? preset.transform(configs) : configs

    return {
        output,
        scopes: preset.scopes,
        snippets: transformed
    }
}
