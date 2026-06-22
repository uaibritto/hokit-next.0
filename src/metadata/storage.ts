import type { Constructor } from "@hokit/types"

class MetadataStorage {
    // Set evita registrar a mesma classe mais de uma vez no mesmo carregamento.
    readonly modules = new Set<Constructor>()
    readonly sources = new Map<Constructor, string>()

    clear() {
        this.modules.clear()
        this.sources.clear()
    }
}

const STORAGE_KEY = Symbol.for("hokit:metadata-storage")
const globalStorage = globalThis as typeof globalThis & {
    [STORAGE_KEY]?: MetadataStorage
}

// Symbol.for compartilha a instância entre o bundle público e o bundle da CLI.
export const storage = (globalStorage[STORAGE_KEY] ??= new MetadataStorage())
