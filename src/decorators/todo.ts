import { todos } from "@hokit/metadata"

export function Todo(describe: string): PropertyDecorator {
    return (target, propertyKey) => {
        const ctor = target.constructor

        const moduleTodos =
            todos.get(ctor) ?? new Map<string | symbol, string>()

        moduleTodos.set(propertyKey, describe)
        todos.set(ctor, moduleTodos)
    }
}
