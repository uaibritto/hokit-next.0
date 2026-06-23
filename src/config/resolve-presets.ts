import { PresetError } from "@hokit/errors"
import { Presets } from "@hokit/presets/registry"
import type { BuildConfig, PresetConfig, PresetName } from "@hokit/types"

export function resolvePresets(config: BuildConfig) {
    const resolved: Partial<Record<PresetName, PresetConfig>> = {}

    for (const preset of config.presets) {
        const base =
            Presets[preset as keyof typeof Presets] ??
            config.customPresets?.[preset]
        const override = config.overrides?.[preset]

        if (!base) {
            throw new PresetError(
                `Preset "${preset}" not found.`,
                `Available presets: ${[
                    ...Object.keys(Presets),
                    ...Object.keys(config.customPresets ?? {})
                ].join(", ")}.`
            )
        }

        resolved[preset] = {
            ...base,
            ...override
        }
    }

    return resolved
}
