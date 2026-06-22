import type { BuildConfig } from "@hokit/types"

/** Helper de identidade que oferece inferência TypeScript ao usuário. */
export function defineConfig(config: BuildConfig): BuildConfig {
    return config
}
