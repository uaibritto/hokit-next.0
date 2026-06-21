import type { Schema } from "@hokit/types"

/**
 * Placeholder.
 *
 * Futuramente será adaptado
 * ao formato oficial do Zed.
 */
export const ZedSchema: Schema = {
    serialize(module) {
        return JSON.stringify(module.snippets, null, 4)
    }
}
