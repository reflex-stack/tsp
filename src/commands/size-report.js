import { execAsync } from "@zouloux/cli"
import { Directory, File } from "@zouloux/files"
import { statSync, writeFileSync } from 'node:fs'
import brotliSize from "brotli-size"
import { join, relative } from "node:path";
import { naiveHumanFileSize } from "../utils.js";


const keepClassNames = false;
const keepFunctionNames = false;

const defaultTerserOptions = [
	// Compress and shorten names
	'--compress', [
		`ecma=2017`,
		'passes=3',
		`keep_classnames=${keepClassNames}`,
		`keep_fnames=${keepFunctionNames}`,
		'dead_code=true',
		'unsafe_arrows=true',
		'unsafe_methods=true',
		'unsafe_undefined=true',
		'keep_fargs=false',
		'conditionals=false'
	].join(","),
	// Mangle variables and functions
	'--mangle', [
		'toplevel=true',
		`keep_classnames=${keepClassNames}`,
		`keep_fnames=${keepFunctionNames}`
	].join(","),
	// Mangle properties starting with an underscore
	`--mangle-props`, [`regex=/^_/`].join(','),
	// Set env as production for dead code elimination
	`-d 'process.env.NODE_ENV="production"'`,
	// Threat as module (remove "use strict")
	'--module',
	'--toplevel',
];


/**
 * Compress and check brotli sizes
 * @param bundles array [".", "./submodule"]
 * @param config tsp config
 * @returns {Promise<*[]>}
 */
export async function sizeReport ( bundles, config ) {
	// Browse all bundles
	// A bundle is defined by the "export" property of package.json
	// The module resolution does not exist and all files in the bundle'e directory
	// Is considered part of the bundle.
	const allBundleSizes = []
	for ( const bundlePath of bundles ) {
		// Get all built JS files of this bundle directory
		// Bundle directories are relative to dist
		const bundleDirectory = new Directory( join( config.cwd, config.dist, bundlePath ) )
		let allFiles = await bundleDirectory.children('file')
		allFiles = allFiles
			.filter( f => f.isFile() && f.extensions?.[0]?.toLowerCase() === "js" )
			.map( f => f.path )
		const bundleName = bundlePath.replace(/^\.\//, '')
		const bundleSizes = {
			name: bundleName === "." ? "main" : bundleName,
			files: [],
			sizes: [0, 0, 0],
		}
		for ( const filePath of allFiles ) {
			const relativeFilePath = relative( join(config.cwd, config.dist), filePath )
			const fileReport = {
				path: relativeFilePath,
				sizes: []
			}
			const output = `tmp/${relativeFilePath}`
			// Weight original js file ( not compressed )
			const size0 = statSync(filePath).size
			// Minify using terser
			const command = [ "terser", ...defaultTerserOptions, `-o ${output}`, `-- ${filePath}` ].join(" ")
			await execAsync(command, 3)
			// Weight minified file size
			const size1 = statSync(output).size
			// Weight compressed file size
			const size2 = brotliSize.fileSync( output )
			fileReport.sizes = [ size0, size1, size2 ]
			// Count for total bundle size
			bundleSizes.sizes[0] += size0
			bundleSizes.sizes[1] += size1
			bundleSizes.sizes[2] += size2
			// Register this file report
			bundleSizes.files.push( fileReport )
		}
		allBundleSizes.push(bundleSizes)
	}
	// Delete temp directory
	const tmp = new Directory( join( config.cwd, config.tmp ) )
	await tmp.delete()

	return allBundleSizes
}

export async function cleanSizeReports ( config ) {
	const dir = new Directory( join(config.cwd, config.reports) )
	await dir.ensureParents()
	await dir.clean()
}

export function generateJSON ( sizeReport, config ) {
	writeFileSync(
		join(config.cwd, config.reports, 'size-report.json'),
		JSON.stringify( sizeReport ),
		{ encoding: 'utf-8' }
	)
}

export async function generateSVGs ( sizeReport, config ) {
	for ( const bundle of sizeReport ) {
		const size = bundle.sizes[2]
		const sizeContent = naiveHumanFileSize( size )
		for ( const scheme of ["light", "dark"] ) {
			const bitPath = join( config.cwd, config.reports, `${bundle.name}-${scheme}.svg` )
			const svgBitFile = new File( bitPath );
			svgBitFile.content( () => [
				`<svg width="${sizeContent.length * 10}" height="22" xmlns="http://www.w3.org/2000/svg">`,
				`<style> text { fill: ${scheme === "dark" ? "white" : "black" }; font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; }</style>`,
				`<text y="21">${sizeContent}</text>`,
				`</svg>`,
			].join(""))
			await svgBitFile.ensureParents()
			await svgBitFile.save();
		}
	}
}
