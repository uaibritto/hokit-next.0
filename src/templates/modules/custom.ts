export function customModuleTemplate(preset: string) {
    const words = preset.split(/[^a-zA-Z0-9]+/).filter(Boolean)
    const className = `${words.map((word) => word[0]?.toUpperCase() + word.slice(1)).join("")}Module`

    return `import { Module, Snippet, type SnippetDefinition } from "hokit"

@Module({ preset: "${preset}" })
export class ${className} {}
`
}
