import type { Preset } from "@hokit/types"

type LanguagePreset = Exclude<Preset, "empty">

interface LanguageTemplateConfig {
    acronym: string
    className: string
}

const Languages: Record<LanguagePreset, LanguageTemplateConfig> = {
    tsx: { acronym: "tsx", className: "TsxModule" },
    jsx: { acronym: "jsx", className: "JsxModule" },
    swift: { acronym: "swift", className: "SwiftModule" },
    kotlin: { acronym: "kt", className: "KotlinModule" },
    python: { acronym: "py", className: "PythonModule" },
    php: { acronym: "php", className: "PhpModule" },
    ruby: { acronym: "rb", className: "RubyModule" },
    rust: { acronym: "rs", className: "RustModule" },
    zig: { acronym: "zig", className: "ZigModule" },
    c: { acronym: "c", className: "CModule" },
    cpp: { acronym: "cpp", className: "CppModule" },
    javascript: { acronym: "js", className: "JavascriptModule" },
    typescript: { acronym: "ts", className: "TypescriptModule" },
    java: { acronym: "jav", className: "JavaModule" },
    csharp: { acronym: "cs", className: "CsharpModule" },
    go: { acronym: "go", className: "GoModule" },
    json: { acronym: "json", className: "JsonModule" },
    shellscript: { acronym: "sh", className: "ShellModule" },
    dart: { acronym: "dart", className: "DartModule" },
    html: { acronym: "html", className: "HtmlModule" },
    julia: { acronym: "jl", className: "JuliaModule" },
    lua: { acronym: "lua", className: "LuaModule" },
    perl: { acronym: "pl", className: "PerlModule" }
}

export function languageSnippetKey(preset: LanguagePreset) {
    return Languages[preset].acronym
}

export function languageModuleTemplate(preset: LanguagePreset) {
    const language = Languages[preset]

    return `import { Module, Snippet, type SnippetDefinition } from "hokit"

@Module({ preset: "${preset}" })
export class ${language.className} {}
`
}
