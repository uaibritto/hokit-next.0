export interface SnippetConfig {
    name: string
    prefix: string
    body: string[]
    description?: string
    template?: boolean
}

export type SnippetDefinition = SnippetConfig
