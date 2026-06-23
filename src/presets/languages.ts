import type { PresetConfig, Scope } from "@hokit/types"

function languagePreset(scope: Scope): PresetConfig {
    return {
        scopes: [scope]
    }
}

export const CONFIGS = {
    typescriptreact: languagePreset("typescriptreact"),
    typescript: languagePreset("typescript"),
    javascriptreact: languagePreset("javascriptreact"),
    javascript: languagePreset("javascript"),
    swift: languagePreset("swift"),
    kotlin: languagePreset("kotlin"),
    python: languagePreset("python"),
    java: languagePreset("java"),
    csharp: languagePreset("csharp"),
    php: languagePreset("php"),
    ruby: languagePreset("ruby"),
    rust: languagePreset("rust"),
    zig: languagePreset("zig"),
    c: languagePreset("c"),
    cpp: languagePreset("cpp"),
    dart: languagePreset("dart"),
    go: languagePreset("go"),
    html: languagePreset("html"),
    json: languagePreset("json"),
    julia: languagePreset("julia"),
    lua: languagePreset("lua"),
    perl: languagePreset("perl"),
    shellscript: languagePreset("shell")
}
