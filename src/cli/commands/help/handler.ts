import { VERSION } from "@hokit/version"
import pc from "picocolors"

interface HelpRow {
    command: string
    usage?: string
    description: string
}

const commandGroups: Array<{
    title: string
    color: (value: string) => string
    rows: HelpRow[]
}> = [
    {
        title: "Project",
        color: pc.magenta,
        rows: [
            {
                command: "init",
                description: "Initialize an empty Hokit project"
            },
            {
                command: "build",
                usage: "--include-todo",
                description: "Generate snippet files and optional docs"
            },
            {
                command: "watch",
                description: "Watch modules and rebuild automatically"
            }
        ]
    },
    {
        title: "Authoring",
        color: pc.cyan,
        rows: [
            {
                command: "module",
                usage: "--<preset> | <preset>",
                description: "Create or update a snippet module"
            },
            {
                command: "snippet",
                usage: "--<preset> <prefix> | <preset> <prefix>",
                description: "Add a snippet to a module"
            },
            {
                command: "todo",
                usage: "--<preset> <prefix> | <preset> <prefix>",
                description: "Add a pending snippet to a module"
            }
        ]
    },
    {
        title: "Quality",
        color: pc.yellow,
        rows: [
            {
                command: "lint",
                usage: "--fix --json",
                description: "Run validation rules"
            },
            {
                command: "doctor",
                description: "Check project health and path safety"
            },
            {
                command: "clean",
                description: "Remove generated snippet files"
            }
        ]
    },
    {
        title: "Utilities",
        color: pc.blue,
        rows: [
            {
                command: "info",
                description: "Display project information"
            },
            {
                command: "help",
                description: "Display this help screen"
            }
        ]
    }
]

const flags: HelpRow[] = [
    {
        command: "--help",
        description: "Display this help screen"
    },
    {
        command: "--version",
        description: "Print the installed Hokit version"
    },
    {
        command: "--list",
        description: "List available presets for module, snippet, or todo"
    },
    {
        command: "--include-todo",
        description: "Include pending snippets in a preview build"
    }
]

const examples = [
    "hokit init",
    "hokit module --tsx",
    "hokit snippet --tsx rfc",
    "hokit todo tsx raf",
    "hokit build --include-todo",
    "hokit lint --fix"
]

function pad(value: string, size: number) {
    return `${value}${" ".repeat(Math.max(0, size - value.length))}`
}

function renderRow(
    row: HelpRow,
    options: {
        color: (value: string) => string
        indent?: number
        commandWidth?: number
        usageWidth?: number
    }
) {
    const indent = " ".repeat(options.indent ?? 2)
    const commandWidth = options.commandWidth ?? 14
    const usageWidth = options.usageWidth ?? 44
    const command = options.color(pad(row.command, commandWidth))
    const usage = pc.dim(pad(row.usage ?? "", usageWidth))

    return `${indent}${command}${usage}${row.description}`
}

export function helpHandler() {
    const output: string[] = [
        `${pc.bold(pc.magenta("Hokit"))} ${pc.dim(`v${VERSION}`)} ${pc.dim("— declarative snippet compiler powered by decorators")}`,
        "",
        `${pc.bold("Usage:")} ${pc.cyan("hokit")} ${pc.dim("<command>")} ${pc.dim("[...flags]")} ${pc.dim("[...args]")}`,
        "",
        pc.bold("Commands:")
    ]

    for (const group of commandGroups) {
        output.push("", `  ${pc.dim(group.title)}`)

        for (const row of group.rows) {
            output.push(renderRow(row, { color: group.color }))
        }
    }

    output.push("", pc.bold("Flags:"))

    for (const flag of flags) {
        output.push(
            renderRow(flag, {
                color: pc.cyan,
                commandWidth: 18,
                indent: 4,
                usageWidth: 12
            })
        )
    }

    output.push("", pc.bold("Examples:"))

    for (const example of examples) {
        output.push(`  ${pc.dim("$")} ${pc.cyan(example)}`)
    }

    console.log(output.join("\n"))
}
