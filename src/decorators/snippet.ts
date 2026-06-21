import { snippets } from "@hokit/metadata"
import type { SnippetConfig } from "@hokit/types"

export function Snippet(options: SnippetConfig): PropertyDecorator {
    return (target, propertyKey) => {
        const ctor = target.constructor
        const existing = snippets.get(ctor) ?? []

        existing.push({
            propertyKey,
            options
        })

        snippets.set(ctor, existing)
    }
}
