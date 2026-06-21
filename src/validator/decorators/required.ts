import { VALIDATION_RULES } from "@hokit/metadata"
import type { RegisteredValidationRule } from "@hokit/types"
import "reflect-metadata"

export function Required(message = "Field is required."): PropertyDecorator {
    return (target, propertyKey) => {
        const ctor = target.constructor

        const rules = Reflect.getOwnMetadata(VALIDATION_RULES, ctor) ?? []

        rules.push({
            propertyKey,
            rule: {
                type: "required",
                message
            }
        } satisfies RegisteredValidationRule)

        Reflect.defineMetadata(VALIDATION_RULES, rules, ctor)
    }
}
