import { logger } from "@hokit/logger"

export function Min(length: number, message: string): PropertyDecorator {
    return (target: any, propertyKey: any) => {
        let key = target[propertyKey]

        const getter = () => key
        const setter = (value: string) => {
            if (value.length < length) {
                logger.error(message)
                return
            }

            key = value
        }

        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter
        })
    }
}
