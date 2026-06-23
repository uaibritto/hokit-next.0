export function packageJsonTemplate(): string {
    return `${JSON.stringify(
        {
            name: "hokit-project",
            displayName: "Hokit Project",
            version: "1.0.0",
            publisher: "publisher",
            description: "A snippet extension generated with Hokit.",
            type: "module",
            icon: "icon.png",
            license: "MIT",
            maintainers: ["Name <email>"],
            homepage: "https://github.com/user/repo",
            repository: {
                type: "git",
                url: "https://github.com/user/repo.git"
            },
            bugs: {
                url: "https://github.com/user/repo/issues"
            },
            engines: {
                vscode: "^1.60.0"
            },
            categories: ["Snippets"],
            contributes: {
                snippets: [
                    {
                        language: "typescriptreact",
                        path: "./dist/tsx.json"
                    }
                ]
            },
            keywords: ["snippets"],
            scripts: {
                build: "hokit build",
                lint: "hokit lint",
                doctor: "hokit doctor",
                watch: "hokit watch",
                fmt: "oxfmt",
                package: "vsce package --out ./bin/hokit-project.vsix",
                "vscode:pub": "vsce publish ./bin/hokit-project.vsix",
                "cursor:pub": "ovsx publish ./bin/hokit-project.vsix"
            },
            dependencies: {
                hokit: "latest"
            },
            devDependencies: {
                "@vscode/vsce": "latest",
                ovsx: "latest",
                oxfmt: "latest",
                typescript: "latest"
            }
        },
        null,
        4
    )}\n`
}
