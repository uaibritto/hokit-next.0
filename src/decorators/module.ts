import { modules } from "@hokit/metadata"
import type { ModuleConfig } from "@hokit/types"

export function Module(config: ModuleConfig): ClassDecorator {
    return (target) => {
        modules.set(target, config)
    }
}
