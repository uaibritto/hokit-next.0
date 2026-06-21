import { isAbsolute, relative, sep } from "node:path"

import { ConfigError } from "@hokit/errors"

import { resolveProjectPath } from "./resolve-project-path"

export function resolveOutputPath(
    root: string,
    modulesDirectory: string,
    output: string
) {
    const path = resolveProjectPath(root, output)
    const modules = resolveProjectPath(root, modulesDirectory, {
        allowRoot: true
    })
    const relation = relative(modules, path)
    const insideModules =
        relation === "" ||
        (!isAbsolute(relation) &&
            relation !== ".." &&
            !relation.startsWith(`..${sep}`))

    if (insideModules) {
        throw new ConfigError(
            `Unsafe output path "${output}".`,
            "Generated files cannot be written inside the modules directory."
        )
    }

    return path
}
