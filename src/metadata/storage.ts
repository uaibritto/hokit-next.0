import type { Constructor } from "@hokit/types"

class MetadataStorage {
    readonly modules = new Set<Constructor>()

    clear() {
        this.modules.clear()
    }
}

const STORAGE_KEY = Symbol.for("hokit:metadata-storage")
const globalStorage = globalThis as typeof globalThis & {
    [STORAGE_KEY]?: MetadataStorage
}

export const storage = (globalStorage[STORAGE_KEY] ??= new MetadataStorage())
