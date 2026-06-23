import type { PresetConfig, Scope } from "@hokit/types"

function languagePreset(scope: Scope): PresetConfig {
    return {
        scopes: [scope]
    }
}

export const TsxPreset = languagePreset("typescriptreact")
export const JsxPreset = languagePreset("javascriptreact")
export const SwiftPreset = languagePreset("swift")
export const KotlinPreset = languagePreset("kotlin")
export const PythonPreset = languagePreset("python")
export const PhpPreset = languagePreset("php")
export const RubyPreset = languagePreset("ruby")
export const RustPreset = languagePreset("rust")
export const ZigPreset = languagePreset("zig")
export const CPreset = languagePreset("c")
export const CppPreset = languagePreset("cpp")
export const JavascriptPreset = languagePreset("javascript")
