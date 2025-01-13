# TypeScript Package (TSP)

**TypeScript Package** (tsp), scaffolds and build **Typescript** sources to **EcmaScript modules** and publish them as modular packages to **NPM** or **JSR**.

## Init a new library

First, create the associated **git repository** and clone it.

Run this command in git trunk :
```bash
npx @reflex-stack/tsp init
```

## Created files

```
├─ dist/
├─ src/
│  ├─ submodule
│  │  └─ index.ts
│  └─ index.ts
├─ tests/
│  └─ test.js
├─ .gitignore
├─ .npmignore
├─ LICENCE ( if MIT )
├─ package.json
├─ package-lock.json
├─ README.md
└─ tsconfig.json
```

## Available commands

#### Build sources
```shell
npm run build
```
- Will clear `./dist`, build sources from `.ts` files to `.js` and `.d.ts` files.
- Will generate size report and generate `./reports` directory with JSON and SVG files.

> Run `npm run build --noSizeReport`

#### Test
- `npm run test`
> Will clear `./dist`, build sources and run tests. No size report.

#### Publish
- `npm run publish`
> Will clear `./dist`, build sources and run tests, and start publish process.
> This will ask you how to upgrade package.json version, push to git and npm.


## Size report
- TODO SVG doc
- TODO JSON doc

## tsconfig
- TODO doc, explain forbidden properties

## TSP config
- TODO tsp config

## Next
- TODO config override from package
