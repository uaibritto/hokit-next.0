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
    preset: PresetConfig
): CompiledModule {
    const snippets = module.snippets.map((item) => item.config)

    /**
     * Executa todas as validações
     * declarativas registradas.
     */
    const validation = validateSnippets(snippets)

    if (!validation.valid) {
        const firstIssue = validation.issues[0]

        if (!firstIssue) {
            throw new ValidationError("Validation failed.")
        }

        throw new ValidationError(
            firstIssue.message,
            `Check the "${firstIssue.field}" field.`
        )
    }

    /**
     * Permite que o preset transforme
     * snippets antes da geração.
     */
    const transformed = preset.transform ? preset.transform(snippets) : snippets

    return {
        output: preset.output,
        scopes: preset.scopes,
        snippets: transformed
    }
}
