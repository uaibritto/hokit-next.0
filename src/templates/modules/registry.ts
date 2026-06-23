import { PRESETS, type PresetName } from "@hokit/types"

import { customModuleTemplate } from "./custom"
import { languageModuleTemplate, languageSnippetKey } from "./language"

export function moduleTemplate(preset: PresetName) {
    if (preset in PRESETS) {
        return languageModuleTemplate(preset as keyof typeof PRESETS)
    }
    return customModuleTemplate(preset)
}

export function moduleTemplateKey(preset: PresetName) {
    if (preset in PRESETS) {
        return languageSnippetKey(preset as keyof typeof PRESETS)
    }
    return preset.replaceAll(/[^a-zA-Z0-9_$]/g, "_")
}
