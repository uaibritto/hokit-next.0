import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import {
    access,
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
        await access(join(project, "src/modules"))
        await access(join(project, "src/templates"))
        assert.match(
            await readFile(join(project, ".editorconfig"), "utf8"),
            /indent_size = 4/
        )
        assert.equal(
            JSON.parse(await readFile(join(project, "package.json"), "utf8"))
                .name,
            "my-snippets"
        )
        assert.equal(
            JSON.parse(await readFile(join(project, "package.json"), "utf8"))
                .contributes.snippets[0].path,
            ""
        )
        assert.match(
            await readFile(join(project, "hokit.config.ts"), "utf8"),
            /presets:\s*\[\]/
        )
        assert.match(
            await readFile(join(project, "hokit.config.ts"), "utf8"),
            /from "hokit"\n\nexport default defineConfig/
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
            join(fakeBin, "bun"),
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
        result = await run(project, "module", "--list", "--unknown")
        assert.equal(result.code, 1)
        assert.match(result.stderr, /Unknown flag/)
        result = await run(project, "module", "--list", "tsx")
        assert.equal(result.code, 1)
        assert.match(result.stderr, /takes no preset/)
        result = await run(project, "snippet", "--list", "rfc")
        assert.equal(result.code, 1)
        assert.match(result.stderr, /takes no prefix/)
        result = await run(project, "todo", "--list", "raf")
        assert.equal(result.code, 1)
        assert.match(result.stderr, /takes no prefix/)

        const configPath = join(project, "hokit.config.ts")

        result = await run(project, "module", "--tsx")
        assert.equal(result.code, 0, result.stderr)
        assert.match(await readFile(configPath, "utf8"), /presets:\s*\["tsx"\]/)
        assert.match(
            await readFile(configPath, "utf8"),
            /from "hokit";?\n\nexport default defineConfig/
        )
        assert.match(
            await readFile(join(project, "src/modules/tsx.ts"), "utf8"),
            /export class TsxModule \{\}/
        )
        assert.equal(
            await readFile(join(project, "src/templates/tsx/index.ts"), "utf8"),
            "export const template = {}\n"
        )

        result = await run(project, "snippet", "--tsx", "rfc")
        assert.equal(result.code, 0, result.stderr)
        assert.match(
            await readFile(join(project, "src/templates/tsx/rfc.ts"), "utf8"),
            /export const rfc = \[""\]/
        )
        assert.match(
            await readFile(join(project, "src/templates/tsx/index.ts"), "utf8"),
            /import \{ rfc \} from "\.\/rfc"\n\nexport const template/
        )
        assert.match(
            await readFile(join(project, "src/templates/tsx/index.ts"), "utf8"),
            /template = \{\n\s+rfc\n\}/
        )
        assert.match(
            await readFile(join(project, "src/modules/tsx.ts"), "utf8"),
            /body: template\.rfc/
        )
        assert.match(
            await readFile(join(project, "src/modules/tsx.ts"), "utf8"),
            /template: false/
        )
        await writeFile(
            join(project, "src/templates/tsx/rfc.ts"),
            'export const rfc = ["$0"]\n'
        )
        await writeFile(
            join(project, "src/modules/tsx.ts"),
            (await readFile(join(project, "src/modules/tsx.ts"), "utf8"))
                .replace('name: ""', 'name: "React Functional Component"')
                .replace('description: ""', 'description: "Create a component"')
        )
        result = await run(project, "snippet", "--tsx", "bad-name")
        assert.equal(result.code, 1)
        assert.match(result.stderr, /Snippet prefix/)
        await assert.rejects(
            readFile(join(project, "src/templates/tsx/bad-name.ts"))
        )
        result = await run(project, "snippet", "--tsx", "rfc", "extra")
        assert.equal(result.code, 1)
        assert.match(result.stderr, /Unexpected argument/)
        result = await run(project, "snippet", "tsx", "raf")
        assert.equal(result.code, 0, result.stderr)
        await writeFile(
            join(project, "src/templates/tsx/raf.ts"),
            'export const raf = ["$0"]\n'
        )
        await writeFile(
            join(project, "src/modules/tsx.ts"),
            (await readFile(join(project, "src/modules/tsx.ts"), "utf8"))
                .replace('name: ""', 'name: "React Arrow Component"')
                .replace(
                    'description: ""',
                    'description: "Create an arrow component"'
                )
        )

        result = await run(project, "module", "--empty")
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
    @Snippet({ name: "Another TSX", prefix: "rfc", body: ["$0"] })
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
        result = await run(project, "todo", "javascript", "js")
        assert.equal(result.code, 0, result.stderr)
        assert.match(
            await readFile(join(project, "src/modules/javascript.ts"), "utf8"),
            /@Todo\(""\)/
        )
        await writeFile(
            join(project, "src/templates/javascript/js.ts"),
            'export const js = ["$0"]\n'
        )
        await writeFile(
            join(project, "src/modules/javascript.ts"),
            (await readFile(join(project, "src/modules/javascript.ts"), "utf8"))
                .replace('name: ""', 'name: "javascript"')
                .replace('description: ""', 'description: "javascript"')
        )

        result = await run(project, "lint")
        assert.equal(result.code, 0, result.stderr)
        assert.match(result.stderr, /\[TODO\] javascript\.js: /)

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
                'docs: "off"',
                'docs: "on", extend: { presets: { astro: { scopes: ["astro"] } } }'
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
            await readFile(join(project, "dist/snippets/tsx.json"), "utf8")
        )
        const emptyOutput = JSON.parse(
            await readFile(join(project, "dist/snippets/empty.json"), "utf8")
        )
        assert.ok(tsxOutput["React Functional Component"])
        assert.ok(tsxOutput["React Arrow Component"])
        assert.ok(emptyOutput.Padded)
        assert.equal(
            tsxOutput["React Functional Component"].scope,
            "typescriptreact"
        )
        assert.equal(
            tsxOutput["React Functional Component"].description,
            "Create a component"
        )
        assert.equal(
            tsxOutput["React Functional Component"].isFileTemplate,
            false
        )
        assert.equal(emptyOutput.Padded.isFileTemplate, true)
        assert.deepEqual(
            JSON.parse(
                await readFile(
                    join(project, "dist/snippets/astro.json"),
                    "utf8"
                )
            ),
            {}
        )
        for (const preset of availablePresets.slice(1, -1)) {
            const output = JSON.parse(
                await readFile(
                    join(project, `dist/snippets/${preset}.json`),
                    "utf8"
                )
            )

            if (preset === "javascript") {
                assert.equal(output.javascript, undefined)
                continue
            }

            assert.deepEqual(output, {})
        }

        result = await run(project, "build", "--include-todo")
        assert.equal(result.code, 0, result.stderr)
        assert.ok(
            JSON.parse(
                await readFile(
                    join(project, "dist/snippets/javascript.json"),
                    "utf8"
                )
            ).javascript
        )

        const docsIndex = await readFile(
            join(project, "docs/README.md"),
            "utf8"
        )
        assert.match(docsIndex, /typescriptreact\.md/)
        assert.match(docsIndex, /astro\.md/)
        assert.match(
            await readFile(join(project, "docs/javascript.md"), "utf8"),
            /Pending —/
        )

        result = await run(project, "info")
        assert.equal(result.code, 0, result.stderr)
        assert.ok(result.stdout.includes(`Hokit ${packageVersion}`))

        result = await run(project, "clean")
        assert.equal(result.code, 0, result.stderr)
        await assert.rejects(readFile(join(project, "dist/snippets/tsx.json")))

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
                source.replace('prefix: "rfc"', 'prefix: "rfc2"')
            )
            await rebuilt
            await new Promise((resolveDelay) => setTimeout(resolveDelay, 300))
            const watchedOutput = await readFile(
                join(project, "dist/snippets/tsx.json"),
                "utf8"
            )
            assert.match(watchedOutput, /rfc2/)
        } finally {
            watch.kill("SIGTERM")
        }

        result = await run(project, "help")
        assert.equal(result.code, 0, result.stderr)
        assert.match(result.stdout, /Usage:/)
        assert.match(result.stdout, /Commands:/)
        assert.match(result.stdout, /Flags:/)
        assert.match(result.stdout, /Examples:/)

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
            'output: "dist/snippets"',
            'output: "src/modules"'
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

        await writeFile(
            configPath,
            `import { defineConfig } from "hokit"

export default defineConfig({
    cwd: "src/modules",
    output: "dist/snippets",
    presets: [],
    extend: {
        presets: {
        "../evil": {
            scopes: ["evil"]
        }
        }
    }
})
`
        )
        result = await run(project, "module", "../evil")
        assert.equal(result.code, 1)
        assert.match(result.stderr, /Preset/)
        await assert.rejects(readFile(join(project, "src/evil.ts")))
    } finally {
        await rm(project, { recursive: true, force: true })
    }
})
