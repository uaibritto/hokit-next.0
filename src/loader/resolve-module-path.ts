import { pathToFileURL } from "node:url"

/**
 * Converte:
 *
 * src/modules/react.ts
 *
 * para:
 *
 * file:///...
 */
export function resolveModulePath(file: string) {
    return pathToFileURL(file).href
}
