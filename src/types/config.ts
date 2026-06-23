import type { PresetName } from "./core"
import type { PresetConfig } from "./preset"

export type DocsConfig =
    | "on"
    | "off"
    | {
          enabled?: "on" | "off"
          output?: string
      }

export interface BuildConfig {
    cwd: string
    output: string
    presets: PresetName[]
    extend?: {
        presets?: Record<string, Partial<PresetConfig>>
    }
    docs?: DocsConfig
}
