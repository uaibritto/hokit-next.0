import { PRESETS, type PresetName } from "@hokit/types"

import { customModuleTemplate } from "./custom"
import { emptyModuleTemplate } from "./empty"
import { languageModuleTemplate, languageSnippetKey } from "./language"

export function moduleTemplate(preset: PresetName) {
    if (preset === "empty") return emptyModuleTemplate()
    if (preset in PRESETS) {
        return languageModuleTemplate(
            preset as Exclude<keyof typeof PRESETS, "empty">
        )
    }
    return customModuleTemplate(preset)
}

export function moduleTemplateKey(preset: PresetName) {
    if (preset === "empty") return "empty"
    if (preset in PRESETS) {
        return languageSnippetKey(
            preset as Exclude<keyof typeof PRESETS, "empty">
        )
    }
    return preset.replaceAll(/[^a-zA-Z0-9_$]/g, "_")
}
