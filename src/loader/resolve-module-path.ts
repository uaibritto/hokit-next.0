import { pathToFileURL } from "node:url"

/**
 * Converte:
 *
 * src/modules/tsx.ts
 *
 * para:
 *
 * file:///...
 */
export function resolveModulePath(file: string) {
    return pathToFileURL(file).href
}
