export type LogLevel = "silent" | "error" | "warn" | "info" | "debug"

export const LOG_LEVEL_WEIGHT: Record<LogLevel, number> = {
    silent: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4
}
