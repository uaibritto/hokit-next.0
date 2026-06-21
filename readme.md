# Hokit

Compilador declarativo de snippets baseado em decorators.

## Início rápido

```sh
npm install --save-dev hokit typescript
npx hokit init
npx hokit build
```

O `init` cria os templates, sem sobrescrever arquivos existentes, e instala as
dependências com o gerenciador que executou a CLI:

```txt
.editorconfig
.gitignore
.oxfmtrc.json
.vscode/settings.json
hokit.config.ts
package.json
tsconfig.json
src/
└── modules/
    └── tsx.ts
```

## Configuração

```ts
import { defineConfig } from "hokit"

export default defineConfig({
    cwd: "src/modules",
    presets: ["tsx"],
    target: "vscode",
    overrides: {
        tsx: {
            output: "dist/tsx.json"
        }
    }
})
```

| Opção       | Descrição                                       | Padrão                 |
| ----------- | ----------------------------------------------- | ---------------------- |
| `cwd`       | Diretório que contém os módulos                 | obrigatório            |
| `presets`   | Presets habilitados                             | obrigatório            |
| `target`    | Formato de saída (`vscode` ou `zed`)            | `vscode`               |
| `overrides` | Substituições de saída, escopos e transformação | configuração do preset |

Todo caminho de saída deve permanecer dentro do projeto.

Presets disponíveis: `tsx`, `jsx`, `swift`, `kotlin`, `python`, `php`, `ruby`,
`rust`, `zig`, `c`, `cpp`, `javascript` e `empty`. Cada preset de linguagem gera
`dist/<linguagem>.json`; `overrides` permite alterar saída, escopos ou
transformação individualmente.

## Módulos e snippets

```ts
import { Module, Snippet, Todo, type SnippetDefinition } from "hokit"

@Module({ preset: "tsx" })
export class TsxModule {
    @Snippet({
        name: "tsx",
        prefix: "tsx",
        body: ["$0"]
    })
    declare tsx: SnippetDefinition

    @Todo("Future implementation")
    declare pending: SnippetDefinition
}
```

Módulos que usam o mesmo preset são agregados no mesmo arquivo. Nomes e prefixos
devem ser únicos dentro do preset.

Na saída do VS Code, cada snippet recebe o `scope` do preset. Quando
`description` não é informada, o nome do snippet é usado; `template` é convertido
para `isFileTemplate` e assume `false` por padrão.

## CLI

### `hokit init`

Inicializa um projeto com configuração, TypeScript e um módulo TSX de exemplo.
Arquivos existentes são preservados.

```sh
hokit init
```

### `hokit build`

Carrega os módulos TypeScript, valida os snippets e grava os arquivos dos presets.
A escrita é atômica: um erro não deixa um arquivo parcialmente gerado.

```sh
hokit build
```

### `hokit module [preset]`

Cria um módulo para um preset. Se necessário, habilita automaticamente o preset
em `hokit.config.ts`. Sem argumento, usa o primeiro preset da configuração. Não
sobrescreve módulos existentes. Os templates não incluem `@Todo`; use `--todo`
para adicioná-lo depois do último snippet. Sem informar o preset, o primeiro da
configuração é utilizado.

```sh
hokit module tsx
hokit module tsx --todo
hokit module --todo
hokit module --list
```

### `hokit lint [--fix]`

Executa as regras `required`, `min` e `unique` em todos os módulos. A opção
`--fix` corrige de forma segura espaços externos em textos e adiciona `$0` a um
`body` vazio. Problemas ambíguos, como nomes duplicados, continuam sendo
reportados para correção manual.

```sh
hokit lint
hokit lint --fix
```

### `hokit doctor`

Verifica a versão do Node.js, a configuração, o diretório de módulos, os presets
e se todos os caminhos de saída são seguros.

```sh
hokit doctor
```

### `hokit clean`

Remove somente os arquivos de saída declarados pelos presets, sempre dentro do
diretório do projeto.

```sh
hokit clean
```

### `hokit info`

Mostra a versão do Hokit, diretório do projeto, target e presets ativos.

```sh
hokit info
```

### `hokit watch`

Executa um build inicial e recompila quando um módulo muda. Alterações rápidas
são enfileiradas para impedir builds concorrentes.

```sh
hokit watch
```

### `hokit help`

Exibe a referência resumida dos comandos.

```sh
hokit help
hokit --help
hokit --version
```

## Validação personalizada

Os decorators de validação também estão disponíveis pelo subpath público:

```ts
import { Min, Required, Unique } from "hokit/validator"
```

## Arquitetura

```txt
Configuração + módulos TypeScript
              ↓
      Loader de decorators
              ↓
     Registro global de metadata
              ↓
 Scanner → Validação → Preset → Schema
              ↓
       Escrita atômica segura
```

O registro global mantém a mesma metadata entre o bundle público e o bundle da
CLI. A validação acontece antes de qualquer arquivo ser substituído.
