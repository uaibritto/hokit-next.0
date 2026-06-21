import type { PresetConfig, Scope } from "@hokit/types"

function languagePreset(name: string, scope: Scope): PresetConfig {
    return {
        output: `dist/${name}.json`,
        scopes: [scope]
    }
}

export const TsxPreset = languagePreset("tsx", "typescriptreact")
export const JsxPreset = languagePreset("jsx", "javascriptreact")
export const SwiftPreset = languagePreset("swift", "swift")
export const KotlinPreset = languagePreset("kotlin", "kotlin")
export const PythonPreset = languagePreset("python", "python")
export const PhpPreset = languagePreset("php", "php")
export const RubyPreset = languagePreset("ruby", "ruby")
export const RustPreset = languagePreset("rust", "rust")
export const ZigPreset = languagePreset("zig", "zig")
export const CPreset = languagePreset("c", "c")
export const CppPreset = languagePreset("cpp", "cpp")
export const JavascriptPreset = languagePreset("javascript", "javascript")
