import { PresetError } from "@hokit/errors"
import { Presets } from "@hokit/presets/registry"
import type { BuildConfig, Preset, PresetConfig } from "@hokit/types"

/**
 * Resolve presets padrão
 * + overrides do usuário.
 */
export function resolvePresets(config: BuildConfig) {
    const resolved: Partial<Record<Preset, PresetConfig>> = {}

    for (const preset of config.presets) {
        const base = Presets[preset]
        const override = config.overrides?.[preset]

        if (!base) {
            throw new PresetError(
                `Preset "${preset}" not found.`,
                `Available presets: ${Object.keys(Presets).join(", ")}.`
            )
        }

        resolved[preset] = {
            ...base,
            ...override
        }
    }

    return resolved
}
