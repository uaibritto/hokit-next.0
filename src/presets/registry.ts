import {
    CPreset,
    CppPreset,
    EmptyPreset,
    JavascriptPreset,
    JsxPreset,
    KotlinPreset,
    PhpPreset,
    PythonPreset,
    RubyPreset,
    RustPreset,
    SwiftPreset,
    TsxPreset,
    ZigPreset
} from "@hokit/presets"
import type { Preset, PresetConfig } from "@hokit/types"

export const Presets = {
    tsx: TsxPreset,
    jsx: JsxPreset,
    swift: SwiftPreset,
    kotlin: KotlinPreset,
    python: PythonPreset,
    php: PhpPreset,
    ruby: RubyPreset,
    rust: RustPreset,
    zig: ZigPreset,
    c: CPreset,
    cpp: CppPreset,
    javascript: JavascriptPreset,
    empty: EmptyPreset
} satisfies Record<Preset, PresetConfig>
