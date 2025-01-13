# TypeScript Package (tsp)

**TypeScript Package** (tsp), scaffolds and build **Typescript** sources to **EcmaScript modules** and publish them as modular packages to **NPM** or **JSR**.

Features :
- It uses `tsc` to compile from ts to js and check errors
- Scaffold new packages in 1 minute
- Testing lib pre-installed, can also use your own or skip tests
- 

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
│  └─ tsconfig.json
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
- docisfy integration
