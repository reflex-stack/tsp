import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";
import { newLine, nicePrint } from "@zouloux/cli";
import { getConfig } from "./config.js";
import { execSync } from 'child_process'

export const getScriptDirectoryName = (importMetaUrl) => dirname(fileURLToPath(importMetaUrl))

export function getUserPackageJson ( noThrow = false ) {
	// Get default config to have the cwd
	const config = getConfig()
	const filePath = join(`${config.cwd}/package.json`)
	if (!existsSync(filePath)) {
		if ( noThrow )
			return null
		nicePrint(`{b/r}File ${filePath} not found in ${config.cwd}.`, { code: 1 })
	}
	return readJsonFile( filePath )
}

export function getTSPPackageJson () {
	const tspDirectory = getScriptDirectoryName(import.meta.url)
	return readJsonFile( join(`${tspDirectory}/../package.json`), )
}

export function readJsonFile ( filePath ) {
	const jsonAsText = readFileSync( filePath, { encoding: 'utf-8' } )
	return JSON.parse( jsonAsText.toString() )
}

export function showIntroMessage ( noThrow = false ) {
	// User package json
	const userPackageJson = getUserPackageJson( noThrow )
	if ( userPackageJson )
		nicePrint(`{w}Working on {w/b}${userPackageJson.name}{d} {w}v${userPackageJson.version}`)
	// tsp package json
	const tspPackageJson = getTSPPackageJson()
	nicePrint(`{w}Using {w/b}${tspPackageJson.name}{d} {w}v${tspPackageJson.version}`)
	newLine()
}

/**
 * Show bytes report as bytes or kilobytes.
 * Very naive implementation.
 */
export function naiveHumanFileSize ( size ) {
  if ( size > 1000 ) // is it base 10 or ^2 ?
    size = ~~(size / 10) / 100 + 'k'
  return size + 'b'
}

// Get git remote repo URL if in a git repo
export function getGitRemoteUrl ( cwd ) {
  try {
    return execSync('git remote get-url origin', { stdio: 'pipe', cwd }).toString().trim();
  }
  catch {
    return '';
  }
}
