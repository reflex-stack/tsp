import { nicePrint, askInput, askList, newLine, oraTask, execAsync } from "@zouloux/cli"
import { getConfig } from "../config.js";
import { getGitRemoteUrl, getGitSubdirectory, getTSPPackageJson } from "../utils.js";
import { existsSync, writeFileSync } from "node:fs";
import { Stach } from "stach";
import { mkdirSync } from "fs";
import { join } from "node:path";

const licenseTemplate = `MIT License

Copyright (c) {{ year }} {{ authorName }}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`

const readmeTemplate = `# {{ packageTextName }}
Main bundle is <picture style="display: inline-block"><source media="(prefers-color-scheme: dark)" srcset="./reports/main-dark.svg"><img src="./reports/main-light.svg"></picture>
and optional submodule is only <picture style="display: inline-block"><source media="(prefers-color-scheme: dark)" srcset="./reports/submodule-dark.svg"><img src="./reports/submodule-light.svg"></picture>

## Install

\`npm i {{ packageNPMName }}\`

## Usage

##### Main module
- \`import { ... } from "{{ packageNPMName }}"\`

##### Sub module
- \`import { ... } from "{{ packageNPMName }}/submodule"\`

## Build commands

##### Build
- \`npm run build\`
##### Test
- \`npm run test\`
##### Publish
- \`npm run publish\`

---
## TSP
This package has been created with [tsp](https://github.com/reflex-stack/tsp)
`

const tsconfigTemplate = `{
	"compilerOptions": {
		// Compilation level target
		// If using a bundler in your project it should be the previous or current year
		"target" : "{{esLevel}}",
		// Allow types to be resolved in tests
		"checkJs": true,
		"allowJs": true,
		// TS libs used, include needed lib.
		// It should contain the target and "DOM" if it runs in the browser
		// https://www.typescriptlang.org/tsconfig/#lib
		"lib": [{{libs}}],
		// Module config, you should not change it
		"module": "NodeNext",
		"moduleResolution": "node",
		"isolatedModules": false,
		"allowImportingTsExtensions": false,
		// Compiler config
		"strict": {{tsStrict}},
		"useDefineForClassFields" : true,
		"allowSyntheticDefaultImports": true,
		// ---
		// Feel free to configure this file for your needs
		// https://www.typescriptlang.org/tsconfig/
		// ---
		// Forbidden props are :
		// - rootDir
		// - outDir
		// - declaration
		// - noEmitOnError
		// - pretty
	},
	// Compile only from src, avoid looping in dist
	"exclude": ["node_modules", "dist"],
	"include": ["src/**/*"],
}`

const tsconfigTestTemplate = `{
	"extends": "../tsconfig.json",
	"exclude": ["../node_modules", "../dist", "../src"],
	"include": ["./**/*"]
}`

const gitIgnoreTemplate = `.DS_Store
.idea
tmp
node_modules
dist
`

const npmIgnoreTemplate = `.DS_Store
.idea
LICENSE
tmp/
src/
.github/
docs/
`

const rootIndexTs = `// Root index file, export elements here
// Import nothing from submodule to keep things separated
export function randomFunction () {
  return 5
}
`
const subModuleIndexTs = `// Sub-module index file, export elements here
// You can import elements from root

// Always import with the js extension, event in ts files
import { randomFunction } from "../index.js"

export function subRandomFunction () {
	return randomFunction() * 12
}
`

const testFile = `// If you have no tests, uncomment this
// console.log("No test implemented.")
// process.exit(0)

// Import your code from dist directory, tests are not built on purpose
import { randomFunction } from "../dist/index.js"
import { subRandomFunction } from "../dist/submodule/index.js"
// Import small testing lib from tsp
import { describe, it, expect, startTest } from "@reflex-stack/tsp/tests"

const endTest = startTest()

describe("Main module", () => {
	it("Should call random", () => {
		const rootResult = randomFunction()
		expect(rootResult).toBe(5)
	})
})

describe("Sub module", () => {
	it("Should call sub random", () => {
		const subResult = subRandomFunction()
		expect(subResult).toBe(60)
	})
	// Test error example
	// it("Should fail", () => {
	// 	expect(5).toBe(12)
	// })
})

endTest()
`

export async function init () {
	// Check if some critical file already exists and warn before overriding
	if ( existsSync("package.json") ) {
		nicePrint(`{o}package.json is already existing. Continuing will override files in this directory.`)
		const sure = await askList("Are you sure to continue ?", ["Yes", "No"], { defaultIndex: 1, returnType: "index" })
		if ( sure === 1 )
			return
	}
	// Get git remote
	const config = getConfig()
	const remoteURL = getGitRemoteUrl( config.cwd )
	const relativeGitSubDirectory = getGitSubdirectory()
	if ( !remoteURL ) {
		nicePrint(`{o}Before scaffolding your TypeScript package, you should create the associated git repository, and cd in the correct sub-directory.`)
	}
	else {
		nicePrint(`{d}Git origin is {/}${remoteURL}`)
		if ( relativeGitSubDirectory ) {
			nicePrint(`{d}Git sub directory is {/}${relativeGitSubDirectory}. This will be saved to package.json.`)
		}
	}
	newLine()
	const options = { remoteURL, relativeGitSubDirectory }
	options.packageTextName = await askInput(`Package name, in plain text {d}ex : My Package`, { notEmpty: true })
	options.packageNPMName = await askInput(`Package name, for NPM, with namespace {d}ex : @mynamespace/mypackage`, { notEmpty: true })
	options.authorName = await askInput(`Author name`, { notEmpty: true })
	options.licenseName = await askInput(`License name`, { defaultValue: "MIT" })
	options.esLevel = await askInput(`ES Level for tsconfig`, { defaultValue: "es2023" })
	options.tsStrict = await askList(`Use strict Typescript?`, ["Yes", "No"], { defaultIndex: 0, returnType: "index" })
	options.domAccess = await askList(`Will it have access to DOM?`, ["Yes", "No"], { defaultIndex: 0, returnType: "index" })
	options.svgReport = await askList(`Export SVG size report on build for README.md?`, ["Yes", "No"], { defaultIndex: 0, returnType: "index" })
	options.jsonReport = await askList(`Export JSON size report on build?`, ["Yes", "No"], { defaultIndex: 1, returnType: "index" })
	options.domAccess = options.domAccess === 0
	options.tsStrict = options.tsStrict === 0
	options.svgReport = options.svgReport === 0
	options.jsonReport = options.jsonReport === 0
	options.libs = [options.domAccess ? "DOM" : "", options.esLevel]
		.filter( Boolean )
		.map( s => `"${s}"`)
	options.tspVersion = getTSPPackageJson().version
	// Generate package json
	const packageJson = {
		name: options.packageNPMName,
		version: "0.1.0",
		type: "module",
		author: options.authorName,
		license: options.licenseName,
		main: "./dist/index.js",
		types: "./dist/index.d.ts",
		exports: {
			".": {
				types: "./dist/index.d.ts",
				default: "./dist/index.js"
			},
			"./submodule": {
				types: "./dist/submodule/index.d.ts",
				default: "./dist/submodule/index.js"
			}
		},
		tsp: {
			runtime: "node",
			src: './src',
			dist: './dist',
			tests: './tests',
			"test-files": ['test.js'],
			tmp: './tmp',
			reports: './reports',
			"generate-json-report": options.jsonReport,
			"generate-svg-report": options.svgReport
		},
		scripts: {
			build: "tsp build",
			test: "tsp build --noSizeReport && tsp test --noIntro",
			publish: "tsp build && tsp test --noIntro && tsp publish --noIntro"
		},
		dependencies: {
			"@reflex-stack/tsp": options.tspVersion
		}
	}
	// Inject git remote
	if ( options.remoteURL ) {
		packageJson.repository = {
			type: "git",
			url: options.remoteURL
		}
		// Add subdirectory for package.json and SVG targeting in README.md on NPMJs
		if ( options.relativeGitSubDirectory ) {
			packageJson.repository.directory = options.relativeGitSubDirectory
		}
	}
	// Inject year
	options.year = new Date().getFullYear()
	// Create directories
	mkdirSync(config.tests, { recursive: true })
	mkdirSync(config.dist, { recursive: true })
	mkdirSync(join(config.src, "submodule"), { recursive: true })
	// Generate root files
	if ( options.licenseName === "MIT" )
		writeFileSync("LICENSE", Stach(licenseTemplate, options))
	writeFileSync("README.md", Stach(readmeTemplate, options))
	writeFileSync(".gitignore", Stach(gitIgnoreTemplate, options))
	writeFileSync(".npmignore", Stach(npmIgnoreTemplate, options))
	writeFileSync("tsconfig.json", Stach(tsconfigTemplate, options))
	writeFileSync("package.json", JSON.stringify(packageJson, null, 2))
	// Generate src files
	writeFileSync(join(config.src, "index.ts"), Stach(rootIndexTs, options))
	writeFileSync(join(config.src, "submodule", "index.ts"), Stach(subModuleIndexTs, options))
	// Generate tests file
	writeFileSync(join(config.tests, "test.js"), Stach(testFile, options))
	writeFileSync(join(config.tests, "tsconfig.json"), Stach(tsconfigTestTemplate, options))
	// Install dependencies
	await oraTask("Installing dependencies", async () => {
		await execAsync(`npm i typescript terser`, false, { cwd: config.cwd })
	})
	// Show commands
	newLine()
	nicePrint(`{b/g}Package ${options.packageNPMName} created ✨`)
	newLine()
	nicePrint(`Available commands :`)
	nicePrint(`- npm run build`)
	nicePrint(`- npm run test`)
	nicePrint(`- npm run publish`)
	newLine()
}
