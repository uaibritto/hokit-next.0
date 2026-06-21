export function tsconfigTemplate(): string {
    return `${JSON.stringify(
        {
            compilerOptions: {
                target: "ES2022",
                module: "ESNext",
                moduleResolution: "Bundler",
                strict: true,
                experimentalDecorators: true,
                skipLibCheck: true,
                paths: {
                    "@/*": ["./src/*"]
                }
            },
            include: ["src"]
        },
        null,
        4
    )}\n`
}
