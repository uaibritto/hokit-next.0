import { readFile } from "node:fs/promises"

import { writeAtomic } from "@hokit/filesystem/write-atomic"
import ts from "typescript"

function fixSnippetObject(
    node: ts.ObjectLiteralExpression,
    factory: ts.NodeFactory
) {
    let changed = false
    const properties = node.properties.map((property) => {
        if (!ts.isPropertyAssignment(property)) return property

        const name = property.name.getText().replaceAll(/["']/g, "")
        const initializer = property.initializer

        if (
            ["name", "prefix", "description"].includes(name) &&
            ts.isStringLiteral(initializer)
        ) {
            const trimmed = initializer.text.trim()
            if (trimmed !== initializer.text) {
                changed = true
                return factory.updatePropertyAssignment(
                    property,
                    property.name,
                    factory.createStringLiteral(trimmed)
                )
            }
        }

        if (
            name === "body" &&
            ts.isArrayLiteralExpression(initializer) &&
            initializer.elements.length === 0
        ) {
            changed = true
            return factory.updatePropertyAssignment(
                property,
                property.name,
                factory.createArrayLiteralExpression([
                    factory.createStringLiteral("$0")
                ])
            )
        }

        return property
    })

    return {
        changed,
        node: changed
            ? factory.updateObjectLiteralExpression(node, properties)
            : node
    }
}

export async function fixModuleFile(path: string) {
    const source = await readFile(path, "utf8")
    const file = ts.createSourceFile(
        path,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
    )
    let changed = false

    const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
        const visit: ts.Visitor = (node) => {
            if (
                ts.isCallExpression(node) &&
                ts.isIdentifier(node.expression) &&
                node.expression.text === "Snippet" &&
                node.arguments[0] &&
                ts.isObjectLiteralExpression(node.arguments[0])
            ) {
                const fixed = fixSnippetObject(
                    node.arguments[0],
                    context.factory
                )
                changed ||= fixed.changed

                if (fixed.changed) {
                    return context.factory.updateCallExpression(
                        node,
                        node.expression,
                        node.typeArguments,
                        [fixed.node, ...node.arguments.slice(1)]
                    )
                }
            }

            return ts.visitEachChild(node, visit, context)
        }

        return (root) => ts.visitNode(root, visit) as ts.SourceFile
    }

    const result = ts.transform(file, [transformer])

    try {
        if (changed) {
            const output = ts
                .createPrinter({ newLine: ts.NewLineKind.LineFeed })
                .printFile(result.transformed[0] as ts.SourceFile)
            await writeAtomic(path, output)
        }
    } finally {
        result.dispose()
    }

    return changed
}
