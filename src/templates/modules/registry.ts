import { PRESETS, type PresetName } from "@hokit/types"

import { customModuleTemplate } from "./custom"
import { emptyModuleTemplate } from "./empty"
import { languageModuleTemplate, type ModuleTemplateOptions } from "./language"

/** Seleciona template oficial, vazio ou personalizado. */
export function moduleTemplate(
    preset: PresetName,
    options: ModuleTemplateOptions = {}
) {
    if (preset === "empty") return emptyModuleTemplate(options)
    if (preset in PRESETS) {
        return languageModuleTemplate(
            preset as Exclude<keyof typeof PRESETS, "empty">,
            options
        )
    }
    return customModuleTemplate(preset, options)
}
