import { TODOS_METADATA } from "@hokit/metadata"
import "reflect-metadata"

interface RegisteredTodo {
    propertyKey: string | symbol
    message: string
}

export function Todo(message: string): PropertyDecorator {
    return (target, propertyKey) => {
        const ctor = target.constructor
        const todos = Reflect.getOwnMetadata(TODOS_METADATA, ctor) ?? []

        todos.push({
            propertyKey,
            message
        } satisfies RegisteredTodo)

        Reflect.defineMetadata(TODOS_METADATA, todos, ctor)
    }
}
