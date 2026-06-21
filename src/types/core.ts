export const PRESETS = {
    react: "react",
    empty: "empty"
} as const

export type Preset = (typeof PRESETS)[keyof typeof PRESETS]
export type Scope = "typescript" | "typescriptreact" | "javascriptreact"
export type Target = "vscode" | "zed"
export type Constructor = Function
