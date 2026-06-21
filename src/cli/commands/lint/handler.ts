import { resolve } from "node:path"

import { loadConfig } from "@hokit/config/load-config"
import { resolveProjectPath } from "@hokit/filesystem/resolve-project-path"
import { fixModuleFile } from "@hokit/lint/fix-modules"
import { loadModules } from "@hokit/loader/load-modules"
import { logger } from "@hokit/logger"
import { storage } from "@hokit/metadata"
import { scanModules } from "@hokit/scanner/scan-modules"
import { validateSnippets } from "@hokit/validator"

export interface LintOptions {
    fix?: boolean
}

async function inspect() {
    const config = await loadConfig()
    const directory = resolveProjectPath(process.cwd(), config.cwd, {
        allowRoot: true
    })
    storage.clear()
    const files = await loadModules(directory)
    const modules = scanModules()
    const grouped = new Map<string, typeof modules>()

    for (const module of modules) {
        const entries = grouped.get(module.module.preset) ?? []
        entries.push(module)
        grouped.set(module.module.preset, entries)
    }

    const issues = [...grouped].flatMap(([preset, entries]) =>
        validateSnippets(
            entries.flatMap((module) =>
                module.snippets.map((snippet) => snippet.config)
            )
        ).issues.map((issue) => ({ ...issue, preset }))
    )

    return { files, issues, modules }
}

export async function lintHandler(options: LintOptions = {}) {
    let result = await inspect()
    let fixed = 0

    if (options.fix) {
        for (const file of result.files) {
            if (await fixModuleFile(resolve(file))) fixed += 1
        }
        if (fixed > 0) result = await inspect()
    }

    for (const issue of result.issues) {
        logger.warn(
            `[${issue.code}] ${issue.preset}.${issue.field}: ${issue.message}`
        )
    }

    if (fixed > 0) logger.success(`Fixed ${fixed} module file(s).`)

    if (result.issues.length > 0) {
        throw new Error(`Lint found ${result.issues.length} problem(s).`)
    }

    logger.success(
        `Lint passed for ${result.modules.length} module(s) with no problems.`
    )

    return { fixed, issues: result.issues }
}
