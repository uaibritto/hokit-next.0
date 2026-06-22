# Arquitetura do Hokit

Este documento acompanha os comentários do código e explica o fluxo completo sem
depender dos detalhes de implementação de cada arquivo.

## Fluxo principal

1. `loadConfig` executa e valida `hokit.config.ts`.
2. `loadModules` transpila os módulos TypeScript e os importa.
3. Os decorators registram classes, snippets e Todos em uma storage global.
4. `scanModules` transforma metadata em dados comuns e recupera arquivo/linha.
5. O compilador valida, remove snippets pendentes e aplica o preset.
6. O schema converte o resultado ao formato do editor.
7. O writer grava a saída por troca atômica de arquivo.

```text
Config → Loader → Decorators → Metadata → Scanner
                                         ↓
Arquivo ← Writer ← Schema ← Preset ← Validator/Compiler
```

## Pastas

- `src/cli`: parsing de argumentos e handlers dos comandos.
- `src/config`: leitura, validação e alteração da configuração.
- `src/decorators`: API declarativa usada nos módulos do usuário.
- `src/metadata`: estado compartilhado produzido pelos decorators.
- `src/loader`: transpila e executa módulos TypeScript.
- `src/scanner`: converte metadata em estruturas independentes de decorators.
- `src/validator`: regras declarativas e validação dos snippets.
- `src/build`: coordena compilação, presets, schemas e escrita.
- `src/docs`: gera documentação Markdown a partir dos snippets escaneados.
- `src/templates`: arquivos produzidos por `init` e `module`.
- `src/types`: contratos compartilhados entre todas as camadas.

## Decisões importantes

### Metadata global

O pacote público e a CLI são bundles diferentes. `Symbol.for` e `globalThis`
garantem que ambos enxerguem a mesma storage durante um build.

### Escrita atômica

Configurações, documentação e schemas são escritos em arquivo temporário e só
depois renomeados. Uma interrupção não deixa o destino parcialmente escrito.

### Todo

`@Todo` e `@Snippet` compartilham a mesma propriedade. O scanner preserva o
snippet para lint e documentação, enquanto o compilador o omite por padrão.

### Presets personalizados

Presets internos oferecem autocomplete, mas `PresetName` aceita strings próprias.
O projeto fornece a configuração completa em `customPresets`, mantendo overrides
e pipeline iguais aos presets oficiais.
