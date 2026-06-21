import { spawn } from "node:child_process"
import { access, mkdir, writeFile } from "node:fs/promises"

import { BuildError } from "@hokit/errors"
import { logger } from "@hokit/logger"
import {
    editorconfigTemplate,
    gitignoreTemplate,
    hokitConfigTemplate,
    moduleTemplate,
    oxfmtTemplate,
    packageJsonTemplate,
    tsconfigTemplate,
    vscodeSettingsTemplate
} from "@hokit/templates"

async function createFile(path: string, content: string) {
    try {
        await writeFile(path, content, { flag: "wx", mode: 0o644 })
        return true
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "EEXIST") return false
        throw error
    }
}

async function exists(path: string) {
    try {
        await access(path)
        return true
    } catch {
        return false
    }
}

async function detectPackageManager() {
    const userAgent = process.env.npm_config_user_agent?.split("/")[0]

    if (["npm", "pnpm", "yarn", "bun"].includes(userAgent ?? "")) {
        return userAgent as "npm" | "pnpm" | "yarn" | "bun"
    }

    if (await exists("pnpm-lock.yaml")) return "pnpm"
    if ((await exists("bun.lock")) || (await exists("bun.lockb"))) return "bun"
    if (await exists("yarn.lock")) return "yarn"
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
    await mkdir(".vscode", { recursive: true })

    const files = [
        ["hokit.config.ts", hokitConfigTemplate()],
        ["package.json", packageJsonTemplate()],
        ["tsconfig.json", tsconfigTemplate()],
        [".oxfmtrc.json", oxfmtTemplate()],
        [".editorconfig", editorconfigTemplate()],
        [".vscode/settings.json", vscodeSettingsTemplate()],
        [".gitignore", gitignoreTemplate()],
        ["src/modules/tsx.ts", moduleTemplate("tsx")]
    ] as const

    let created = 0

    for (const [path, content] of files) {
        if (await createFile(path, content)) created += 1
        else logger.warn(`Preserved existing ${path}.`)
    }

    await installDependencies()

    logger.success(`Hokit project initialized (${created} file(s) created).`)
}
