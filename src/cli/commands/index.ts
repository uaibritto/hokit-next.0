import { buildCommand } from "./build/command"
import { cleanCommand } from "./clean/command"
import { docsCommand } from "./docs/command"
import { doctorCommand } from "./doctor/command"
import { helpCommand } from "./help/command"
import { infoCommand } from "./info/command"
import { initCommand } from "./init/command"
import { lintCommand } from "./lint/command"
import { moduleCommand } from "./module/command"
import { watchCommand } from "./watch/command"

export const Commands = {
    build: buildCommand,

    clean: cleanCommand,

    doctor: doctorCommand,

    docs: docsCommand,

    help: helpCommand,

    info: infoCommand,

    init: initCommand,

    lint: lintCommand,

    module: moduleCommand,

    watch: watchCommand
}
