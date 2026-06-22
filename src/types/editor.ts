import type { CompiledModule } from "./compiler"

/** Adaptador responsável por serializar um target de editor. */
export interface Schema {
    serialize(module: CompiledModule): string
}
