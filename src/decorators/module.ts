import { MODULE_METADATA, storage } from "@hokit/metadata"
import type { ModuleConfig } from "@hokit/types"
import "reflect-metadata"

export function Module(config: ModuleConfig): ClassDecorator {
    return (target) => {
        Reflect.defineMetadata(MODULE_METADATA, config, target)

        storage.modules.add(target)
    }
}
