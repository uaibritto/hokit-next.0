import { PresetError } from "@hokit/errors"
import { Presets } from "@hokit/presets/registry"
import type { BuildConfig, PresetConfig, PresetName } from "@hokit/types"

export function availablePresetNames(config: Pick<BuildConfig, "extend">) {
    return [
        ...Object.keys(Presets),
        ...Object.keys(config.extend?.presets ?? {})
    ]
}

export function resolvePresets(config: BuildConfig) {
    const resolved: Partial<Record<PresetName, PresetConfig>> = {}

    for (const preset of config.presets) {
        const base = Presets[preset as keyof typeof Presets]
        const extension = config.extend?.presets?.[preset]

        if (!base && !extension) {
            throw new PresetError(
                `Preset "${preset}" not found.`,
                `Available presets: ${availablePresetNames(config).join(", ")}.`
            )
        }

        const value = {
            ...base,
            ...extension
        }

        if (!Array.isArray(value.scopes) || value.scopes.length === 0) {
            throw new PresetError(
                `Preset "${preset}" must define at least one scope.`
            )
        }

        resolved[preset] = value as PresetConfig
    }

    return resolved
}
