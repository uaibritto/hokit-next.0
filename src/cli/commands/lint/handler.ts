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
    json?: boolean
}

function formatLocation(location?: {
    file: string
    line: number
    column: number
}) {
    return location
        ? `${location.file}:${location.line}:${location.column}: `
        : ""
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

    const issues = [...grouped].flatMap(([preset, entries]) => {
        const snippets = entries.flatMap((module) => module.snippets)

        return validateSnippets(
            snippets.map((snippet) => snippet.config)
        ).issues.map((issue) => ({
            ...issue,
            ...(issue.snippetIndex === undefined
                ? {}
                : { location: snippets[issue.snippetIndex]?.location }),
            preset
        }))
    })

    for (const module of modules) {
        const snippetProperties = new Set(
            module.snippets.map((snippet) => snippet.propertyKey)
        )

        for (const todo of module.todos) {
            if (!snippetProperties.has(todo.propertyKey)) {
                issues.push({
                    field: String(todo.propertyKey),
                    code: "TODO_WITHOUT_SNIPPET",
                    message: "@Todo must decorate a @Snippet.",
                    preset: module.module.preset,
                    ...(todo.location ? { location: todo.location } : {})
                })
            }
        }
    }

    const todos = modules.flatMap((module) =>
        module.snippets.flatMap((snippet) =>
            snippet.todo !== undefined
                ? [
                      {
                          field: String(snippet.propertyKey),
                          message: snippet.todo,
                          preset: module.module.preset,
                          ...(snippet.location
                              ? { location: snippet.location }
                              : {})
                      }
                  ]
                : []
        )
    )

    return { files, issues, modules, todos }
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

    if (options.json) {
        console.log(
            JSON.stringify(
                {
                    valid: result.issues.length === 0,
                    fixed,
                    issues: result.issues.map((issue) => ({
                        severity: "error",
                        ...issue
                    })),
                    todos: result.todos.map((todo) => ({
                        severity: "warning",
                        code: "TODO",
                        ...todo
                    }))
                },
                null,
                2
            )
        )
        if (result.issues.length > 0) process.exitCode = 1
        return { fixed, issues: result.issues, todos: result.todos }
    }

    for (const issue of result.issues) {
        logger.warn(
            `${formatLocation(issue.location)}[${issue.code}] ${issue.preset}.${issue.field}: ${issue.message}`
        )
    }

    for (const todo of result.todos) {
        logger.warn(
            `${formatLocation(todo.location)}[TODO] ${todo.preset}.${todo.field}: ${todo.message}`
        )
    }

    if (fixed > 0) logger.success(`Fixed ${fixed} module file(s).`)

    if (result.issues.length > 0) {
        throw new Error(`Lint found ${result.issues.length} problem(s).`)
    }

    const pending =
        result.todos.length === 0
            ? ""
            : ` (${result.todos.length} pending Todo(s))`
    logger.success(
        `Lint passed for ${result.modules.length} module(s) with no problems${pending}.`
    )

    return { fixed, issues: result.issues, todos: result.todos }
}
