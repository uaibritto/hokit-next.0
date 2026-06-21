export const Preset = {
    react: "react",
    node: "node",
    vue: "vue",
    empty: "empty"
} as const

export type Preset = (typeof Preset)[keyof typeof Preset]
export type Scope = "typescriptreact" | "javascriptreact" | "typescript"
export type Target = "vscode" | "zed"
export type SnippetDefinition = SnippetConfig

export interface SnippetConfig {
    name: string
    prefix: string
    body: string[]
    description?: string
    template?: boolean
}

export interface PresetConfig {
    output: string
    scopes: Scope[]
    tags?: string[]
    // recebe os snippets do módulo e pode transformá-los antes de gerar o arquivo
    transform?: (snippets: SnippetConfig[]) => SnippetConfig[]
}

export interface BuildConfig {
    cwd: string
    presets: Preset[] | Partial<Record<Preset, PresetConfig>>
    target?: Target
}

export interface ModuleConfig {
    preset: Preset
}
