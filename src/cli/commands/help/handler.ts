export function helpHandler() {
    console.log(`Hokit
─────

A declarative snippet compiler powered by decorators.

Usage

  hokit <command>

Commands

  init              Initializes a new Hokit project.
  build             Generates snippet files.
    --include-todos  Includes pending snippets in a preview build.
  module --[preset] Creates a new snippet module.
    --list           Lists available presets.
    --todo           Marks the last snippet as pending.
  snippet --[preset] [prefix]
                    Adds a snippet to an existing module.
  lint              Runs validation rules.
    --fix            Automatically fixes safe problems.
    --json           Prints machine-readable diagnostics.
  doctor            Checks project health.
  docs              Generates Markdown documentation by scope.
  clean             Removes generated files.
  info              Displays project information.
  watch             Watches files and rebuilds automatically.
  help              Displays this help screen.

Examples

  hokit init
  hokit module --tsx
  hokit module --tsx --todo
  hokit snippet --tsx rfc
  hokit module --todo
  hokit module --list
  hokit build
  hokit lint
  hokit lint --fix
  hokit doctor
  hokit docs
  hokit clean
  hokit info`)
}
