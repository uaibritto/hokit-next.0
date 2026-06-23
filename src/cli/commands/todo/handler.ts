import { snippetHandler } from "../snippet/handler"

export async function todoHandler(
    presetName?: string,
    prefix?: string,
    options: { list?: boolean } = {}
) {
    await snippetHandler(presetName, prefix, {
        ...(options.list === undefined ? {} : { list: options.list }),
        todo: true
    })
}
