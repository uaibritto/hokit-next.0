export function oxfmtTemplate(): string {
    return `${JSON.stringify(
        {
            arrowParens: "always",
            bracketSpacing: true,
            printWidth: 80,
            semi: false,
            singleQuote: false,
            sortImports: true,
            tabWidth: 4,
            trailingComma: "none"
        },
        null,
        4
    )}\n`
}
