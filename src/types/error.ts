/** Campos comuns a todos os erros de domínio do Hokit. */
export interface HokitErrorOptions {
    code: string
    message: string
    hint?: string
    cause?: unknown
}
