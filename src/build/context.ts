import type { BuildContext } from "@hokit/types"

/**
 * Cria o contexto compartilhado
 * entre todas as etapas do build.
 */
export function createContext(): BuildContext {
    return {
        modules: [],
        presets: {}
    }
}
