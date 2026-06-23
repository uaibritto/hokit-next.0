import { CONFIGS } from "@hokit/presets"
import type { Preset, PresetConfig } from "@hokit/types"

export const Presets: Record<Preset, PresetConfig> = {
    tsx: CONFIGS.typescriptreact,
    jsx: CONFIGS.javascriptreact,
    swift: CONFIGS.swift,
    kotlin: CONFIGS.kotlin,
    python: CONFIGS.python,
    php: CONFIGS.php,
    ruby: CONFIGS.ruby,
    rust: CONFIGS.rust,
    zig: CONFIGS.zig,
    c: CONFIGS.c,
    cpp: CONFIGS.cpp,
    javascript: CONFIGS.javascript,
    empty: CONFIGS.empty,
    csharp: CONFIGS.csharp,
    dart: CONFIGS.dart,
    go: CONFIGS.go,
    html: CONFIGS.html,
    java: CONFIGS.java,
    json: CONFIGS.json,
    julia: CONFIGS.julia,
    lua: CONFIGS.lua,
    perl: CONFIGS.perl,
    shellscript: CONFIGS.shellscript,
    typescript: CONFIGS.typescript
} satisfies Record<Preset, PresetConfig>
