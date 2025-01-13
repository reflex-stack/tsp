#!/usr/bin/env sh
':' //# comment; exec /usr/bin/env "${RUNTIME:-node}" "$0" "$@"


import { askInput, CLICommands, execAsync, nicePrint, oraTask, execSync, table, askList, newLine } from "@zouloux/cli";
import { build, clearOutput } from "./commands/build.js";
import { getUserPackageJson, naiveHumanFileSize, showIntroMessage } from "./utils.js";
import { cleanSizeReports, generateJSON, generateSVGs, sizeReport } from "./commands/size-report.js";
import { init } from "./commands/init.js";
import { getConfig } from "./config.js";
import { test } from "./commands/test.js";


// ----------------------------------------------------------------------------- COMMANDS

const commands = new CLICommands({
	noSizeReport: false,
	noIntro: false,
})

// Executed for all commands
commands.before((args, flags, commandName) => {
	if ( commandName !== "publish" && !flags.noIntro)
		showIntroMessage(!commandName || commandName === "init")
})

/**
 * INIT COMMAND
 * Create a new ecma-build library ready to be published.
 */
commands.add("init", async (args, flags, commandName) => {
	await init()
})

/**
 * BUILD COMMAND
 * options: --noSizeReport
 */
commands.add("build", async (args, flags) => {

	const userPackage = getUserPackageJson()
	const config = getConfig(userPackage)

	await oraTask('Cleaning output', async ( task ) => {
		await clearOutput( config )
		task.success()
	})

	await oraTask('Building with tsc', async ( task ) => {
		await build( config )
		task.success('Built ✨')
	}, (error, task) => {
		task.error()
		console.log(error.stdout ?? '')
		console.log(error.stderr ?? '')
	})

	// CLI Flag to disable reports and only build
	if ( flags.noSizeReport )
		return

	// Generate size report
	const report = await oraTask('Generating size report', async ( task ) => {
		// Extract "exports" from package.json and use them as bundle directories
		if ( typeof userPackage.exports !== "object" )
			nicePrint(`{b/r}Invalid export property in package.json.`)
		const bundles = Object.keys( userPackage.exports )
		// Generate report data
		let report = await sizeReport( bundles, config )
		task.success()
		return report
	})

	// Generate
	if ( config["generate-svg-report"] || config["generate-json-report"] ) {
		await oraTask('Generating report files', async ( task ) => {
			// Clean report directory
			await cleanSizeReports( config )
			// Generate JSON
			if ( config["generate-json-report"] )
				generateJSON( report, config )
			// Generate SVG files
			if ( config["generate-svg-report"] )
				await generateSVGs( report, config )
		})
	}

	// Print report table in CLI
	const tableData = [
		// Table header
		["Bundle", "Original size", "Brotli size"]
	]
	// Table helpers
	const tablePrint = s => nicePrint(s, { output: "return", newLine: false })
	const tableLine = () => tableData.push(['', '', ''])
	// Total bundle size
	let totalOriginalSize = 0
	let totalBrotliSize = 0
	// Browse report bundles
	report.forEach( bundleReport => {
		tableLine()
		// Count total bundle size
		totalOriginalSize += bundleReport.sizes[0]
		totalBrotliSize += bundleReport.sizes[2]
		// Show bundle report
		const isMainModule = bundleReport.name === "main"
		tableData.push([
			userPackage.name + (isMainModule ? "" : `/${bundleReport.name}`),
			tablePrint(`{b}${naiveHumanFileSize(bundleReport.sizes[0])}`),
			tablePrint(`{c/b}${naiveHumanFileSize(bundleReport.sizes[2])}`),
		])
		// Show sub-files reports
		const totalFiles = bundleReport.files.length
		bundleReport.files.map( (file, i) => {
			tableData.push([
				tablePrint(`{d}${i === totalFiles - 1 ? "└" : "├"}─ ${file.path}`),
				tablePrint(`{d}${naiveHumanFileSize(file.sizes[0])}`),
				tablePrint(`{d}${naiveHumanFileSize(file.sizes[2])}`),
			])
		})
	})
	// Show total if more than 1 bundle
	if ( report.length > 1 ) {
		tableLine()
		tableData.push([
			tablePrint(`{b}Total`),
			tablePrint(`{b}${naiveHumanFileSize(totalOriginalSize)}`),
			tablePrint(`{g/b}${naiveHumanFileSize(totalBrotliSize)}`),
		])
	}
	// Print table
	newLine()
	table(tableData, true, [20], '  ')
	newLine()
})

/**
 * TEST COMMAND
 */
commands.add("test", async (args, flags, commandName) => {

	const userPackage = getUserPackageJson()
	const config = getConfig(userPackage)

	await test( config )
})

commands.add("publish", async (args, flags, commandName) => {
	// Check NPM connected user
	await oraTask({text: `Connecting to npm`}, async task => {
		try {
			const whoami = await execAsync(`npm whoami`, 0)
			task.success(nicePrint(`Hello {b/c}@${whoami}`, {output: 'return'}).trim())
			return whoami
		}
		catch (e) {
			task.error(`Please connect to npm with ${chalk.bold('npm login')}`)
		}
	})
	// TODO : When test will build only needed files, move build after tests
	//  (to build all files after test has succeed)
	// Compile
	//await CLICommands.run(`build`, cliArguments, cliOptions)
	//await CLICommands.run(`test`, cliArguments, cliOptions)

	// todo : Internal build
	// todo : Run test command
	// todo : Internal run report
	// Prepare commands
	const userPackage = getUserPackageJson()
	let { version, name } = userPackage
	const config = getConfig( userPackage )
	const libraryExecOptions = { cwd: config.cwd };
	const stdioLevel = 3;
	// Test this library, and exit if it fails
	// Test passed, show current version and git status
	newLine()
	nicePrint(`📦 Current version of {b/c}${name}{/} is {b/c}${version}`)
	// Ask how to increment version
	const increment = await askList(`How to increment ?`, {
		patch: 'patch (0.0.X) - No new features, patch bugs or optimize code',
		minor: 'minor (0.X.0) - No breaking change, have new or improved features',
		major: 'major (X.0.0) - Breaking change',
		// Keep but publish on NPM (if already increment in package.json)
		keep: `keep (${ version }) - Publish current package.json version`,
		// Push on git but no lib publish
		push: `push - Push on git only, no npm publish`,
		// Skip this lib (no publish at all, go to next library)
		skip: `skip - Do not publish ${ name }`,
	}, { returnType: 'key' });
	// Go to next library
	if ( increment === 'skip' )
		return
	// execSync(`git status -s`, stdioLevel, libraryExecOptions)
	// Ask for commit message
	let message = await askInput(`Commit message ?`);
	message = message.replace(/["']/g, "'");
	// If we increment, use npm version
	if ( increment !== 'keep' && increment !== 'push' ) {
		version = execSync(`npm version ${increment} --no-git-tag-version -m"${name} - %s - ${message}"`, stdioLevel, libraryExecOptions).toString().trim();
	}
	// Add to git and push
	execSync(`git add .`, stdioLevel, libraryExecOptions);
	execSync(`git commit -m"${name} - ${version} : ${message}"`, stdioLevel, libraryExecOptions);
	execSync(`git push`, stdioLevel, libraryExecOptions);
	// Publish on npm as public
	// FIXME : Access public as an option for private repositories
	// Ingore script to avoid infinite loop (if "package.json.scripts.publish" == "tsbundle publish")
	if ( increment !== 'push' ) {
		execSync(`npm publish --access public --ignore-scripts`, stdioLevel, libraryExecOptions);
		nicePrint(`👌 {b/g}${name}{/}{g} Published, new version is {b/g}${version}`)
	}
	else {
		nicePrint(`👍 {b/g}${name}{/}{g} Pushed to git`)
	}
})

commands.start(function (commandName) {
	if ( commandName )
		return
	nicePrint(`{b/r}Command '${commandName}' not found`)
	newLine()
	nicePrint(`Available commands :`)
	commands.list().forEach( command => nicePrint(`- ${command}`) )
})
