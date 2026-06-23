import { pathToFileURL } from "node:url"

export function resolveModulePath(file: string) {
    return pathToFileURL(file).href
}
