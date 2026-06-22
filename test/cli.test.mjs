import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import {
    mkdir,
    mkdtemp,
    readFile,
    rm,
    symlink,
    writeFile
} from "node:fs/promises"
import { delimiter, join, resolve } from "node:path"
import { test } from "node:test"

const root = resolve(import.meta.dirname, "..")
const cli = join(root, "dist/cli/index.js")
const packageVersion = JSON.parse(
    await readFile(join(root, "package.json"), "utf8")
).version

function run(cwd, ...args) {
    return runWithEnvironment(cwd, args)
}

function runWithEnvironment(cwd, args, environment = {}) {
    return new Promise((resolveRun) => {
        const child = spawn(process.execPath, [cli, ...args], {
            cwd,
            env: {
                ...process.env,
                HOKIT_SKIP_INSTALL: "1",
                NO_COLOR: "1",
                ...environment
            }
        })
        let stdout = ""
        let stderr = ""
        child.stdout.on("data", (chunk) => (stdout += chunk))
        child.stderr.on("data", (chunk) => (stderr += chunk))
        child.on("close", (code) => resolveRun({ code, stderr, stdout }))
    })
}

function runConsumerTypecheck(cwd) {
    return new Promise((resolveRun) => {
        const child = spawn(
            process.execPath,
            [
                join(root, "node_modules/typescript/bin/tsc"),
                "--noEmit",
                "--project",
                join(cwd, "tsconfig.json")
            ],
            { cwd }
        )
        let stdout = ""
        let stderr = ""
        child.stdout.on("data", (chunk) => (stdout += chunk))
        child.stderr.on("data", (chunk) => (stderr += chunk))
        child.on("close", (code) => resolveRun({ code, stderr, stdout }))
    })
}

function waitForOutput(child, expected, timeout = 5_000) {
    return new Promise((resolveWait, reject) => {
        let output = ""
        const timer = setTimeout(
            () =>
                reject(
                    new Error(`Timed out waiting for: ${expected}\n${output}`)
                ),
            timeout
        )
        const inspect = (chunk) => {
            output += chunk
            if (output.includes(expected)) {
                clearTimeout(timer)
                resolveWait(output)
            }
        }
        child.stdout.on("data", inspect)
        child.stderr.on("data", inspect)
        child.once("exit", (code) => {
            clearTimeout(timer)
            reject(new Error(`Watch exited with code ${code}.\n${output}`))
        })
    })
}

test("all CLI commands work in a real project", async () => {
    const project = await mkdtemp(join(root, ".hokit-test-"))

    try {
        await mkdir(join(project, "node_modules"))
        await symlink(root, join(project, "node_modules", "hokit"), "dir")

        let result = await run(project, "init")
        assert.equal(result.code, 0, result.stderr)
        assert.match(result.stdout, /initialized/)
        const initializedModule = await readFile(
            join(project, "src/modules/tsx.ts"),
            "utf8"
        )
        assert.match(initializedModule, /declare tsx: SnippetDefinition/)
        assert.doesNotMatch(initializedModule, /@Todo/)

        result = await run(project, "module", "--todo")
        assert.equal(result.code, 0, result.stderr)
        const moduleWithTodo = await readFile(
            join(project, "src/modules/tsx.ts"),
            "utf8"
        )
        assert.match(moduleWithTodo, /Snippet, Todo, type SnippetDefinition/)
        assert.match(moduleWithTodo, /@Todo\("Future implementation"\)/)
        assert.ok(
            moduleWithTodo.indexOf("@Todo") < moduleWithTodo.indexOf("@Snippet")
        )
        assert.doesNotMatch(moduleWithTodo, /declare todo/)
        assert.match(
            await readFile(join(project, ".editorconfig"), "utf8"),
            /indent_size = 4/
        )
        assert.equal(
            JSON.parse(await readFile(join(project, "package.json"), "utf8"))
                .name,
            "hokit-project"
        )
        assert.equal(
            JSON.parse(await readFile(join(project, "tsconfig.json"), "utf8"))
                .compilerOptions.moduleResolution,
            "Bundler"
        )
        assert.equal(
            JSON.parse(
                await readFile(join(project, ".vscode/settings.json"), "utf8")
            )["editor.defaultFormatter"],
            "oxc.oxc-vscode"
        )

        const fakeBin = join(project, ".test-bin")
        await mkdir(fakeBin)
        await writeFile(
            join(fakeBin, "npm"),
            '#!/bin/sh\ntouch "$PWD/.install-ran"\n',
            { mode: 0o755 }
        )
        result = await runWithEnvironment(project, ["init"], {
            HOKIT_SKIP_INSTALL: "0",
            PATH: `${fakeBin}${delimiter}${process.env.PATH}`,
            npm_config_user_agent: "npm/11.0.0"
        })
        assert.equal(result.code, 0, result.stderr)
        assert.equal(await readFile(join(project, ".install-ran"), "utf8"), "")

        result = await run(project, "doctor")
        assert.equal(result.code, 0, result.stderr)
        assert.match(result.stdout, /Project is healthy/)

        result = await run(project, "module", "--list")
        assert.equal(result.code, 0, result.stderr)
        const availablePresets = [
            "tsx",
            "jsx",
            "swift",
            "kotlin",
            "python",
            "php",
            "ruby",
            "rust",
            "zig",
            "c",
            "cpp",
            "javascript",
            "empty"
        ]
        for (const preset of availablePresets) {
            assert.match(result.stdout, new RegExp(`^${preset}$`, "m"))
        }

        const configPath = join(project, "hokit.config.ts")
        await writeFile(
            configPath,
            (await readFile(configPath, "utf8")).replace(
                'presets: ["tsx"]',
                "presets: []"
            )
        )
        await rm(join(project, "src/modules/tsx.ts"))

        result = await run(project, "module", "tsx")
        assert.equal(result.code, 0, result.stderr)
        assert.match(await readFile(configPath, "utf8"), /presets:\s*\["tsx"\]/)
        assert.match(
            await readFile(join(project, "src/modules/tsx.ts"), "utf8"),
            /class TsxModule/
        )

        result = await run(project, "module", "empty")
        assert.equal(result.code, 0, result.stderr)
        assert.match(
            await readFile(configPath, "utf8"),
            /presets:\s*\["tsx", "empty"\]/
        )

        const emptyModule = join(project, "src/modules/empty.ts")
        assert.doesNotMatch(await readFile(emptyModule, "utf8"), /@Todo/)
        await writeFile(
            emptyModule,
            `import { Module, Snippet, type SnippetDefinition } from "hokit"

@Module({ preset: "empty" })
export class EmptyModule {
    @Snippet({ name: " Padded ", prefix: " pad ", body: [], template: true })
    declare example: SnippetDefinition
}
`
        )

        result = await run(project, "lint", "--fix")
        assert.equal(result.code, 0, result.stderr)
        assert.match(result.stdout, /Fixed 1 module file/)
        const fixed = await readFile(emptyModule, "utf8")
        assert.match(fixed, /name: "Padded"/)
        assert.match(fixed, /body: \["\$0"\]/)

        const duplicateModule = join(project, "src/modules/tsx-extra.ts")
        await writeFile(
            duplicateModule,
            `import { Module, Snippet, type SnippetDefinition } from "hokit"

@Module({ preset: "tsx" })
export class TsxExtraModule {
    @Snippet({ name: "Another TSX", prefix: "tsx", body: ["$0"] })
    declare example: SnippetDefinition
}
`
        )
        result = await run(project, "lint")
        assert.equal(result.code, 1)
        assert.match(result.stderr, /Lint found 1 problem/)
        await rm(duplicateModule)

        for (const preset of availablePresets.slice(1, -1)) {
            result = await run(project, "module", preset)
            assert.equal(result.code, 0, `${preset}: ${result.stderr}`)
        }
        result = await run(project, "module", "javascript", "--todo")
        assert.equal(result.code, 0, result.stderr)
        assert.match(
            await readFile(join(project, "src/modules/javascript.ts"), "utf8"),
            /@Todo\("Future implementation"\)/
        )

        result = await run(project, "lint")
        assert.equal(result.code, 0, result.stderr)
        assert.match(
            result.stderr,
            /\[TODO\] javascript\.js: Future implementation/
        )

        result = await run(project, "lint", "--json")
        assert.equal(result.code, 0, result.stderr)
        const lintJson = JSON.parse(result.stdout)
        assert.equal(lintJson.valid, true)
        assert.equal(lintJson.todos[0].code, "TODO")
        assert.equal(
            lintJson.todos[0].location.file.endsWith("javascript.ts"),
            true
        )

        await writeFile(
            configPath,
            (await readFile(configPath, "utf8")).replace(
                'target: "vscode"',
                'target: "vscode", customPresets: { astro: { output: "dist/astro.json", scopes: ["astro"] } }'
            )
        )
        result = await run(project, "module", "--list")
        assert.equal(result.code, 0, result.stderr)
        assert.match(result.stdout, /^astro$/m)
        result = await run(project, "module", "astro")
        assert.equal(result.code, 0, result.stderr)

        const typecheck = await runConsumerTypecheck(project)
        assert.equal(
            typecheck.code,
            0,
            `${typecheck.stdout}\n${typecheck.stderr}`
        )

        result = await run(project, "build")
        assert.equal(result.code, 0, result.stderr)
        const tsxOutput = JSON.parse(
            await readFile(join(project, "dist/tsx.json"), "utf8")
        )
        const emptyOutput = JSON.parse(
            await readFile(join(project, "dist/empty.json"), "utf8")
        )
        assert.ok(tsxOutput.tsx)
        assert.ok(emptyOutput.Padded)
        assert.equal(tsxOutput.tsx.scope, "typescriptreact")
        assert.equal(tsxOutput.tsx.description, "tsx")
        assert.equal(tsxOutput.tsx.isFileTemplate, false)
        assert.equal(emptyOutput.Padded.isFileTemplate, true)
        assert.ok(
            JSON.parse(await readFile(join(project, "dist/astro.json"), "utf8"))
                .astro
        )
        const expectedScopes = {
            jsx: "javascriptreact",
            swift: "swift",
            kotlin: "kotlin",
            python: "python",
            php: "php",
            ruby: "ruby",
            rust: "rust",
            zig: "zig",
            c: "c",
            cpp: "cpp",
            javascript: "javascript"
        }
        for (const preset of availablePresets.slice(1, -1)) {
            const snippet = JSON.parse(
                await readFile(join(project, `dist/${preset}.json`), "utf8")
            )[preset]

            if (preset === "javascript") {
                assert.equal(snippet, undefined)
                continue
            }

            assert.ok(snippet)
            assert.equal(
                snippet.scope,
                expectedScopes[preset],
                `Unexpected scope for ${preset}`
            )
        }

        result = await run(project, "build", "--include-todos")
        assert.equal(result.code, 0, result.stderr)
        assert.ok(
            JSON.parse(
                await readFile(join(project, "dist/javascript.json"), "utf8")
            ).javascript
        )

        result = await run(project, "docs")
        assert.equal(result.code, 0, result.stderr)
        const docsIndex = await readFile(
            join(project, "docs/snippets/README.md"),
            "utf8"
        )
        assert.match(docsIndex, /typescriptreact\.md/)
        assert.match(docsIndex, /astro\.md/)
        assert.match(
            await readFile(
                join(project, "docs/snippets/javascript.md"),
                "utf8"
            ),
            /Pending — Future implementation/
        )

        result = await run(project, "info")
        assert.equal(result.code, 0, result.stderr)
        assert.ok(result.stdout.includes(`Hokit ${packageVersion}`))

        result = await run(project, "clean")
        assert.equal(result.code, 0, result.stderr)
        await assert.rejects(readFile(join(project, "dist/tsx.json")))

        const watch = spawn(process.execPath, [cli, "watch"], {
            cwd: project,
            env: { ...process.env, NO_COLOR: "1" }
        })

        try {
            await waitForOutput(watch, "Watching files...")
            const sourcePath = join(project, "src/modules/tsx.ts")
            const source = await readFile(sourcePath, "utf8")
            const rebuilt = waitForOutput(watch, "Changes detected.")
            await writeFile(
                sourcePath,
                source.replace('prefix: "tsx"', 'prefix: "tsx2"')
            )
            await rebuilt
            await new Promise((resolveDelay) => setTimeout(resolveDelay, 300))
            const watchedOutput = await readFile(
                join(project, "dist/tsx.json"),
                "utf8"
            )
            assert.match(watchedOutput, /tsx2/)
        } finally {
            watch.kill("SIGTERM")
        }

        result = await run(project, "help")
        assert.equal(result.code, 0, result.stderr)
        assert.match(result.stdout, /hokit <command>/)

        const orphanTodo = join(project, "src/modules/orphan.ts")
        await writeFile(
            orphanTodo,
            `import { Module, Todo, type SnippetDefinition } from "hokit"

@Module({ preset: "tsx" })
export class OrphanModule {
    @Todo("Pending without snippet")
    declare future: SnippetDefinition
}
`
        )
        result = await run(project, "lint")
        assert.equal(result.code, 1)
        assert.match(result.stderr, /TODO_WITHOUT_SNIPPET/)
        result = await run(project, "lint", "--json")
        assert.equal(result.code, 1)
        const orphanJson = JSON.parse(result.stdout)
        assert.equal(orphanJson.issues[0].code, "TODO_WITHOUT_SNIPPET")
        assert.equal(
            orphanJson.issues[0].location.file.endsWith("orphan.ts"),
            true
        )
        assert.equal(typeof orphanJson.issues[0].location.line, "number")
        result = await run(project, "build")
        assert.equal(result.code, 1)
        assert.match(result.stderr, /must decorate a @Snippet/)
        await rm(orphanTodo)

        const unsafeConfig = (await readFile(configPath, "utf8")).replace(
            'target: "vscode"',
            'target: "vscode", overrides: { tsx: { output: "src/modules/tsx.ts" } }'
        )
        await writeFile(configPath, unsafeConfig)
        result = await run(project, "doctor")
        assert.equal(result.code, 1)
        result = await run(project, "clean")
        assert.equal(result.code, 1)
        assert.match(
            await readFile(join(project, "src/modules/tsx.ts"), "utf8"),
            /TsxModule/
        )
    } finally {
        await rm(project, { recursive: true, force: true })
    }
})
