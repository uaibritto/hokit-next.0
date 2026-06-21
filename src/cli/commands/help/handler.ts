export function helpHandler() {
    console.log(`Hokit
─────

A declarative snippet compiler powered by decorators.

Usage

  hokit <command>

Commands

  init              Initializes a new Hokit project.
  build             Generates snippet files.
  module [preset]   Creates a new snippet module.
    --list           Lists available presets.
  lint              Runs validation rules.
    --fix            Automatically fixes safe problems.
  doctor            Checks project health.
  clean             Removes generated files.
  info              Displays project information.
  watch             Watches files and rebuilds automatically.
  help              Displays this help screen.

Examples

  hokit init
  hokit module react
  hokit module --list
  hokit build
  hokit lint
  hokit lint --fix
  hokit doctor
  hokit clean
  hokit info`)
}
