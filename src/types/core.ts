export const PRESETS = {
    typescript: "typescript",
    tsx: "tsx",
    javascript: "javascript",
    jsx: "jsx",
    swift: "swift",
    kotlin: "kotlin",
    python: "python",
    java: "java",
    csharp: "csharp",
    php: "php",
    ruby: "ruby",
    rust: "rust",
    zig: "zig",
    c: "c",
    cpp: "cpp",
    dart: "dart",
    go: "go",
    html: "html",
    json: "json",
    julia: "julia",
    lua: "lua",
    perl: "perl",
    shellscript: "shellscript"
} as const

export type Preset = (typeof PRESETS)[keyof typeof PRESETS]
export type PresetName = Preset | (string & {})
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
    | (string & {})
export type Target = "vscode" | "zed"
export type Constructor = Function
