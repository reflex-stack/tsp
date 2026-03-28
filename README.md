# TypeScript Package (tsp)

**TypeScript Package** (tsp), scaffolds and build **Typescript** sources to **EcmaScript modules** and publish them as modular packages to **NPM** or **JSR**.

**Features :**
- It uses `tsc` to compile from ts to js and check errors
- Generates `.d.ts` to keep types when used
- Scaffold new packages in 1 minute
- Testing lib pre-installed, can also use your own or skip tests (will use `bun:test` if the runtime is Bun)
- Generating size report and replace them with tags in `README.md` for Npm and GitHub 
- Compatible with latest **Node** / **Bun** / **Deno** and all bundlers with ecma specification
- Publishing under `.js` and `.d.ts` [helps having better performances](https://x.com/mattpocockuk/status/1872945584761651432) in your projects.

Check example on [NPM](https://www.npmjs.com/package/@reflex-stack/tsp-bun-example) and [GitHub](https://github.com/reflex-stack/tsp/tree/main/tests/tsp-bun-example)

## Init a new TypeScript Package

First, create the associated **git repository** for your package and clone it (optional).

Then, run this command in the cloned directory. :

#### To create a package managed with Bun
```bash
bunx @reflex-stack/tsp init
```

#### To create a package managed with Node
```bash
npx @reflex-stack/tsp init
```
> If you create this package in a mono-repo, `cd` in the correct repository before running this command. The subdirectory is important for package.json to be in the right place. 

#### Created files

This will ask some questions and create those files. It contains 1 **submodule** example and a simple test implementation.

```
├─ dist/
├─ src/
│  ├─ submodule
│  │  └─ index.ts
│  └─ index.ts
├─ tests/
│  └─ test.(js|ts)
│  └─ tsconfig.json (if Node runtime, to have correct typings in test.js)
├─ .gitignore
├─ .npmignore
├─ LICENSE (if MIT)
├─ package.json
├─ package-lock.json
├─ README.md
└─ tsconfig.json
```

## Available commands

#### Build sources
```shell
bun run build
# or
npm run build
```
- Will clear `./dist`, build sources from `.ts` files to `.js` and `.d.ts` files.

> Run `npm run build --noSizeReport` to skip size report entirely.

#### Test
```bash
bun run test
# or
npm run test
```
> Will clear `./dist`, build sources and run tests. No size report.

#### Bump version
```bash
bun run bump
# or
npm run bump
```

> Will clear `./dist`, build sources, run tests, and create a new package version.
> You will be able to run `npm publish --access public` or `bun publish --access public` safely after that.


## Size report

**TSP** can generate size reports with brotli compression.

Use `<bundle-size id="{bundleID}">0b</bundle-size>` tags in your `README.md` to include size reports.
Replace `{bundleID}` with the name of the bundle you want to include.
Those tags will be replaced each time you run `npm run build`.

For the total bundle size, use `<bundle-size id="total">0b</bundle-size>`

> Works in GitHub and NPM.

**TSP** can also generate a json size report as `bundle-sizes.json` if needed (default is set to false)

## TSP config
TSP config is in the generated `package.json` under the `"tsp"` node

```json5
{
  "tsp": {
	// Can set to "node" or "deno" 
	"runtime": "bun",
	// If you change them, you should update tsconfig.json file
	"src": './src',
	"dist": './dist',
	"tests": './tests',
	"tmp": './tmp',
	// Add your test files here
	"test-files": ['test.ts'],
	// Where size reports are generated
	"generate-json-report": false
  },
}
```

## Next features
- [ ] Set other files than `README.md` in config for size report tags
- [ ] Docisfy integration
