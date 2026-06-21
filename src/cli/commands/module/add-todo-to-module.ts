import { randomUUID } from "node:crypto"
import { readFile, rename, rm, writeFile } from "node:fs/promises"

import { ConfigError } from "@hokit/errors"
import ts from "typescript"

function hasDecorator(node: ts.Node, name: string) {
    if (!ts.canHaveDecorators(node)) return false

    return (ts.getDecorators(node) ?? []).some((decorator) => {
        const expression = decorator.expression
        return (
            ts.isCallExpression(expression) &&
            ts.isIdentifier(expression.expression) &&
            expression.expression.text === name
        )
    })
}

export async function addTodoToModule(path: string) {
    const source = await readFile(path, "utf8")
    const file = ts.createSourceFile(
        path,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
    )
    const moduleClass = file.statements.find(ts.isClassDeclaration)

    if (!moduleClass) {
        throw new ConfigError(`Could not find a class in ${path}.`)
    }

    if (moduleClass.members.some((member) => hasDecorator(member, "Todo"))) {
        throw new ConfigError(`Module ${path} already contains a Todo.`)
    }

    const snippetMembers = moduleClass.members.filter((member) =>
        hasDecorator(member, "Snippet")
    )
    const lastSnippet = snippetMembers.at(-1)

    if (!lastSnippet) {
        throw new ConfigError(
            `Could not add a Todo to ${path}.`,
            "Define at least one @Snippet before adding a Todo."
        )
    }

    const importDeclaration = file.statements.find(
        (statement): statement is ts.ImportDeclaration =>
            ts.isImportDeclaration(statement) &&
            ts.isStringLiteral(statement.moduleSpecifier) &&
            statement.moduleSpecifier.text === "hokit"
    )
    const imports = importDeclaration?.importClause?.namedBindings

    if (!imports || !ts.isNamedImports(imports)) {
        throw new ConfigError(
            `Could not update the Hokit import in ${path}.`,
            'Use a named import such as import { Module, Snippet } from "hokit".'
        )
    }

    const changes: Array<{ position: number; text: string }> = []
    const hasTodoImport = imports.elements.some(
        (element) => element.name.text === "Todo"
    )

    if (!hasTodoImport) {
        const firstTypeImport = imports.elements.find(
            (element) => element.isTypeOnly
        )
        changes.push(
            firstTypeImport
                ? {
                      position: firstTypeImport.getStart(file),
                      text: "Todo, "
                  }
                : { position: imports.elements.end, text: ", Todo" }
        )
    }

    const propertyNames = new Set(
        moduleClass.members
            .filter(ts.isPropertyDeclaration)
            .map((member) => member.name.getText(file))
    )
    let propertyName = "todo"
    let suffix = 2

    while (propertyNames.has(propertyName)) {
        propertyName = `todo${suffix}`
        suffix += 1
    }

    const lineStart = source.lastIndexOf("\n", lastSnippet.getStart(file)) + 1
    const indentation = source.slice(lineStart, lastSnippet.getStart(file))
    changes.push({
        position: lastSnippet.getEnd(),
        text: `\n\n${indentation}@Todo("Future implementation")\n${indentation}declare ${propertyName}: SnippetDefinition`
    })

    let content = source

    for (const change of changes.sort(
        (left, right) => right.position - left.position
    )) {
        content =
            content.slice(0, change.position) +
            change.text +
            content.slice(change.position)
    }

    const temporary = `${path}.${randomUUID()}.tmp`

    try {
        await writeFile(temporary, content, { flag: "wx", mode: 0o600 })
        await rename(temporary, path)
    } catch (error) {
        await rm(temporary, { force: true })
        throw error
    }
}
