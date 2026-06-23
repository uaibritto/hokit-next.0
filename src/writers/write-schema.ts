import { mkdir } from "node:fs/promises"
import { dirname } from "node:path"

import { resolveProjectPath } from "@hokit/filesystem/resolve-project-path"
import { writeAtomic } from "@hokit/filesystem/write-atomic"
import type { CompiledModule, Schema } from "@hokit/types"

export async function writeSchema(
    module: CompiledModule,
    schema: Schema,
    root = process.cwd()
) {
    const content = schema.serialize(module)
    const output = resolveProjectPath(root, module.output)

    await mkdir(dirname(output), {
        recursive: true
    })

    await writeAtomic(output, `${content}\n`)

    return output
}
