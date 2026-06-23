import type { BuildContext } from "@hokit/types"

export function createContext(): BuildContext {
    return {
        modules: [],
        presets: {}
    }
}
