import {
    generateEditorConfig,
    generateHokitConfig,
    generateModule,
    generateOxfmt,
    generatePackageJson,
    generateTsConfig,
    generateVscodeSettings
} from "@hokit/filesystem/write-output"
import { logger } from "@hokit/logger"
import { execa } from "execa"

export async function install(): Promise<void> {
    logger.info("Installing dependencies..")

    await execa("bun", ["install"], {
        stdio: "inherit"
    })

    logger.info("Dependencies installed.")
}

export async function init(): Promise<void> {
    await generateHokitConfig()
    await generateEditorConfig()
    await generateOxfmt()
    await generatePackageJson()
    await generateTsConfig()
    await generateVscodeSettings()
    await generateModule()

    logger.info("Hokit project initialized.")
}
