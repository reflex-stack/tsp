# TypeScript Package (tsp)

**TypeScript Package** (tsp), scaffolds and build **Typescript** sources to **EcmaScript modules** and publish them as modular packages to **NPM** or **JSR**.

**Features :**
- It uses `tsc` to compile from ts to js and check errors
- Generates `.d.ts` to keep types when used
- Scaffold new packages in 1 minute
- Testing lib pre-installed, can also use your own or skip tests
- Generating size report as SVG for **README.md** inclusion ( ex : <picture style="display: inline-block"><source media="(prefers-color-scheme: dark)" srcset="./tests/example-package/reports/main-dark.svg"><img src="./tests/example-package/reports/main-light.svg"></picture> ) 
- Compatible with latest **Node** / **Bun** / **Deno** and all bundlers with ecma specification
- Publishing under `.js` and `.d.ts` helps having better performances in your projects ( typescript is faster ), event if **Bun** or **Deno** support Typescript by default.

Check example on [NPM](https://www.npmjs.com/package/@reflex-stack/tsp-example) and [GitHub](https://github.com/reflex-stack/tsp/tree/main/tests/example-package)

## Init a new TypeScript Package

First, create the associated **git repository** and clone it ( optional ).

Then, run this command the cloned directory :
```bash
npx @reflex-stack/tsp init
```

#### Created files

This will ask some questions and create those files. It contains 1 **submodule** example and a simple test implementation.

```
├─ dist/
├─ src/
│  ├─ submodule
│  │  └─ index.ts
│  └─ index.ts
├─ tests/
│  └─ test.js
│  └─ tsconfig.json ( to have correct typings in test.js )
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

**TSP** can generate size reports with brotli compression. It generate :
- 2 svgs for root module
- 2 svgs by submodule
- 2 svgs for total if you have submodules

There are 2 svgs generated, for dark and light mode, to be included in the README.md, on **GitHub** and **NPM**.

> When scaffolded, an example of SVG inclusion is generated in README.md

**TSP** can also generate a json size report if needed ( default is set to false )

## TSP config
TSP config is in the generated `package.json` under the `"tsp"` node

```json5
{
  "tsp": {
	// Can set to "bun" or "deno" 
	"runtime": "node",
	// If you change them, you should update tsconfig.json file
	"src": './src',
	"dist": './dist',
	"tests": './tests',
	"tmp": './tmp',
	// Add your test files here
	"test-files": ['test.js'],
	// Where size reports are generated
	"reports": './reports',
	"generate-json-report": false,
	"generate-svg-report": true
  },
}
```

## Next features
- [ ] docisfy integration
