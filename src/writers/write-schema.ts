import { randomUUID } from "node:crypto"
import { mkdir, rename, rm, writeFile } from "node:fs/promises"
import { dirname } from "node:path"

import { resolveProjectPath } from "@hokit/filesystem/resolve-project-path"
import type { CompiledModule, Schema } from "@hokit/types"

/**
 * Recebe um schema
 * e grava o resultado.
 */
export async function writeSchema(
    module: CompiledModule,
    schema: Schema,
    root = process.cwd()
) {
    const content = schema.serialize(module)
    const output = resolveProjectPath(root, module.output)
    const temporary = `${output}.${randomUUID()}.tmp`

    await mkdir(dirname(output), {
        recursive: true
    })

    try {
        // Rename no mesmo diretório troca o arquivo final de maneira atômica.
        await writeFile(temporary, `${content}\n`, {
            flag: "wx",
            mode: 0o600
        })
        await rename(temporary, output)
    } catch (error) {
        await rm(temporary, { force: true })
        throw error
    }

    return output
}
