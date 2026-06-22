import { PresetName } from "./core"
import { PresetConfig } from "./preset"
import { ScannedModule } from "./scanner"

export interface BuildContext {
    modules: ScannedModule[]
    presets: Partial<Record<PresetName, PresetConfig>>
}
