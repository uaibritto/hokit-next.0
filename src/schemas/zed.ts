import type { Schema } from "@hokit/types"

export const ZedSchema: Schema = {
    serialize(module) {
        return JSON.stringify(module.snippets, null, 4)
    }
}
