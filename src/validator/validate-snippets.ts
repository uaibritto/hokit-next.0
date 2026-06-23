import { VALIDATION_RULES } from "@hokit/metadata/keys"
import type {
    RegisteredValidationRule,
    SnippetConfig,
    ValidationIssue,
    ValidationResult
} from "@hokit/types"

import { SnippetFields } from "./schemas/snippet-fields"
import { validateObject } from "./validate-object"

export function validateSnippets(snippets: SnippetConfig[]): ValidationResult {
    const issues: ValidationIssue[] = []

    for (const [snippetIndex, snippet] of snippets.entries()) {
        issues.push(
            ...validateObject(SnippetFields, snippet).map((issue) => ({
                ...issue,
                snippetIndex
            }))
        )
    }

    const rules = Reflect.getMetadata(VALIDATION_RULES, SnippetFields) ?? []
    const uniqueRules = (rules as RegisteredValidationRule[]).filter(
        (item) => item.rule.type === "unique"
    )

    for (const item of uniqueRules) {
        const field = String(item.propertyKey)
        const seen = new Set<unknown>()

        for (const [snippetIndex, snippet] of snippets.entries()) {
            const value = snippet[field as keyof SnippetConfig]

            if (value === undefined || value === null) {
                continue
            }

            if (seen.has(value)) {
                issues.push({
                    field,
                    code: "UNIQUE",
                    message: item.rule.message ?? `${field} must be unique.`,
                    snippetIndex
                })
            }

            seen.add(value)
        }
    }

    return {
        valid: issues.length === 0,
        issues
    }
}
