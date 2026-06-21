import { VALIDATION_RULES } from "@hokit/metadata"
import type { RegisteredValidationRule } from "@hokit/types"
import "reflect-metadata"

export function Min(value: number, message?: string): PropertyDecorator {
    return (target, propertyKey) => {
        const ctor = target.constructor
        const rules = Reflect.getOwnMetadata(VALIDATION_RULES, ctor) ?? []

        rules.push({
            propertyKey,
            rule: {
                type: "min",
                value,
                message: message ?? `Field must have at least ${value} item(s).`
            }
        } satisfies RegisteredValidationRule)

        Reflect.defineMetadata(VALIDATION_RULES, rules, ctor)
    }
}
