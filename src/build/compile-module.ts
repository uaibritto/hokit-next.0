import { ValidationError } from "@hokit/errors"
import type { CompiledModule, PresetConfig, ScannedModule } from "@hokit/types"
import { validateSnippets } from "@hokit/validator"

/**
 * Responsável por transformar
 * um módulo escaneado em um
 * modelo compilado.
 *
 * Scanner
 *   ↓
 * ScannedModule
 *   ↓
 * Compiler
 *   ↓
 * CompiledModule
 */
export function compileModule(
    module: ScannedModule,
    preset: PresetConfig,
    options: { includeTodos?: boolean } = {}
): CompiledModule {
    // Um Todo órfão indica uma intenção sem definição concreta e bloqueia o build.
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

    // O build normal omite pendências; o modo preview pode incluí-las explicitamente.
    const snippets = module.snippets.filter(
        (item) => options.includeTodos || item.todo === undefined
    )
    const configs = snippets.map((item) => item.config)

    /**
     * Executa todas as validações
     * declarativas registradas.
     */
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

    /**
     * Permite que o preset transforme
     * snippets antes da geração.
     */
    const transformed = preset.transform ? preset.transform(configs) : configs

    return {
        output: preset.output,
        scopes: preset.scopes,
        snippets: transformed
    }
}
