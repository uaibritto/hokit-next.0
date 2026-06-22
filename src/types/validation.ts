export type ValidationRuleType = "required" | "unique" | "min"

export interface ValidationRule {
    type: ValidationRuleType
    value?: unknown
    message?: string
}

export interface RegisteredValidationRule {
    propertyKey: string | symbol
    rule: ValidationRule
}

export interface ValidationIssue {
    field: string
    message: string
    code: string
    snippetIndex?: number
    location?: import("./metadata").SourceLocation
}

export interface ValidationResult {
    valid: boolean
    issues: ValidationIssue[]
}
