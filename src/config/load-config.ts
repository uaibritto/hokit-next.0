import { access } from "node:fs/promises"
import { resolve } from "node:path"

import { ConfigError } from "@hokit/errors"
import type { BuildConfig } from "@hokit/types"
import { tsImport } from "tsx/esm/api"

/**
 * Carrega:
 *
 * hokit.config.ts
 */
export interface LoadConfigOptions {
    allowEmptyPresets?: boolean
}

export async function loadConfig(
    root = process.cwd(),
    options: LoadConfigOptions = {}
): Promise<BuildConfig> {
    const path = resolve(root, "hokit.config.ts")

    try {
        await access(path)
    } catch (cause) {
        throw new ConfigError(
            "Could not find hokit.config.ts.",
            'Run "hokit init" to create a project.',
            cause
        )
    }

    let loaded: { default?: unknown }

    try {
        loaded = (await tsImport(path, import.meta.url)) as {
            default?: unknown
        }
    } catch (cause) {
        throw new ConfigError(
            "Could not load hokit.config.ts.",
            undefined,
            cause
        )
    }

    const config = loaded.default

    if (!config || typeof config !== "object") {
        throw new ConfigError("hokit.config.ts must export a default config.")
    }

    const value = config as Partial<BuildConfig>

    if (typeof value.cwd !== "string" || value.cwd.trim().length === 0) {
        throw new ConfigError('The config field "cwd" must be a directory.')
    }

    if (!Array.isArray(value.presets)) {
        throw new ConfigError('The config field "presets" must be an array.')
    }

    if (value.presets.length === 0 && !options.allowEmptyPresets) {
        throw new ConfigError('The config field "presets" cannot be empty.')
    }

    return value as BuildConfig
}
