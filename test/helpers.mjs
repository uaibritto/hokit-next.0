import { spawn } from "node:child_process"
import { readFile } from "node:fs/promises"
import { join, resolve } from "node:path"

export const root = resolve(import.meta.dirname, "..")
export const cli = join(root, "dist/cli/index.js")
export const packageVersion = JSON.parse(
    await readFile(join(root, "package.json"), "utf8")
).version

export function run(cwd, ...args) {
    return runWithEnvironment(cwd, args)
}

export function runWithEnvironment(cwd, args, environment = {}) {
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

export function runConsumerTypecheck(cwd) {
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

export function waitForOutput(child, expected, timeout = 5_000) {
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
