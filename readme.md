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
    └── react.ts
```

## Configuração

```ts
import { defineConfig } from "hokit"

export default defineConfig({
    cwd: "src/modules",
    presets: ["react"],
    target: "vscode",
    overrides: {
        react: {
            output: "dist/react.json"
        }
    }
})
```

| Opção       | Descrição                                       | Padrão                 |
| ----------- | ----------------------------------------------- | ---------------------- |
| `cwd`       | Diretório que contém os módulos                 | obrigatório            |
| `presets`   | Presets habilitados (`react` ou `empty`)        | obrigatório            |
| `target`    | Formato de saída (`vscode` ou `zed`)            | `vscode`               |
| `overrides` | Substituições de saída, escopos e transformação | configuração do preset |

Todo caminho de saída deve permanecer dentro do projeto.

## Módulos e snippets

```ts
import { Module, Snippet, Todo, type SnippetDefinition } from "hokit"

@Module({ preset: "react" })
export class ReactModule {
    @Snippet({
        name: "React functional component",
        prefix: "rfc",
        body: [
            "export function ${1:Component}() {",
            "    return <div>$0</div>",
            "}"
        ]
    })
    declare component: SnippetDefinition

    @Todo("Implementação pendente")
    declare pending: SnippetDefinition
}
```

Módulos que usam o mesmo preset são agregados no mesmo arquivo. Nomes e prefixos
devem ser únicos dentro do preset.

## CLI

### `hokit init`

Inicializa um projeto com configuração, TypeScript e um módulo React de exemplo.
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

Cria um módulo para um preset habilitado. Sem argumento, usa o primeiro preset da
configuração. Não sobrescreve módulos existentes.

```sh
hokit module react
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
