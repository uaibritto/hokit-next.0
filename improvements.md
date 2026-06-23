# Improvements

- Quando hokit está instalado globalmente, o comando `hokit init` utiliza o npm por padrão para instalar as depêndencias, gostaria que esse padrão fosse modificado para utilizar essa ordem:

1. bun: https://bun.com/package-manager
2. nub https://nubjs.com/
3. pnpm https://pnpm.io/
4. npm https://www.npmjs.com/
5. yarn https://yarnpkg.com/

Caso o usuário não tenha, ai sim, ele usa o NPM.

- Remover a opção `target` da configuração do `hokit.config.ts`, hoje é uma opção que não faz nada.
- Adicionar a opção `output` na configuração do `hokit.config.ts`, que é o diretório onde os arquivos de saída serão gerados. Com isso removemos, de dentro do preset a responsabilidade de definir o diretório de saída para cada módulo. O nome do arquivo gerado deverá ser o nome do preset. Por exemplo, se o preset for `astro`, o arquivo gerado será `[output]/astro.json`. Isso torna mais fácil a customização do diretório de saída.
- Adicionar a opção extend na configuração do `hokit.config.ts`, que é um objeto que contém as configurações para cada preset. Considero isso melhor do que a opção `customPresets`.
- Substituir o comando `hokit docs` por uma opção de configuração do `hokit.config.ts` para gerar a documentação automaticamente a cada build. Isso automatiza o processo de geração da documentação. Isso pode ser uma string "on" ou "off", caso utilizado como "on", o diretório padrão de saída deve ser `docs`. Ou pode ser um objeto, com as opções:

- `enbabled`: "on" | "off";
- `output`: string;

```ts
export default defineConfig({
    cwd: "src/modules",
    output: "dist/snippets",
    presets: ["tsx"],
    extend: {
        presets: {
            astro: {
                scopes: ["astro"],
                tags: ["web", "astro"],
                transform: (snippets) =>
                    snippets.filter((snippet) => snippet.template === false)
            }
        }
    }
    docs: "off",
})
```

---

## Template inicial:

Mudanças para o template inicial:

- inicia o diretório modules vazio;
- inicia o diretório templates vazio;
- presets em hokit.config.ts inicia com um array vazio;

- formatação dos arquivos:
    - imports devem ser separados da base de código por uma linha;

- scripts:
    - build: hokit build;
    - lint: hokit lint;
    - watch: hokit watch;
    - fmt: oxfmt;

- gitignore:
    - dist
    - node_modules
    - bin
    - \*.vsix
    - .DS_Store

## Templates gerados pela CLI:

### `hokit module --<preset>` :

    - `hokit module tsx`
    - `hokit module --tsx`

- Gera ou atualiza `src/modules/tsx.ts`;
- Gera ou atualiza `src/templates/tsx/index.ts`;
- Atualiza `hokit.config.ts` para incluir o preset.
- Deve haver uma linha em branco entre cada snippet para separação.

1. `src/modules/tsx.ts`

```ts
import { Module, Snippet, type SnippetDefinition } from "hokit"

@Module({ preset: "tsx" })
export class TsxModule {}
```

2. `src/templates/tsx/index.ts`

```ts
export const template = {}
```

3. `hokit.config.ts`

presets: ["tsx"]

---

### `hokit snippet --<preset> <prefix>` - `hokit snippet tsx raf` - `hokit snippet --tsx raf`

- Gera ou atualiza `src/modules/tsx.ts`;
- Gera ou atualiza `src/templates/tsx/index.ts`;
- Gera ou atualiza `src/templates/tsx/raf.ts`;
- Atualiza `hokit.config.ts` para incluir o preset.
- Deve haver uma linha em branco entre cada snippet para separação.

1. `src/modules/tsx.ts`

```ts
import { Module, Snippet, type SnippetDefinition } from "hokit"
import { template } from "@/templates/tsx/raf"

@Module({ preset: "tsx" })
export class TsxModule {
    @Snippet({
        name: "",
        prefix: "raf",
        body: template.raf,
        description: "",
        template: false
    })
    declare raf: SnippetDefinition
}
```

2. `src/templates/tsx/raf.ts`

```ts
export const raf = [""]
```

3. `src/templates/tsx/index.ts`

```ts
import { raf } from "./raf"

export const template = {
    raf
}
```

---

### `hokit todo --<preset> <prefix>`: - `hokit todo tsx raf` - `hokit todo --tsx raf`

- Gera ou atualiza `src/modules/tsx/raf.ts`;
- Gera ou atualiza `src/templates/tsx/raf.ts`;
- Gera ou atualiza `src/templates/tsx/index.ts`;
- Atualiza `hokit.config.ts` para incluir o preset.

1. `src/modules/tsx.ts`

```ts
import { Module, Snippet, Todo, type SnippetDefinition } from "hokit"
import { template } from "@/templates/tsx/raf"

@Module({ preset: "tsx" })
export class TsxModule {
    @Todo("")
    @Snippet({
        name: "",
        prefix: "raf",
        body: template.raf,
        description: "",
        template: false
    })
    declare raf: SnippetDefinition
}
```

2. `src/templates/tsx/raf.ts`

```ts
export const raf = [""]
```

3. `src/templates/tsx/index.ts`

```ts
import { raf } from "./raf"

export const template = {
    raf
}
```

### `package.json` sugerido:

```json
{
    "name": "my-snippets",
    "displayName": "",
    "version": "1.0.0",
    "description": "",
    "categories": ["Snippets"],
    "keywords": ["snippets"],
    "homepage": "https://github.com/user/repo",
    "bugs": {
        "url": "https://github.com/user/repo/issues"
    },
    "license": "MIT",
    "maintainers": ["Name <email>"],
    "repository": {
        "type": "git",
        "url": "https://github.com/user/repo.git"
    },
    "publisher": "publisher",
    "type": "module",
    "scripts": {
        "build": "hokit build",
        "lint": "hokit lint",
        "watch": "hokit watch",
        "fmt": "oxfmt",
        "package": "vsce package --out <out>",
        "vscode:pub": "vsce publish <.vsix>",
        "cursor:pub": "ovsx publish <.vsix>"
    },
    "dependencies": {
        "hokit": "latest"
    },
    "devDependencies": {
        "@vscode/vsce": "latest",
        "ovsx": "latest",
        "oxfmt": "latest",
        "typescript": "latest"
    },
    "contributes": {
        "snippets": [
            {
                "language": "",
                "path": ""
            }
        ]
    },
    "icon": "icon.png",
    "engines": {
        "vscode": "^1.60.0"
    }
}
```

## CLI

Adicionei algumas melhorias para a CLI:

- Remoção do comando `docs` em fazer da configuração do `hokit.config.ts`;
- Adicionei o comando `todo` removendo do module e snippet a opção `todo`;
- Hoje não tenho certeza do que exatamente o comando `clean` faz! Caso esse comando não agregue tanto valor, considere remove-lo.

- hokit help
    - hokit --help
    - hokit --version

- hokit init
- hokit build --include-todo
- hokit watch

- hokit module --<preset>
    - hokit module tsx
    - hokit module --tsx
    - hokit module --list

- hokit snippet --<preset> <prefix>
    - hokit snippet tsx raf
    - hokit snippet --tsx raf
    - hokit snippet --tsx --list
    - hokit snippet --list

- hokit todo --<preset> <prefix>
    - hokit todo tsx raf
    - hokit todo --tsx raf
    - hokit todo --tsx --list
    - hokit todo --list

- hokit info

- hokit lint
    - hokit lint --fix
    - hokit lint --json

- hokit doctor

- hokit clean

### Readme

Atualize o README.md para incluir as novas opções e melhorias.
