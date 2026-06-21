import type { Schema } from "@hokit/types"

/**
 * Formato de snippets
 * utilizado pelo VSCode.
 */
export const VSCodeSchema: Schema = {
    serialize(module) {
        const output: Record<string, unknown> = {}

        for (const snippet of module.snippets) {
            output[snippet.name] = {
                prefix: snippet.prefix,
                body: snippet.body,
                description: snippet.description
            }
        }

        return JSON.stringify(output, null, 4)
    }
}
