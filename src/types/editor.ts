import type { CompiledModule } from "./compiler"

export interface Schema {
    serialize(module: CompiledModule): string
}
