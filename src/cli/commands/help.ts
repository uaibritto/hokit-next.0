import { logger } from "@hokit/logger"

export async function help(): Promise<void> {
    logger.info(`
Usage:

init          # Start a new project with a default template.
build         # Generates snippet files.
module        # Creates a new module based on a template.
watch         # Start observation mode.
doctor        # Check the project configuration.
lint          # Execute the linter.

# flags:

--list        # List all available modules
--fix         # It runs the linter and automatically corrects the problems.
`)
}
