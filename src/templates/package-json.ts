import { VERSION } from "@hokit/version"

const DevDependencyVersions = {
    "@vscode/vsce": "^3.9.2",
    ovsx: "^1.0.2",
    oxfmt: "^0.56.0",
    typescript: "^6.0.3"
}

export function packageJsonTemplate(): string {
    return `${JSON.stringify(
        {
            name: "my-snippets",
            displayName: "",
            version: "1.0.0",
            description: "",
            categories: ["Snippets"],
            keywords: ["snippets"],
            homepage: "https://github.com/user/repo",
            bugs: {
                url: "https://github.com/user/repo/issues"
            },
            license: "MIT",
            maintainers: ["Name <email>"],
            repository: {
                type: "git",
                url: "https://github.com/user/repo.git"
            },
            publisher: "publisher",
            type: "module",
            scripts: {
                build: "hokit build",
                lint: "hokit lint",
                watch: "hokit watch",
                fmt: "oxfmt",
                package: "vsce package --out <out>",
                "vscode:pub": "vsce publish <.vsix>",
                "cursor:pub": "ovsx publish <.vsix>"
            },
            dependencies: {
                hokit: `^${VERSION}`
            },
            devDependencies: DevDependencyVersions,
            contributes: {
                snippets: [
                    {
                        language: "",
                        path: ""
                    }
                ]
            },
            icon: "icon.png",
            engines: {
                vscode: "^1.60.0"
            }
        },
        null,
        4
    )}\n`
}
