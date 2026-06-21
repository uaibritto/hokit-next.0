import type { Preset, Target } from "./core"
import type { PresetConfig } from "./preset"

export interface BuildConfig {
    cwd: string
    presets: Preset[]
    overrides?: Partial<Record<Preset, Partial<PresetConfig>>>
    target?: Target
}
