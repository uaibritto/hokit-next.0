import type { PresetName } from "./core"

/** Configuração mínima armazenada pelo decorator `@Module`. */
export interface ModuleConfig {
    preset: PresetName
}
