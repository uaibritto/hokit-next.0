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
                scope: module.scopes.join(","),
                description: snippet.description ?? snippet.name,
                isFileTemplate: snippet.template ?? false
            }
        }

        return JSON.stringify(output, null, 4)
    }
}
