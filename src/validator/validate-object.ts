import { VALIDATION_RULES } from "@hokit/metadata/keys"
import type { RegisteredValidationRule, ValidationIssue } from "@hokit/types"

/**
 * Valida um objeto individual usando uma classe-schema.
 */
export function validateObject<T extends object>(
    schema: Function,
    value: T
): ValidationIssue[] {
    const issues: ValidationIssue[] = []

    const rules = Reflect.getMetadata(VALIDATION_RULES, schema) ?? []

    for (const item of rules as RegisteredValidationRule[]) {
        const field = String(item.propertyKey)
        const fieldValue = value[field as keyof T]

        if (item.rule.type === "required") {
            const emptyString =
                typeof fieldValue === "string" && fieldValue.trim().length === 0

            const missing =
                fieldValue === undefined || fieldValue === null || emptyString

            if (missing) {
                issues.push({
                    field,
                    code: "REQUIRED",
                    message: item.rule.message ?? `${field} is required.`
                })
            }
        }

        if (item.rule.type === "min") {
            const min = item.rule.value as number

            if (Array.isArray(fieldValue) && fieldValue.length < min) {
                issues.push({
                    field,
                    code: "MIN",
                    message:
                        item.rule.message ??
                        `${field} must contain at least ${min} item(s).`
                })
            }
        }
    }

    return issues
}
