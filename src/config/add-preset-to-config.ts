import { randomUUID } from "node:crypto"
import { readFile, rename, rm, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

import { ConfigError } from "@hokit/errors"
import type { Preset } from "@hokit/types"
import ts from "typescript"

export async function addPresetToConfig(preset: Preset, root = process.cwd()) {
    const path = resolve(root, "hokit.config.ts")
    const source = await readFile(path, "utf8")
    const file = ts.createSourceFile(
        path,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
    )
    let updated = false

    const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
        const visit: ts.Visitor = (node) => {
            if (
                !updated &&
                ts.isCallExpression(node) &&
                ts.isIdentifier(node.expression) &&
                node.expression.text === "defineConfig" &&
                node.arguments[0] &&
                ts.isObjectLiteralExpression(node.arguments[0])
            ) {
                const config = node.arguments[0]
                const properties = config.properties.map((property) => {
                    if (
                        !ts.isPropertyAssignment(property) ||
                        property.name.getText(file).replaceAll(/["']/g, "") !==
                            "presets" ||
                        !ts.isArrayLiteralExpression(property.initializer)
                    ) {
                        return property
                    }

                    const alreadyConfigured =
                        property.initializer.elements.some(
                            (element) =>
                                ts.isStringLiteral(element) &&
                                element.text === preset
                        )

                    if (alreadyConfigured) {
                        updated = true
                        return property
                    }

                    updated = true
                    return context.factory.updatePropertyAssignment(
                        property,
                        property.name,
                        context.factory.updateArrayLiteralExpression(
                            property.initializer,
                            [
                                ...property.initializer.elements,
                                context.factory.createStringLiteral(preset)
                            ]
                        )
                    )
                })

                return context.factory.updateCallExpression(
                    node,
                    node.expression,
                    node.typeArguments,
                    [
                        context.factory.updateObjectLiteralExpression(
                            config,
                            properties
                        ),
                        ...node.arguments.slice(1)
                    ]
                )
            }

            return ts.visitEachChild(node, visit, context)
        }

        return (rootNode) => ts.visitNode(rootNode, visit) as ts.SourceFile
    }

    const result = ts.transform(file, [transformer])

    try {
        if (!updated) {
            throw new ConfigError(
                'Could not update the "presets" field in hokit.config.ts.',
                "Define presets as an array inside defineConfig()."
            )
        }

        const content = ts
            .createPrinter({ newLine: ts.NewLineKind.LineFeed })
            .printFile(result.transformed[0] as ts.SourceFile)
        const temporary = `${path}.${randomUUID()}.tmp`

        try {
            await writeFile(temporary, content, { flag: "wx", mode: 0o600 })
            await rename(temporary, path)
        } catch (error) {
            await rm(temporary, { force: true })
            throw error
        }
    } finally {
        result.dispose()
    }
}
