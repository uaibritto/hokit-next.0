export const PRESETS = {
    tsx: "tsx",
    jsx: "jsx",
    swift: "swift",
    kotlin: "kotlin",
    python: "python",
    php: "php",
    ruby: "ruby",
    rust: "rust",
    zig: "zig",
    c: "c",
    cpp: "cpp",
    javascript: "javascript",
    empty: "empty"
} as const

export type Preset = (typeof PRESETS)[keyof typeof PRESETS]
export type Scope =
    | "typescript"
    | "typescriptreact"
    | "javascript"
    | "javascriptreact"
    | "swift"
    | "kotlin"
    | "python"
    | "php"
    | "ruby"
    | "rust"
    | "zig"
    | "c"
    | "cpp"
export type Target = "vscode" | "zed"
export type Constructor = Function
