import { PRESETS, type PresetName } from "@hokit/types"

import { customModuleTemplate } from "./custom"
import { emptyModuleTemplate } from "./empty"
import {
    languageModuleTemplate,
    languageSnippetKey,
    type ModuleTemplateOptions
} from "./language"

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

export function moduleTemplateKey(preset: PresetName) {
    if (preset === "empty") return "empty"
    if (preset in PRESETS) {
        return languageSnippetKey(
            preset as Exclude<keyof typeof PRESETS, "empty">
        )
    }
    return preset.replaceAll(/[^a-zA-Z0-9_$]/g, "_")
}
