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
            join(project, "src/modules/react.ts"),
            "utf8"
        )
        assert.match(initializedModule, /declare component: SnippetDefinition/)
        assert.match(initializedModule, /@Todo\("Implementação futura"\)/)
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
        assert.match(result.stdout, /react/)
        assert.match(result.stdout, /empty/)

        const configPath = join(project, "hokit.config.ts")
        const config = await readFile(configPath, "utf8")
        await writeFile(
            configPath,
            config.replace('presets: ["react"]', 'presets: ["react", "empty"]')
        )

        result = await run(project, "module", "empty")
        assert.equal(result.code, 0, result.stderr)

        const emptyModule = join(project, "src/modules/empty.ts")
        await writeFile(
            emptyModule,
            `import { Module, Snippet, type SnippetDefinition } from "hokit"

@Module({ preset: "empty" })
export class EmptyModule {
    @Snippet({ name: " Padded ", prefix: " pad ", body: [] })
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

        const duplicateModule = join(project, "src/modules/react-extra.ts")
        await writeFile(
            duplicateModule,
            `import { Module, Snippet, type SnippetDefinition } from "hokit"

@Module({ preset: "react" })
export class ReactExtraModule {
    @Snippet({ name: "Another component", prefix: "rfc", body: ["$0"] })
    declare example: SnippetDefinition
}
`
        )
        result = await run(project, "lint")
        assert.equal(result.code, 1)
        assert.match(result.stderr, /Lint found 1 problem/)
        await rm(duplicateModule)

        result = await run(project, "build")
        assert.equal(result.code, 0, result.stderr)
        const reactOutput = JSON.parse(
            await readFile(join(project, "dist/react.json"), "utf8")
        )
        const emptyOutput = JSON.parse(
            await readFile(join(project, "dist/empty.json"), "utf8")
        )
        assert.ok(reactOutput["React component"])
        assert.ok(emptyOutput.Padded)

        result = await run(project, "info")
        assert.equal(result.code, 0, result.stderr)
        assert.match(result.stdout, /Hokit 3\.0\.0-next\.0/)

        result = await run(project, "clean")
        assert.equal(result.code, 0, result.stderr)
        await assert.rejects(readFile(join(project, "dist/react.json")))

        const watch = spawn(process.execPath, [cli, "watch"], {
            cwd: project,
            env: { ...process.env, NO_COLOR: "1" }
        })

        try {
            await waitForOutput(watch, "Watching files...")
            const sourcePath = join(project, "src/modules/react.ts")
            const source = await readFile(sourcePath, "utf8")
            const rebuilt = waitForOutput(watch, "Changes detected.")
            await writeFile(
                sourcePath,
                source.replace('prefix: "rfc"', 'prefix: "rfc2"')
            )
            await rebuilt
            await new Promise((resolveDelay) => setTimeout(resolveDelay, 300))
            const watchedOutput = await readFile(
                join(project, "dist/react.json"),
                "utf8"
            )
            assert.match(watchedOutput, /rfc2/)
        } finally {
            watch.kill("SIGTERM")
        }

        result = await run(project, "help")
        assert.equal(result.code, 0, result.stderr)
        assert.match(result.stdout, /hokit <command>/)

        const unsafeConfig = (await readFile(configPath, "utf8")).replace(
            'target: "vscode"',
            'target: "vscode", overrides: { react: { output: "src/modules/react.ts" } }'
        )
        await writeFile(configPath, unsafeConfig)
        result = await run(project, "doctor")
        assert.equal(result.code, 1)
        result = await run(project, "clean")
        assert.equal(result.code, 1)
        assert.match(
            await readFile(join(project, "src/modules/react.ts"), "utf8"),
            /ReactModule/
        )
    } finally {
        await rm(project, { recursive: true, force: true })
    }
})
