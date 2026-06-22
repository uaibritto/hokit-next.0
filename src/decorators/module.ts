import { MODULE_METADATA, storage } from "@hokit/metadata"
import type { ModuleConfig } from "@hokit/types"
import "reflect-metadata"

export function Module(config: ModuleConfig): ClassDecorator {
    return (target) => {
        // A classe é registrada sem ser instanciada; decorators já carregam os dados.
        Reflect.defineMetadata(MODULE_METADATA, config, target)

        storage.modules.add(target)
    }
}
