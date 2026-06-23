import type { PresetName, Target } from "./core"
import type { PresetConfig } from "./preset"

export interface BuildConfig {
    cwd: string
    presets: PresetName[]
    customPresets?: Record<string, PresetConfig>
    overrides?: Partial<Record<PresetName, Partial<PresetConfig>>>
    docs?: {
        output?: string
        title?: string
    }
    target?: Target
}
