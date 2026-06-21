import type { Preset } from "@hokit/types"

import { emptyModuleTemplate } from "./empty"
import { languageModuleTemplate, type ModuleTemplateOptions } from "./language"

export function moduleTemplate(
    preset: Preset,
    options: ModuleTemplateOptions = {}
) {
    return preset === "empty"
        ? emptyModuleTemplate(options)
        : languageModuleTemplate(preset, options)
}
