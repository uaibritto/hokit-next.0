import { SNIPPETS_METADATA } from "@hokit/metadata"
import type { SnippetConfig } from "@hokit/types"
import "reflect-metadata"

interface RegisteredSnippet {
    propertyKey: string | symbol
    config: SnippetConfig
}

export function Snippet(config: SnippetConfig): PropertyDecorator {
    return (target, propertyKey) => {
        // getOwnMetadata evita herdar e modificar arrays de uma classe-base.
        const ctor = target.constructor
        const snippets = Reflect.getOwnMetadata(SNIPPETS_METADATA, ctor) ?? []

        snippets.push({
            propertyKey,
            config
        } satisfies RegisteredSnippet)

        Reflect.defineMetadata(SNIPPETS_METADATA, snippets, ctor)
    }
}
