import { execStream } from "@zouloux/cli";
import { Directory } from "@zouloux/files";
import { join } from "node:path";


export async function clearOutput ( config ) {
	const dir = new Directory( join(config.cwd, config.dist) )
	await dir.ensureParents()
	await dir.clean()
}

export async function build ( config ) {
	const command = `tsc -p tsconfig.json --rootDir ${config.src} --outDir ${config.dist} --declaration true --noEmitOnError true --pretty`
	await execStream(command, { cwd: config.cwd }, () => {})
}
