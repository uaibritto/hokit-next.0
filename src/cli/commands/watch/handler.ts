import { loadConfig } from "@hokit/config/load-config"
import { watchProject } from "@hokit/watch/watch-project"

export async function watchHandler() {
    const config = await loadConfig()

    await watchProject(config)
}
