import { randomUUID } from "node:crypto"
import { rename, rm, writeFile } from "node:fs/promises"

export async function writeAtomic(path: string, content: string, mode = 0o644) {
    const temporary = `${path}.${randomUUID()}.tmp`

    try {
        await writeFile(temporary, content, { flag: "wx", mode })
        await rename(temporary, path)
    } catch (error) {
        await rm(temporary, { force: true })
        throw error
    }
}
