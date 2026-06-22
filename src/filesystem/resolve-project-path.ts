import { isAbsolute, relative, resolve, sep } from "node:path"

import { ConfigError } from "@hokit/errors"

export interface ResolveProjectPathOptions {
    allowRoot?: boolean
}

export function resolveProjectPath(
    root: string,
    candidate: string,
    options: ResolveProjectPathOptions = {}
) {
    // `relative` revela caminhos externos e tentativas de escapar usando `..`.
    const projectRoot = resolve(root)
    const path = isAbsolute(candidate)
        ? resolve(candidate)
        : resolve(root, candidate)
    const relation = relative(projectRoot, path)

    if (
        (relation === "" && !options.allowRoot) ||
        relation === ".." ||
        relation.startsWith(`..${sep}`) ||
        isAbsolute(relation)
    ) {
        throw new ConfigError(
            `Unsafe path "${candidate}".`,
            "Generated paths must stay inside the project directory."
        )
    }

    return path
}
