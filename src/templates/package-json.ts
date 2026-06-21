export function packageJsonTemplate(): string {
    return `${JSON.stringify(
        {
            name: "hokit-project",
            private: true,
            type: "module",
            scripts: {
                build: "hokit build",
                lint: "hokit lint",
                doctor: "hokit doctor",
                watch: "hokit watch"
            },
            dependencies: {
                hokit: "latest"
            },
            devDependencies: {
                typescript: "latest",
                oxfmt: "latest"
            }
        },
        null,
        4
    )}\n`
}
