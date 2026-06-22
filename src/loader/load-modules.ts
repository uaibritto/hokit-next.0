import { randomUUID } from "node:crypto"
import { readFile, rm, writeFile } from "node:fs/promises"
import { basename, dirname, join } from "node:path"

import { storage } from "@hokit/metadata"
import { glob } from "tinyglobby"
import { tsImport } from "tsx/esm/api"
import ts from "typescript"

import { resolveModulePath } from "./resolve-module-path"

/**
 * Procura todos os módulos
 * e os importa dinamicamente.
 *
 * Ao importar:
 *
 * Decorators executam.
 */
export async function loadModules(cwd: string) {
    const files = await glob("**/*.ts", {
        cwd,
        absolute: true
    })

    for (const file of files) {
        // Guardamos o estado anterior para descobrir quais classes vieram deste arquivo.
        const knownModules = new Set(storage.modules)
        const source = await readFile(file, "utf8")
        const transpiled = ts.transpileModule(source, {
            // O compilador oficial aceita decorators em propriedades `declare`.
            fileName: file,
            compilerOptions: {
                target: ts.ScriptTarget.ES2022,
                module: ts.ModuleKind.ESNext,
                experimentalDecorators: true,
                inlineSourceMap: true,
                inlineSources: true
            },
            reportDiagnostics: true
        })
        const error = transpiled.diagnostics?.find(
            (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
        )

        if (error) {
            throw new SyntaxError(
                `${basename(file)}: ${ts.flattenDiagnosticMessageText(error.messageText, "\n")}`
            )
        }

        const temporary = join(
            dirname(file),
            `.hokit-${basename(file, ".ts")}-${randomUUID()}.ts`
        )

        try {
            // O arquivo temporário fica ao lado do original para preservar imports relativos.
            await writeFile(temporary, transpiled.outputText, {
                flag: "wx",
                mode: 0o600
            })
            await tsImport(resolveModulePath(temporary), import.meta.url)

            // Associa as classes registradas durante este import ao arquivo original.
            for (const module of storage.modules) {
                if (!knownModules.has(module)) storage.sources.set(module, file)
            }
        } finally {
            await rm(temporary, { force: true })
        }
    }

    return files
}
