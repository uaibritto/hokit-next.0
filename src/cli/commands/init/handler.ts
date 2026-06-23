import { spawn } from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"

import { BuildError } from "@hokit/errors"
import { logger } from "@hokit/logger"
import {
    editorconfigTemplate,
    gitignoreTemplate,
    hokitConfigTemplate,
    oxfmtTemplate,
    packageJsonTemplate,
    tsconfigTemplate,
    vscodeSettingsTemplate
} from "@hokit/templates"

type PackageManager = "bun" | "nub" | "pnpm" | "npm" | "yarn"

async function createFile(path: string, content: string) {
    try {
        await writeFile(path, content, { flag: "wx", mode: 0o644 })
        return true
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "EEXIST") return false
        throw error
    }
}

async function commandExists(command: PackageManager) {
    return await new Promise<boolean>((resolveCommand) => {
        const child = spawn(command, ["--version"], {
            shell: false,
            stdio: "ignore"
        })

        child.once("error", () => resolveCommand(false))
        child.once("exit", (code) => resolveCommand(code === 0))
    })
}

async function detectPackageManager(): Promise<PackageManager> {
    const candidates: PackageManager[] = ["bun", "nub", "pnpm", "npm", "yarn"]

    for (const candidate of candidates) {
        if (await commandExists(candidate)) return candidate
    }

    return "npm"
}

async function installDependencies() {
    if (process.env.HOKIT_SKIP_INSTALL === "1") return

    const packageManager = await detectPackageManager()
    const args = packageManager === "yarn" ? [] : ["install"]

    logger.info(`Installing dependencies with ${packageManager}...`)

    await new Promise<void>((resolveInstall, rejectInstall) => {
        const child = spawn(packageManager, args, {
            cwd: process.cwd(),
            shell: false,
            stdio: "inherit"
        })

        child.once("error", (cause) => {
            rejectInstall(
                new BuildError(
                    `Could not start ${packageManager}.`,
                    `Install dependencies manually with "${packageManager} install".`,
                    cause
                )
            )
        })
        child.once("exit", (code) => {
            if (code === 0) resolveInstall()
            else {
                rejectInstall(
                    new BuildError(
                        `${packageManager} install failed with exit code ${code}.`,
                        "Review the package manager output above and try again."
                    )
                )
            }
        })
    })
}

export async function initHandler() {
    await mkdir("src/modules", { recursive: true })
    await mkdir("src/templates", { recursive: true })
    await mkdir(".vscode", { recursive: true })

    const files = [
        ["hokit.config.ts", hokitConfigTemplate()],
        ["package.json", packageJsonTemplate()],
        ["tsconfig.json", tsconfigTemplate()],
        [".oxfmtrc.json", oxfmtTemplate()],
        [".editorconfig", editorconfigTemplate()],
        [".vscode/settings.json", vscodeSettingsTemplate()],
        [".gitignore", gitignoreTemplate()]
    ] as const

    let created = 0

    for (const [path, content] of files) {
        if (await createFile(path, content)) created += 1
        else logger.warn(`Preserved existing ${path}.`)
    }

    await installDependencies()

    logger.success(`Hokit project initialized (${created} file(s) created).`)
}
