import fs from "node:fs/promises"

import { logger } from "@hokit/logger"
import {
    editorConfigTemplate,
    emptyTemplate,
    hokitConfigTemplate,
    oxfmtTemplate,
    packageJsonTemplate,
    reactTemplate,
    tsconfigTemplate,
    vscodeTemplate
} from "@hokit/templates"

const templates = {
    empty: emptyTemplate,
    react: reactTemplate
}

export async function generateHokitConfig(): Promise<void> {
    await fs.writeFile("hokit.config.ts", hokitConfigTemplate)

    logger.info("Generated hokit.config.ts")
}

export async function generatePackageJson(): Promise<void> {
    try {
        const content = await fs.readFile("package.json", "utf-8")
        const current = JSON.parse(content)

        const packageJson = {
            ...packageJsonTemplate,
            ...current,

            scripts: {
                ...packageJsonTemplate.scripts,
                ...current.scripts
            },

            dependencies: {
                ...current.dependencies,
                ...packageJsonTemplate.dependencies
            },

            devDependecies: {
                ...current.devDependencies,
                ...packageJsonTemplate.devDependencies
            }
        }

        await fs.writeFile("package.json", JSON.stringify(packageJson, null, 4))

        logger.info("Updated package.json")
    } catch {
        await fs.writeFile(
            "package.json",
            JSON.stringify(packageJsonTemplate, null, 4)
        )

        logger.info("Generated package.json")
    }
}

export async function generateTsConfig(): Promise<void> {
    await fs.writeFile("tsconfig.json", tsconfigTemplate)

    logger.info("Generated tsconfig.json")
}

export async function generateVscodeSettings(): Promise<void> {
    await fs.mkdir(".vscode", { recursive: true })
    await fs.writeFile(".vscode/settings.json", vscodeTemplate)

    logger.info("Generated .vscode/settings.json")
}

export async function generateOxfmt(): Promise<void> {
    await fs.writeFile(".oxfmtrc.json", oxfmtTemplate)

    logger.info("Generated .oxfmtrc.json")
}

export async function generateEditorConfig(): Promise<void> {
    await fs.writeFile(".editorconfig", editorConfigTemplate)

    logger.info("Generated .editorconfig")
}

export async function generateModule(template?: string): Promise<void> {
    const factory = templates[template as keyof typeof templates]

    if (!factory) {
        throw new Error(`Unknown module template "${template}"`)
    }

    await fs.mkdir("src/modules", { recursive: true })

    let filePath: string

    switch (template) {
        case "react":
            filePath = "src/modules/react.json"
            break
        case "vue":
            filePath = "src/modules/vue.json"
            break
        default:
            filePath = "src/modules/example.json"
    }

    await fs.writeFile(filePath, factory)

    logger.info(`Generated ${filePath}`)
}
