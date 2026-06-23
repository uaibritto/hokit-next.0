export function templateIndexTemplate(name: string): string {
    return `export const ${name} = ["$0"]

export const template = {
    ${name}
}
`
}

export function emptyTemplateIndexTemplate(): string {
    return `export const template = {}
`
}

export function snippetBodyTemplate(name: string): string {
    return `export const ${name} = [""]
`
}
