export function helpHandler() {
    console.log(`Hokit
─────

A declarative snippet compiler powered by decorators.

Usage

  hokit <command>

Commands

  init              Initializes a new Hokit project.
  build             Generates snippet files.
    --include-todo   Includes pending snippets in a preview build.
  module --[preset] Creates a new snippet module.
    --list           Lists available presets.
  snippet --[preset] [prefix]
                    Adds a snippet to a module.
    --list           Lists available presets.
  todo --[preset] [prefix]
                    Adds a pending snippet to a module.
    --list           Lists available presets.
  lint              Runs validation rules.
    --fix            Automatically fixes safe problems.
    --json           Prints machine-readable diagnostics.
  doctor            Checks project health.
  clean             Removes generated files.
  info              Displays project information.
  watch             Watches files and rebuilds automatically.
  help              Displays this help screen.

Examples

  hokit init
  hokit module --tsx
  hokit module tsx
  hokit snippet --tsx rfc
  hokit snippet tsx rfc
  hokit todo --tsx raf
  hokit todo tsx raf
  hokit module --list
  hokit build
  hokit build --include-todo
  hokit lint
  hokit lint --fix
  hokit doctor
  hokit clean
  hokit info`)
}
